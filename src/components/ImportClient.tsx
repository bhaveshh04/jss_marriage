"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";

type Failed = { row: number; name: string; errors: string[] };
type Result = {
  dryRun: boolean; total: number; valid: number; imported: number; ignoredHeaders: string[];
  failed: Failed[]; sample: { row: number; name: string; gender: string; reg: string }[];
};

export default function ImportClient() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<"" | "check" | "import">("");
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");

  const choose = (f: File | null) => { setFile(f); setRes(null); setErr(""); };

  async function run(dry: boolean) {
    if (!file) return;
    setBusy(dry ? "check" : "import"); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/candidates/import${dry ? "?dry=1" : ""}`, { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error ?? "Something went wrong."); setRes(null); }
      else { setRes(j); if (!dry) router.refresh(); }
    } catch { setErr("Network error. Please try again."); }
    setBusy("");
  }

  const done = res && !res.dryRun;

  return (
    <div className="space-y-5">
      {/* step 1 */}
      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-bold text-kumkum-900">Step 1 — Download the Excel template</h2>
          <p className="mt-0.5 text-sm text-stone-500">Fill it in (one candidate per row, max 500). The “Instructions” sheet explains every column.</p>
        </div>
        <a href="/api/candidates/import/template" className="btn-outline"><Download size={16} /> Download template</a>
      </section>

      {/* step 2 */}
      <section className="card p-5">
        <h2 className="font-bold text-kumkum-900">Step 2 — Upload the filled file</h2>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); choose(e.dataTransfer.files?.[0] ?? null); }}
          onClick={() => input.current?.click()}
          className="mt-3 grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-stone-300 px-4 py-10 text-center transition-colors hover:border-kumkum-500"
        >
          <input ref={input} type="file" accept=".xlsx" className="hidden" onChange={(e) => choose(e.target.files?.[0] ?? null)} />
          {file ? (
            <p className="inline-flex items-center gap-2 font-semibold text-ink"><FileSpreadsheet size={20} className="text-mehendi-600" />{file.name}<span className="font-normal text-stone-500">({Math.round(file.size / 1024)} KB)</span></p>
          ) : (
            <p className="inline-flex items-center gap-2 text-stone-500"><Upload size={20} /> Click to choose, or drop the .xlsx file here</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-outline" disabled={!file || !!busy} onClick={() => run(true)}>
            {busy === "check" && <Loader2 size={16} className="animate-spin" />} Check file
          </button>
          <button className="btn-primary" disabled={!file || !!busy || (!!res && res.dryRun && res.valid === 0) || !!done} onClick={() => run(false)}>
            {busy === "import" && <Loader2 size={16} className="animate-spin" />}
            {res?.dryRun && res.valid > 0 ? `Import ${res.valid} candidate${res.valid === 1 ? "" : "s"}` : "Import"}
          </button>
        </div>
      </section>

      {err && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {err}
        </div>
      )}

      {res && (
        <section className="card p-5">
          {done ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-mehendi-600" />
              <div>
                <h2 className="font-bold text-kumkum-900">{res.imported} candidate{res.imported === 1 ? "" : "s"} imported</h2>
                <p className="text-sm text-stone-500">{res.failed.length ? `${res.failed.length} row(s) were skipped — see below. Fix them in Excel and import just those rows again.` : "All rows were imported."} Add photos using Edit on each candidate.</p>
                <Link href="/" className="btn-primary mt-3">Go to dashboard</Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-bold text-kumkum-900">Check result</h2>
              <p className="mt-1 text-sm text-stone-600">
                <b className="text-mehendi-600">{res.valid}</b> ready to import · <b className={res.failed.length ? "text-red-700" : ""}>{res.failed.length}</b> with problems (these will be skipped) · {res.total} rows read
              </p>
              {res.sample.length > 0 && (
                <ul className="mt-3 grid gap-1 font-marathi text-sm text-stone-700 sm:grid-cols-2">
                  {res.sample.map((s) => <li key={s.row}>Row {s.row}: {s.name} <span className="text-stone-400">· {s.gender === "bride" ? "Bride" : "Groom"}</span></li>)}
                  {res.valid > res.sample.length && <li className="text-stone-400">…and {res.valid - res.sample.length} more</li>}
                </ul>
              )}
            </div>
          )}

          {res.ignoredHeaders.length > 0 && (
            <p className="mt-3 text-xs text-stone-500">Ignored columns (not recognised): {res.ignoredHeaders.join(", ")}</p>
          )}

          {res.failed.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-red-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-red-50 text-red-800"><tr><th className="px-3 py-2">Excel row</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Problem</th></tr></thead>
                <tbody>
                  {res.failed.map((f) => (
                    <tr key={f.row} className="border-t border-red-100 align-top">
                      <td className="px-3 py-2 font-semibold">{f.row}</td>
                      <td className="px-3 py-2 font-marathi">{f.name || "—"}</td>
                      <td className="px-3 py-2 text-red-800">{f.errors.map((e, i) => <div key={i}>{e}</div>)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
