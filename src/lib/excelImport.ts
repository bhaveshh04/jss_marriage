import ExcelJS from "exceljs";
import { BIRTH_VEL, BLOOD_GROUPS, REGISTRATION_TYPES } from "./fields";
import { candidateSchema, type CandidateInput } from "./schema";
import { EXAMPLE_ROWS, IMPORT_COLS, MAX_IMPORT_ROWS, type ImportCol } from "./importColumns";

const FONT = "Arial";
const pad = (v: number) => String(v).padStart(2, "0");
const norm = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9\u0900-\u097F]/g, "");

/* ------------------------------------------------------------------ reading cells */
function cellText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v instanceof Date) return `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`;
  if (typeof v === "object") {
    const o = v as any;
    if (Array.isArray(o.richText)) return o.richText.map((r: any) => r.text).join("").trim();
    if ("result" in o) return cellText(o.result);
    if (typeof o.text === "string") return o.text.trim();
    if (o.text) return cellText(o.text);
    if ("error" in o) return "";
  }
  return "";
}

const ymd = (y: number, m: number, d: number) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (y < 1900 || y > 2100 || dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
};

type R<T> = { ok: true; v: T } | { ok: false; e: string };

function parseDate(raw: unknown): R<string> {
  if (raw instanceof Date) {
    const s = ymd(raw.getUTCFullYear(), raw.getUTCMonth() + 1, raw.getUTCDate());
    return s ? { ok: true, v: s } : { ok: false, e: "is not a valid date" };
  }
  if (typeof raw === "number" && raw > 20000 && raw < 80000) {
    const dt = new Date(Date.UTC(1899, 11, 30) + Math.floor(raw) * 86400000);
    const s = ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
    return s ? { ok: true, v: s } : { ok: false, e: "is not a valid date" };
  }
  const s = cellText(raw);
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) { const r = ymd(+m[1], +m[2], +m[3]); return r ? { ok: true, v: r } : { ok: false, e: "is not a valid date" }; }
  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/); // day first (Indian format)
  if (m) {
    let y = +m[3];
    if (y < 100) y += y > 30 ? 1900 : 2000;
    const r = ymd(y, +m[2], +m[1]);
    return r ? { ok: true, v: r } : { ok: false, e: "is not a valid date" };
  }
  return { ok: false, e: `"${s}" is not a valid date (use DD-MM-YYYY)` };
}

function parseTime(raw: unknown): R<string> {
  if (raw instanceof Date) return { ok: true, v: `${pad(raw.getUTCHours())}:${pad(raw.getUTCMinutes())}` };
  if (typeof raw === "number" && raw >= 0 && raw < 1) {
    const mins = Math.round(raw * 1440);
    return { ok: true, v: `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}` };
  }
  const s = cellText(raw);
  const m = s.match(/^(\d{1,2})\s*[:.]\s*(\d{2})(?:\s*[:.]\s*\d{2})?\s*([ap])?\.?\s*m?\.?$/i);
  if (!m) return { ok: false, e: `"${s}" is not a valid time (use e.g. 10:30 AM)` };
  let h = +m[1];
  const mi = +m[2];
  const ap = m[3]?.toLowerCase();
  if (ap === "p" && h < 12) h += 12;
  if (ap === "a" && h === 12) h = 0;
  if (h > 23 || mi > 59) return { ok: false, e: `"${s}" is not a valid time` };
  return { ok: true, v: `${pad(h)}:${pad(mi)}` };
}

function parseInt0(raw: unknown): R<number> {
  const s = cellText(raw).replace(/,/g, "");
  if (!s) return { ok: true, v: 0 };
  const x = Number(s);
  if (!Number.isFinite(x) || Math.abs(x - Math.round(x)) > 1e-9) return { ok: false, e: `"${s}" must be a whole number` };
  if (x < 0 || x > 99) return { ok: false, e: "must be between 0 and 99" };
  return { ok: true, v: Math.round(x) };
}

function parseGender(raw: unknown): R<"groom" | "bride"> {
  const s = cellText(raw).toLowerCase().replace(/\s+/g, "");
  if (!s) return { ok: false, e: "is required (Groom or Bride)" };
  if (["groom", "bridegroom", "वर", "मुलगा", "male", "boy", "m"].includes(s)) return { ok: true, v: "groom" };
  if (["bride", "वधू", "वधु", "मुलगी", "female", "girl", "f"].includes(s)) return { ok: true, v: "bride" };
  return { ok: false, e: `"${cellText(raw)}" is not valid (use Groom or Bride)` };
}

