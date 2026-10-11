"use client";
import { useRef, useState } from "react";
import { Camera, Plus, X } from "lucide-react";
import { compressImage } from "@/lib/image";

export type PhotoState = Record<1 | 2 | 3, string | null | undefined>;
type Props = {
  /** current image src per slot (existing server URL or fresh data URL) */
  sources: Record<number, string | undefined>;
  onChange: (slot: 1 | 2 | 3, value: string | null) => void;
};

function Slot({ slot, src, onChange, big }: { slot: 1 | 2 | 3; src?: string; onChange: Props["onChange"]; big?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);

  async function pick(file?: File) {
    if (!file) return;
    setErr(""); setBusy(true);
    try { onChange(slot, await compressImage(file)); } catch (e: any) { setErr(e.message || "Could not read image"); }
    setBusy(false);
  }

  return (
    <div className={big ? "" : "flex-1"}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
        className={`group relative overflow-hidden rounded-xl border-2 border-dashed transition-colors ${big ? "aspect-[4/5]" : "aspect-square"} ${drag ? "border-kumkum-500 bg-kumkum-50" : "border-stone-300 bg-stone-50"}`}
      >
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover object-top" />
            <button type="button" onClick={() => onChange(slot, null)} aria-label="Remove photo"
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-kumkum-700">
              <X size={16} />
            </button>
            <button type="button" onClick={() => input.current?.click()}
              className="absolute inset-x-2 bottom-2 rounded-lg bg-black/60 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100">
              Replace photo
            </button>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-3 text-center text-stone-500 hover:text-kumkum-600">
            {big ? <Camera size={30} /> : <Plus size={22} />}
            <span className={big ? "text-sm font-semibold" : "text-xs font-semibold"}>
              {busy ? "Processing…" : big ? "Add main photo" : "Add"}
            </span>
            {big && <span className="text-xs text-stone-400">Click, drop an image, or use the camera</span>}
          </button>
        )}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

export default function PhotoUploader({ sources, onChange }: Props) {
  return (
    <div>
      <Slot slot={1} src={sources[1]} onChange={onChange} big />
      <div className="mt-3 flex gap-3">
        <Slot slot={2} src={sources[2]} onChange={onChange} />
        <Slot slot={3} src={sources[3]} onChange={onChange} />
      </div>
      <p className="mt-2 text-xs text-stone-500">Photos are resized in your browser, so uploads stay fast and the database stays small.</p>
    </div>
  );
}
