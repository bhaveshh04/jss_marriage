import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { BOOL_COLS, DATE_COLS, INT_COLS, TEXT_COLS } from "./fields";
import type { Candidate, CandidateInput } from "./schema";
import { createHash } from "node:crypto";

let _sql: NeonQueryFunction<false, false> | null = null;
export function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set. Add it to .env.local");
  return (_sql ??= neon(process.env.DATABASE_URL, { fetchOptions: { cache: "no-store" } }));
}

const SELECT = [
  "c.id", "c.registration_no", "c.created_at::text AS created_at",
  ...TEXT_COLS.map((k) => `c.${k}`),
  ...INT_COLS.map((k) => `c.${k}`),
  ...DATE_COLS.map((k) => `to_char(c.${k}, 'YYYY-MM-DD') AS ${k}`),
  ...BOOL_COLS.map((k) => `c.${k}`),
  `(SELECT COALESCE(array_agg(p.slot::int ORDER BY p.slot), '{}'::int[]) FROM candidate_photos p WHERE p.candidate_id = c.id) AS photo_slots`,
  `(SELECT COALESCE(max(extract(epoch FROM p.updated_at))::int, 0) FROM candidate_photos p WHERE p.candidate_id = c.id) AS photo_v`,
].join(", ");

export type ListParams = { q?: string; gender?: string; status?: string; page?: number; pageSize?: number };

export async function listCandidates({ q, gender, status, page = 1, pageSize = 12 }: ListParams) {
  const where: string[] = ["c.is_deleted = FALSE"];
  const args: unknown[] = [];
  if (q?.trim()) {
    args.push(`%${q.trim().toLowerCase()}%`);
    const i = args.length;
    where.push(
      `(lower(c.candidate_name) LIKE $${i} OR lower(c.registration_no) LIKE $${i} OR lower(c.education) LIKE $${i}
        OR lower(c.kul) LIKE $${i} OR lower(c.job_place) LIKE $${i} OR lower(c.father_name) LIKE $${i})`
    );
  }
  if (gender === "groom" || gender === "bride") { args.push(gender); where.push(`c.gender = $${args.length}`); }
  if (status === "active") where.push("c.is_active = TRUE");
  if (status === "hidden") where.push("c.is_active = FALSE");
  const w = where.join(" AND ");
  const offset = (Math.max(1, page) - 1) * pageSize;

  const [rows, count] = await Promise.all([
    sql().query(`SELECT ${SELECT} FROM candidates c WHERE ${w} ORDER BY c.created_at DESC, c.id DESC LIMIT ${pageSize} OFFSET ${offset}`, args),
    sql().query(`SELECT count(*)::int AS n FROM candidates c WHERE ${w}`, args),
  ]);
  return { rows: rows as Candidate[], total: (count[0]?.n ?? 0) as number };
}

export async function getCandidate(id: number) {
  const rows = await sql().query(`SELECT ${SELECT} FROM candidates c WHERE c.id = $1 AND c.is_deleted = FALSE`, [id]);
  return (rows[0] as Candidate | undefined) ?? null;
}

export async function getDisplayCandidates(gender?: string) {
  const args: unknown[] = [];
  let extra = "";
  if (gender === "groom" || gender === "bride") { args.push(gender); extra = ` AND c.gender = $1`; }
  const rows = await sql().query(
    `SELECT ${SELECT} FROM candidates c WHERE c.is_deleted = FALSE AND c.is_active = TRUE${extra} ORDER BY c.created_at DESC, c.id DESC`,
    args
  );
  return rows as Candidate[];
}

export async function getStats() {
  const r = await sql().query(`
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE gender='groom')::int AS grooms,
           count(*) FILTER (WHERE gender='bride')::int AS brides,
           count(*) FILTER (WHERE is_active)::int AS on_screen,
           count(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM candidate_photos p WHERE p.candidate_id=candidates.id))::int AS no_photo
    FROM candidates WHERE is_deleted = FALSE`);
  return r[0] as { total: number; grooms: number; brides: number; on_screen: number; no_photo: number };
}

function dbValues(input: CandidateInput) {
  const out: Record<string, unknown> = {};
  for (const k of TEXT_COLS) out[k] = input[k];
  for (const k of INT_COLS) out[k] = input[k];
  for (const k of DATE_COLS) out[k] = input[k] || null;
  for (const k of BOOL_COLS) out[k] = input[k];
  return out;
}