function parseBool(raw: unknown, dflt: boolean): R<boolean> {
  if (typeof raw === "boolean") return { ok: true, v: raw };
  const s = cellText(raw).toLowerCase();
  if (!s) return { ok: true, v: dflt };
  if (["yes", "y", "true", "1", "होय", "हो", "x"].includes(s)) return { ok: true, v: true };
  if (["no", "n", "false", "0", "नाही", "नको"].includes(s)) return { ok: true, v: false };
  return { ok: false, e: `"${cellText(raw)}" must be Yes or No` };
}

const pick = (s: string, list: readonly string[]) => {
  const k = (x: string) => x.replace(/\s+/g, "");
  return list.find((x) => x === s) ?? list.find((x) => k(x) === k(s));
};

/* ------------------------------------------------------------------ parse a workbook */
export type ParsedRow = { row: number; name: string; data?: CandidateInput; errors: string[] };
export type ParseResult = { rows: ParsedRow[]; ignoredHeaders: string[]; fatal?: string };

export async function parseCandidatesWorkbook(buf: Buffer): Promise<ParseResult> {
  const wb = new ExcelJS.Workbook();
  try { await wb.xlsx.load(buf as any); } catch { return { rows: [], ignoredHeaders: [], fatal: "This file could not be read. Please upload a valid .xlsx Excel file." }; }
  const ws = wb.getWorksheet("Candidates") ?? wb.worksheets[0];
  if (!ws) return { rows: [], ignoredHeaders: [], fatal: "The Excel file has no sheets." };

  // map header text -> column definition
  const lookup = new Map<string, ImportCol>();
  for (const c of IMPORT_COLS) for (const h of [c.header, c.key, ...(c.aliases ?? [])]) lookup.set(norm(h), c);

  const colIdx = new Map<string, number>(); // key -> excel column number
  const ignored: string[] = [];
  ws.getRow(1).eachCell({ includeEmpty: false }, (cell, ci) => {
    const text = cellText(cell.value);
    if (!text) return;
    const def = lookup.get(norm(text));
    if (def && !colIdx.has(def.key)) colIdx.set(def.key, ci);
    else ignored.push(text);
  });
  for (const must of IMPORT_COLS.filter((c) => c.required)) {
    if (!colIdx.has(must.key)) return { rows: [], ignoredHeaders: ignored, fatal: `Column "${must.header}" was not found in row 1 of the sheet. Please use the downloaded template.` };
  }

  const rows: ParsedRow[] = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const raw: Record<string, unknown> = {};
    let any = false;
    colIdx.forEach((ci, key) => {
      const v = row.getCell(ci).value;
      raw[key] = v;
      if (cellText(v)) any = true;
    });
    if (!any) continue;
    if (rows.length >= MAX_IMPORT_ROWS) return { rows: [], ignoredHeaders: ignored, fatal: `Too many rows. Import at most ${MAX_IMPORT_ROWS} candidates per file — split the sheet into two files.` };

    const errors: string[] = [];
    const obj: Record<string, unknown> = {};
    for (const c of IMPORT_COLS) {
      if (!colIdx.has(c.key)) continue;
      const v = raw[c.key];
      const empty = !cellText(v);
      const bad = (e: string) => errors.push(`${c.header} ${e}`);
      if (c.kind === "gender") {
        const g = parseGender(v); g.ok ? (obj[c.key] = g.v) : bad(g.e);
      } else if (empty) {
        if (c.required) bad("is required");
        else if (c.kind === "bool") obj[c.key] = c.key === "is_active";
        else if (c.kind === "int") obj[c.key] = 0;
        else obj[c.key] = "";
      } else if (c.kind === "date") {
        const x = parseDate(v); x.ok ? (obj[c.key] = x.v) : bad(x.e);
      } else if (c.kind === "time") {
        const x = parseTime(v); x.ok ? (obj[c.key] = x.v) : bad(x.e);
      } else if (c.kind === "int") {
        const x = parseInt0(v); x.ok ? (obj[c.key] = x.v) : bad(x.e);
      } else if (c.kind === "bool") {
        const x = parseBool(v, c.key === "is_active"); x.ok ? (obj[c.key] = x.v) : bad(x.e);
      } else {
        let s = cellText(v);
        if (c.key === "blood_group") {
          const b = pick(s.toUpperCase().replace(/\s+/g, ""), BLOOD_GROUPS);
          b ? (s = b) : bad(`"${s}" is not valid (use ${BLOOD_GROUPS.join(", ")})`);
        } else if (c.key === "birth_vel") {
          const alias = /^(day|din)/i.test(s) ? "दिवसा" : /^night/i.test(s) ? "रात्री" : s;
          const b = pick(alias, BIRTH_VEL);
          b ? (s = b) : bad(`"${s}" must be दिवसा or रात्री`);
        } else if (c.key === "registration_type") {
          const b = pick(s, REGISTRATION_TYPES);
          b ? (s = b) : bad(`"${s}" is not one of the allowed types (use the dropdown)`);
        }
        obj[c.key] = s;
      }
    }
    // sensible default when the type is left empty
    if (colIdx.has("gender") && !obj.registration_type && (obj.gender === "groom" || obj.gender === "bride")) {
      obj.registration_type = obj.gender === "bride" ? REGISTRATION_TYPES[1] : REGISTRATION_TYPES[0];
    }

    let data: CandidateInput | undefined;
    if (!errors.length) {
      const p = candidateSchema.safeParse(obj);
      if (p.success) data = p.data;
      else for (const i of p.error.issues) {
        const col = IMPORT_COLS.find((c) => c.key === i.path[0]);
        errors.push(`${col?.header ?? i.path.join(".")}: ${i.message}`);
      }
    }
    rows.push({ row: r, name: cellText(raw.candidate_name), data: errors.length ? undefined : data, errors });
  }

  // duplicate registration numbers inside the same file
  const seen = new Map<string, number>();
  for (const r of rows) {
    const reg = r.data?.registration_no?.toLowerCase();
    if (!reg) continue;
    if (seen.has(reg)) { r.errors.push(`Registration No "${r.data!.registration_no}" is repeated (also in row ${seen.get(reg)})`); r.data = undefined; }
    else seen.set(reg, r.row);
  }
  return { rows, ignoredHeaders: ignored, fatal: rows.length ? undefined : "No candidate rows were found. Fill the data from row 2 of the \"Candidates\" sheet." };
}

