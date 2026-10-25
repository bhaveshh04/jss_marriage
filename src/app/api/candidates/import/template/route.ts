import { buildTemplateBuffer } from "@/lib/excelImport";

export const runtime = "nodejs";

// GET /api/candidates/import/template -> downloads the Excel template (generated from src/lib/importColumns.ts)
export async function GET() {
  const buf = await buildTemplateBuffer();
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="candidate-import-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
