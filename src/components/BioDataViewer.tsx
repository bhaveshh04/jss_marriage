"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, FileImage, Loader2, MonitorPlay, Pencil, Printer } from "lucide-react";
import BioDataSheet from "./BioDataSheet";
import ScaleToFit from "./ScaleToFit";
import DeleteButton from "./DeleteButton";
import { downloadPdf, downloadPng } from "@/lib/export";
import type { Candidate } from "@/lib/schema";

export default function BioDataViewer({ c, autoPrint }: { c: Candidate; autoPrint?: boolean }) {
  const sheet = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const fileName = `${c.registration_no}_${c.candidate_name}`;

  async function waitForAssets() {
    await document.fonts?.ready;
    const imgs = Array.from(sheet.current?.querySelectorAll("img") ?? []);
    await Promise.all(imgs.map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = i.onerror = () => r(null); }))));
  }

  async function print() { await waitForAssets(); window.print(); }

  async function download(kind: "pdf" | "png") {
    if (!sheet.current) return;
    setBusy(kind);
    try {
      await waitForAssets();
      await (kind === "pdf" ? downloadPdf : downloadPng)(sheet.current, fileName);
    } catch (e) {
      console.error(e);
      alert("Could not create the file. Please try again, or use Print → Save as PDF.");
    }
    setBusy(null);
  }

  useEffect(() => { if (autoPrint) { const t = setTimeout(print, 600); return () => clearTimeout(t); } /* eslint-disable-next-line */ }, []);

  return (
    <div>
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-marathi text-2xl font-bold text-kumkum-900">{c.candidate_name}</h1>
          <p className="text-sm text-stone-500">Reg. no. {c.registration_no} · {c.gender === "bride" ? "Bride" : "Groom"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={print} className="btn-primary"><Printer size={17} /> Print</button>
          <Link href={`/display?id=${c.id}`} className="btn-gold"><MonitorPlay size={17} /> Display</Link>
          <button onClick={() => download("pdf")} disabled={!!busy} className="btn-outline">
            {busy === "pdf" ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />} Download PDF
          </button>
          <button onClick={() => download("png")} disabled={!!busy} className="btn-outline">
            {busy === "png" ? <Loader2 size={17} className="animate-spin" /> : <FileImage size={17} />} Image
          </button>
          <Link href={`/candidates/${c.id}/edit`} className="btn-outline"><Pencil size={16} /> Edit</Link>
          <DeleteButton id={c.id} name={c.candidate_name} redirect="/" variant="button" />
        </div>
      </div>

      <div className="no-print rounded-2xl bg-stone-200/70 p-3 sm:p-6">
        <div className="mx-auto max-w-[794px]">
          <div className="print-root shadow-xl">
            <ScaleToFit mode="width">
              <BioDataSheet ref={sheet} c={c} />
            </ScaleToFit>
          </div>
        </div>
      </div>
    </div>
  );
}
