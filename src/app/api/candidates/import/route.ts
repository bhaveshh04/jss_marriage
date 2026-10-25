import { NextResponse } from "next/server";
import { createCandidate, sql } from "@/lib/db";
import { parseCandidatesWorkbook } from "@/lib/excelImport";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024;
const BATCH = 5; // rows saved in parallel

// POST /api/candidates/import        -> import the valid rows
// POST /api/candidates/import?dry=1  -> only check the file, save nothing
export async function POST(req: Request) {
  const dry = new URL(req.url).searchParams.get("dry") === "1";

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "Please choose an Excel file." }, { status: 400 });
  if (!/\.xlsx$/i.test(file.name)) return NextResponse.json({ error: "Only .xlsx files are supported. In Excel use File → Save As → Excel Workbook (.xlsx)." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is larger than 5 MB." }, { status: 413 });

  const parsed = await parseCandidatesWorkbook(Buffer.from(await file.arrayBuffer()));
  if (parsed.fatal) return NextResponse.json({ error: parsed.fatal }, { status: 400 });
  const { rows } = parsed;

  try {
    // registration numbers that already exist in the database
    const regs = rows.map((r) => r.data?.registration_no).filter(Boolean) as string[];
    if (regs.length) {
      const found = (await sql().query("SELECT registration_no FROM candidates WHERE registration_no = ANY($1)", [regs])) as { registration_no: string }[];
      const taken = new Set(found.map((f) => f.registration_no));
      for (const r of rows) if (r.data && taken.has(r.data.registration_no)) { r.errors.push(`Registration No "${r.data.registration_no}" already exists`); r.data = undefined; }
    }

    const good = rows.filter((r) => r.data && !r.errors.length);
    let imported = 0;
    if (!dry) {
      for (let i = 0; i < good.length; i += BATCH) {
        const chunk = good.slice(i, i + BATCH);
        const res = await Promise.allSettled(chunk.map((r) => createCandidate(r.data!)));
        res.forEach((x, j) => {
          if (x.status === "fulfilled") { imported++; return; }
          console.error("[import row]", chunk[j].row, x.reason);
          const dup = String(x.reason?.message).includes("candidates_registration_no_key");
          chunk[j].errors.push(dup ? "Registration No already exists" : "Could not be saved");
        });
      }
    }

    return NextResponse.json({
      dryRun: dry,
      total: rows.length,
      valid: good.length,
      imported,
      ignoredHeaders: parsed.ignoredHeaders,
      failed: rows.filter((r) => r.errors.length).map((r) => ({ row: r.row, name: r.name, errors: r.errors })),
      sample: good.slice(0, 6).map((r) => ({ row: r.row, name: r.data!.candidate_name, gender: r.data!.gender, reg: r.data!.registration_no })),
    });
  } catch (e) {
    console.error("[import]", e);
    return NextResponse.json({ error: "Import failed. Please try again." }, { status: 500 });
  }
}