/* ------------------------------------------------------------------ build the template */
const HEAD_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF8C1D2F" } } as const;
const REQ_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9A21B" } } as const;
const colLetter = (n: number) => { let s = ""; for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s; };

function fmtFor(c: ImportCol) {
  return c.kind === "date" ? "dd-mm-yyyy" : c.kind === "time" ? "hh:mm AM/PM" : c.kind === "int" ? "0" : "@";
}

function setupTable(ws: ExcelJS.Worksheet) {
  ws.columns = IMPORT_COLS.map((c) => ({ key: c.key, width: c.width ?? 18 }));
  IMPORT_COLS.forEach((c, i) => {
    ws.getColumn(i + 1).style = { numFmt: fmtFor(c), font: { name: FONT, size: 10 }, alignment: { vertical: "middle", wrapText: c.key === "candidate_address" || c.key.endsWith("_details") } };
    const h = ws.getCell(1, i + 1);
    h.value = c.required ? `${c.header} *` : c.header;
    h.numFmt = "@";
    h.font = { name: FONT, size: 10, bold: true, color: { argb: c.required ? "FF241B18" : "FFFFFFFF" } };
    h.fill = c.required ? REQ_FILL : HEAD_FILL;
    h.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    h.border = { bottom: { style: "medium", color: { argb: "FFD9A21B" } } };
  });
  ws.getRow(1).height = 34;
  ws.views = [{ state: "frozen", xSplit: 6, ySplit: 1 }];
}

