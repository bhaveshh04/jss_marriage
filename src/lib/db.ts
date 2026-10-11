import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { BOOL_COLS, DATE_COLS, INT_COLS, TEXT_COLS } from "./fields";
import type { Candidate, CandidateInput } from "./schema";

let _sql: NeonQueryFunction<false, false> | null = null;
export function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set. Add it to .env.local");
  // no-store: stop Next.js from caching Neon's HTTP (fetch) responses, otherwise photos / data can come back stale or empty
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
  // registration_date has a DB default when null is not allowed -> fall back to today
  const idx = cols.indexOf("registration_date");
  if (!vals[idx]) vals[idx] = new Date().toISOString().slice(0, 10);
  await sql().query(`INSERT INTO candidates (${cols.join(",")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(",")})`, vals);
  try {
    await savePhotos(id, input.photos);
  } catch (e) {
    // don't leave a half-saved profile behind (it would be duplicated when the user retries)
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