async function savePhotos(id: number, photos: CandidateInput["photos"]) {
  if (!photos) return;
  for (const slot of ["1", "2", "3"] as const) {
    const v = photos[slot];
    if (v === undefined) continue;
    if (v === null) {
      await sql().query("DELETE FROM candidate_photos WHERE candidate_id=$1 AND slot=$2", [id, Number(slot)]);
    } else {
      const m = v.match(/^data:(image\/[a-z]+);base64,(.+)$/s)!;
      await sql().query(
        `INSERT INTO candidate_photos (candidate_id, slot, mime, data_b64) VALUES ($1,$2,$3,$4)
         ON CONFLICT (candidate_id, slot) DO UPDATE SET mime=EXCLUDED.mime, data_b64=EXCLUDED.data_b64, updated_at=now()`,
        [id, Number(slot), m[1], m[2]]
      );
    }
  }
}

export async function createCandidate(input: CandidateInput) {
  const [{ id }] = (await sql().query("SELECT nextval(pg_get_serial_sequence('candidates','id'))::int AS id")) as { id: number }[];
  const regNo = input.registration_no || `M${String(id).padStart(4, "0")}`;
  const v = dbValues(input);
  const cols = ["id", "registration_no", ...Object.keys(v)];
  const vals = [id, regNo, ...Object.values(v)];
  const idx = cols.indexOf("registration_date");
  if (!vals[idx]) vals[idx] = new Date().toISOString().slice(0, 10);
  await sql().query(`INSERT INTO candidates (${cols.join(",")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(",")})`, vals);
  try {
    await savePhotos(id, input.photos);
  } catch (e) {
    try { await sql().query("DELETE FROM candidates WHERE id = $1", [id]); } catch {}
    throw e;
  }
  return id;
}

export async function updateCandidate(id: number, input: CandidateInput) {
  const v = dbValues(input);
  if (!v.registration_date) v.registration_date = new Date().toISOString().slice(0, 10);
  const keys = ["registration_no", ...Object.keys(v)];
  const vals: unknown[] = [input.registration_no || `M${String(id).padStart(4, "0")}`, ...Object.values(v)];
  const set = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  await sql().query(`UPDATE candidates SET ${set}, updated_at = now() WHERE id = $${keys.length + 1} AND is_deleted = FALSE`, [...vals, id]);
  await savePhotos(id, input.photos);
}

export async function softDelete(id: number) {
  await sql().query("UPDATE candidates SET is_deleted = TRUE, updated_at = now() WHERE id = $1", [id]);
}

export async function toggleActive(id: number, active: boolean) {
  await sql().query("UPDATE candidates SET is_active = $2, updated_at = now() WHERE id = $1", [id, active]);
}

export async function getPhoto(id: number, slot: number) {
  const r = await sql().query(
    `SELECT p.mime, p.data_b64 FROM candidate_photos p JOIN candidates c ON c.id = p.candidate_id
     WHERE p.candidate_id=$1 AND p.slot=$2 AND c.is_deleted=FALSE`, [id, slot]);
  return (r[0] as { mime: string; data_b64: string } | undefined) ?? null;
}

// ─── Multi-user management ───────────────────────────────────────────────────

export type AppUser = { id: number; username: string; display_name: string; role: "admin" | "operator"; is_active: boolean; created_at: string };

const hashPw = (pw: string) => createHash("sha256").update(pw).digest("hex");

/** Ensure app_users table exists, seed from env if empty */
export async function ensureUsersTable() {
  await sql().query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id           SERIAL PRIMARY KEY,
      username     TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      role         TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin','operator')),
      is_active    BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  // Seed admin from env if table is empty
  const [{ n }] = await sql().query(`SELECT count(*)::int AS n FROM app_users`) as { n: number }[];
  if (n === 0) {
    const u = process.env.ADMIN_USERNAME || "admin";
    const p = process.env.ADMIN_PASSWORD || "admin123";
    await sql().query(
      `INSERT INTO app_users (username, password_hash, display_name, role) VALUES ($1,$2,$3,'admin') ON CONFLICT DO NOTHING`,
      [u, hashPw(p), "Administrator"]
    );
  }
}

export async function verifyDbUser(username: string, password: string): Promise<AppUser | null> {
  await ensureUsersTable();
  const rows = await sql().query(
    `SELECT id, username, display_name, role, is_active, created_at::text FROM app_users WHERE lower(username)=lower($1) AND password_hash=$2 AND is_active=TRUE`,
    [username, hashPw(password)]
  );
  return (rows[0] as AppUser | undefined) ?? null;
}

export async function listUsers(): Promise<AppUser[]> {
  await ensureUsersTable();
  const rows = await sql().query(`SELECT id, username, display_name, role, is_active, created_at::text FROM app_users ORDER BY id`);
  return rows as AppUser[];
}