export async function buildTemplateBuffer(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Vadhu Var Melava";

  const data = wb.addWorksheet("Candidates");
  const help = wb.addWorksheet("Instructions");
  const ex = wb.addWorksheet("Example");
  const lists = wb.addWorksheet("Lists", { state: "hidden" });

  /* hidden lists sheet (dropdown sources) */
  const ranges = new Map<string, string>();
  let li = 0;
  for (const c of IMPORT_COLS) {
    if (!c.list) continue;
    li++;
    lists.getCell(1, li).value = c.header;
    c.list.forEach((v, i) => { lists.getCell(i + 2, li).value = v; });
    ranges.set(c.key, `Lists!$${colLetter(li)}$2:$${colLetter(li)}$${c.list.length + 1}`);
  }

  /* Candidates (empty, with dropdowns for 500 rows) */
  setupTable(data);
  IMPORT_COLS.forEach((c, i) => {
    for (let r = 2; r <= MAX_IMPORT_ROWS + 1; r++) {
      const cell = data.getCell(r, i + 1);
      if (ranges.has(c.key)) {
        cell.dataValidation = {
          type: "list", allowBlank: true, formulae: [ranges.get(c.key)!],
          showErrorMessage: !c.freeList, errorStyle: "stop", errorTitle: c.header, error: "Please pick a value from the dropdown list.",
        };
      } else if (c.kind === "int") {
        cell.dataValidation = {
          type: "whole", operator: "between", allowBlank: true, formulae: [0, 99],
          showErrorMessage: true, errorStyle: "stop", errorTitle: c.header, error: "Enter a whole number between 0 and 99.",
        };
      }
    }
  });

  /* Example sheet */
  setupTable(ex);
  EXAMPLE_ROWS.forEach((vals, ri) => {
    IMPORT_COLS.forEach((c, ci) => {
      const v = vals[c.key];
      if (v === undefined) return;
      const cell = ex.getCell(ri + 2, ci + 1);
      cell.value = v;
      cell.numFmt = fmtFor(c);
      cell.font = { name: FONT, size: 10, italic: true, color: { argb: "FF6B4A43" } };
    });
  });
  const note = ex.getCell(EXAMPLE_ROWS.length + 3, 1);
  note.value = "This sheet is only an EXAMPLE and is NOT imported. Type your real data in the \"Candidates\" sheet.";
  note.font = { name: FONT, size: 10, bold: true, color: { argb: "FFA8283B" } };

  /* Instructions */
  help.columns = [{ width: 28 }, { width: 12 }, { width: 70 }, { width: 38 }];
  const put = (r: number, c: number, v: string, o: Partial<ExcelJS.Font> = {}, wrap = true) => {
    const cell = help.getCell(r, c);
    cell.value = v;
    cell.font = { name: FONT, size: 10, ...o };
    cell.alignment = { vertical: "top", wrapText: wrap };
    return cell;
  };
  put(1, 1, "How to import candidates from Excel", { size: 14, bold: true, color: { argb: "FF8C1D2F" } }, false);
  const steps = [
    "1. Open the \"Candidates\" sheet and type ONE candidate per row, starting from row 2 (do not change row 1 headings).",
    "2. Columns marked * (gold headings) are required: Gender and Candidate Name. Everything else is optional.",
    "3. Use the dropdowns where available. Dates as DD-MM-YYYY, time like 10:30 AM. Marathi text is fine (type with your Marathi keyboard).",
    `4. Maximum ${MAX_IMPORT_ROWS} candidates per file. Save the file as .xlsx.`,
    "5. In the app: Import Excel → choose the file → \"Check file\" → fix any errors shown → \"Import\".",
    "6. Photos cannot be put in Excel. Add them afterwards with Edit on each candidate.",
    "7. Importing the same file twice creates the candidates twice — unless a Registration No is filled in, in which case the repeats are rejected.",
  ];
  steps.forEach((s, i) => { help.mergeCells(3 + i, 1, 3 + i, 4); put(3 + i, 1, s); help.getRow(3 + i).height = 28; });
  const hr = 4 + steps.length;
  ["Column heading", "Required?", "What to enter", "Allowed values"].forEach((h, i) => {
    const c = put(hr, i + 1, h, { bold: true, color: { argb: "FFFFFFFF" } });
    c.fill = HEAD_FILL;
  });
  IMPORT_COLS.forEach((c, i) => {
    const r = hr + 1 + i;
    put(r, 1, c.header, { bold: true });
    put(r, 2, c.required ? "YES" : "no", c.required ? { bold: true, color: { argb: "FFA8283B" } } : {});
    put(r, 3, c.hint);
    put(r, 4, c.list ? c.list.join("  |  ") : c.kind === "date" ? "DD-MM-YYYY" : c.kind === "time" ? "hh:mm AM/PM" : c.kind === "int" ? "0 - 99" : "");
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}