export async function createUser(username: string, password: string, displayName: string, role: "admin" | "operator") {
  await ensureUsersTable();
  await sql().query(
    `INSERT INTO app_users (username, password_hash, display_name, role) VALUES ($1,$2,$3,$4)`,
    [username.trim(), hashPw(password), displayName.trim(), role]
  );
}

export async function updateUser(id: number, data: { display_name?: string; role?: string; is_active?: boolean; password?: string }) {
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (data.display_name !== undefined) { vals.push(data.display_name); sets.push(`display_name=$${vals.length}`); }
  if (data.role !== undefined) { vals.push(data.role); sets.push(`role=$${vals.length}`); }
  if (data.is_active !== undefined) { vals.push(data.is_active); sets.push(`is_active=$${vals.length}`); }
  if (data.password) { vals.push(hashPw(data.password)); sets.push(`password_hash=$${vals.length}`); }
  if (!sets.length) return;
  vals.push(id);
  await sql().query(`UPDATE app_users SET ${sets.join(",")}, updated_at=now() WHERE id=$${vals.length}`, vals);
}

export async function deleteUser(id: number) {
  await sql().query(`DELETE FROM app_users WHERE id=$1`, [id]);
}

// ─── Display config ───────────────────────────────────────────────────────────

export type DisplayConfigRow = { id: number; field_key: string; label_mr: string; label_en: string; enabled: boolean; sort_order: number };

const DEFAULT_DISPLAY_CONFIG: Omit<DisplayConfigRow, "id">[] = [
  { field_key: "birth_date",         label_mr: "जन्म तारीख",         label_en: "Date of Birth",       enabled: true,  sort_order: 1 },
  { field_key: "birth_time",         label_mr: "जन्म वेळ",           label_en: "Birth Time",           enabled: true,  sort_order: 2 },
  { field_key: "complexion",         label_mr: "वर्ण",               label_en: "Complexion",           enabled: true,  sort_order: 3 },
  { field_key: "blood_group",        label_mr: "रक्तगट",             label_en: "Blood Group",          enabled: true,  sort_order: 4 },
  { field_key: "father_name",        label_mr: "वडिलांचे नाव",       label_en: "Father's Name",        enabled: true,  sort_order: 5 },
  { field_key: "father_job_details", label_mr: "वडिलांचा व्यवसाय",  label_en: "Father's Occupation",  enabled: true,  sort_order: 6 },
  { field_key: "mother_name",        label_mr: "आईचे नाव",           label_en: "Mother's Name",        enabled: true,  sort_order: 7 },
  { field_key: "mother_job_details", label_mr: "आईचा व्यवसाय",      label_en: "Mother's Occupation",  enabled: false, sort_order: 8 },
  { field_key: "father_place",       label_mr: "मूळ गाव",            label_en: "Native Place",         enabled: true,  sort_order: 9 },
  { field_key: "uncle_name",         label_mr: "मामा",               label_en: "Maternal Uncle",       enabled: true,  sort_order: 10 },
  { field_key: "brother_info",       label_mr: "भाऊ",                label_en: "Brothers",             enabled: true,  sort_order: 11 },
  { field_key: "sister_info",        label_mr: "बहीण",               label_en: "Sisters",              enabled: true,  sort_order: 12 },
  { field_key: "expectation_details",label_mr: "अपेक्षा",            label_en: "Expectations",         enabled: true,  sort_order: 13 },
];

export async function ensureDisplayConfig() {
  await sql().query(`
    CREATE TABLE IF NOT EXISTS display_config (
      id         SERIAL PRIMARY KEY,
      field_key  TEXT NOT NULL UNIQUE,
      label_mr   TEXT NOT NULL,
      label_en   TEXT NOT NULL,
      enabled    BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  for (const row of DEFAULT_DISPLAY_CONFIG) {
    await sql().query(
      `INSERT INTO display_config (field_key, label_mr, label_en, enabled, sort_order)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (field_key) DO NOTHING`,
      [row.field_key, row.label_mr, row.label_en, row.enabled, row.sort_order]
    );
  }
}

export async function getDisplayConfig(): Promise<DisplayConfigRow[]> {
  await ensureDisplayConfig();
  const rows = await sql().query(`SELECT id, field_key, label_mr, label_en, enabled, sort_order FROM display_config ORDER BY sort_order`);
  return rows as DisplayConfigRow[];
}

export async function updateDisplayConfig(rows: { field_key: string; enabled: boolean; sort_order: number }[]) {
  for (const r of rows) {
    await sql().query(
      `UPDATE display_config SET enabled=$2, sort_order=$3, updated_at=now() WHERE field_key=$1`,
      [r.field_key, r.enabled, r.sort_order]
    );
  }
}
