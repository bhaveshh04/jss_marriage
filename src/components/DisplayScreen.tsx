"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize, Pause, Play } from "lucide-react";
import BioDataSheet from "./BioDataSheet";
import ScaleToFit from "./ScaleToFit";
import { photoUrl, type Candidate } from "@/lib/schema";
import { ageYears, dateMr, heightMr, timeMr, toMr } from "@/lib/marathi";

const INTERVALS = [10, 15, 20, 30, 60];

function Highlight({ c }: { c: Candidate }) {
  const age = ageYears(c.birth_date);
  const lines = [
    age !== null && `वय ${toMr(age)} वर्षे`,
    heightMr(c.height_feet, c.height_inch) && `उंची ${heightMr(c.height_feet, c.height_inch)}`,
    c.kul && `कुळ: ${c.kul}`,
    c.education,
    [c.job_designation, c.job_details].filter(Boolean).join(", "),
    c.job_place,
    c.job_salary && `उत्पन्न: ${c.job_salary}`,
  ].filter(Boolean) as string[];
  return (
    <div className="flex h-full flex-col justify-center pr-4 font-marathi text-white">
      <p className="text-[clamp(14px,1.4vw,26px)] text-haldi-300">{c.gender === "bride" ? "वधू" : "वर"} · नोंदणी क्र.</p>
      <p className="font-marathiHead text-[clamp(40px,5.2vw,110px)] font-bold leading-none text-haldi-500">{toMr(c.registration_no)}</p>
      <h2 className="mt-[2vh] font-marathiHead text-[clamp(26px,3vw,64px)] font-bold leading-tight">{c.candidate_name}</h2>
      <ul className="mt-[2.5vh] space-y-[1.2vh] text-[clamp(16px,1.7vw,34px)] leading-snug text-kumkum-100">
        {lines.slice(0, 7).map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    </div>
  );
}
/* =====================================================================
   RIGHT SIDE PANEL: which info to show for the current candidate
   ---------------------------------------------------------------------
   • To HIDE an item  -> delete that line (or put // in front of it)
   • To SHOW an item  -> add a line:  { label: "Title", value: (c) => c.column_name },
   • To CHANGE order  -> move the lines up / down
   • Empty fields are skipped automatically
   ===================================================================== */
const placeMr = (p?: string, t?: string, d?: string) =>
  [p && `रा. ${p}`, t && `ता. ${t}`, d && `जि. ${d}`].filter(Boolean).join(", ");
const siblingsMr = (m: number, u: number) =>
  [m ? `विवाहित ${toMr(m)}` : "", u ? `अविवाहित ${toMr(u)}` : ""].filter(Boolean).join(", ");

type InfoRow = { label: string; value: (c: Candidate) => string | undefined | false | null };

const RIGHT_INFO: InfoRow[] = [
  { label: "जन्म तारीख",       value: (c) => dateMr(c.birth_date) },
  { label: "जन्म वेळ",         value: (c) => (c.birth_time ? timeMr(c.birth_time, c.birth_vel) : "") },
  { label: "वर्ण",             value: (c) => c.complexion },
  { label: "रक्तगट",           value: (c) => c.blood_group },
  { label: "वडिलांचे नाव",     value: (c) => c.father_name },
  { label: "वडिलांचा व्यवसाय", value: (c) => c.father_job_details },
  { label: "आईचे नाव",         value: (c) => c.mother_name },
  { label: "आईचा व्यवसाय",     value: (c) => c.mother_job_details },
  { label: "मूळ गाव",          value: (c) => placeMr(c.father_place, c.father_taluka, c.father_district) },
  { label: "मामा",             value: (c) => [c.uncle_name, c.uncle_kul && `(${c.uncle_kul})`].filter(Boolean).join(" ") },
  { label: "भाऊ",              value: (c) => siblingsMr(c.brother_married, c.brother_unmarried) },
  { label: "बहीण",             value: (c) => siblingsMr(c.sister_married, c.sister_unmarried) },
  // { label: "इतर नातेसंबंध",    value: (c) => c.relations_details },   // <- remove // to show
  // { label: "मामांचे गाव",      value: (c) => placeMr(c.uncle_place, c.uncle_taluka, c.uncle_district) },
  // { label: "नोंदणी प्रकार",    value: (c) => c.registration_type },
];

const SHOW_EXPECTATION = true; // true = show "अपेक्षा" box at the bottom, false = hide it
const MAX_RIGHT_ROWS = 10;     // maximum rows shown (stops overflow on small screens)

function RightInfo({ c }: { c: Candidate }) {
  const rows = RIGHT_INFO
    .map((r) => ({ label: r.label, v: r.value(c) }))
    .filter((r) => r.v)
    .slice(0, MAX_RIGHT_ROWS) as { label: string; v: string }[];
  return (
    <div className="flex h-full flex-col justify-center gap-[1.6vh] pl-4 font-marathi text-white">
      <p className="text-[clamp(14px,1.3vw,24px)] text-haldi-300">अधिक माहिती</p>
      <dl className="space-y-[1.3vh]">
        {rows.map((r) => (
          <div key={r.label} className="border-l-2 border-haldi-500/60 pl-3">
            <dt className="text-[clamp(11px,1vw,20px)] text-kumkum-200">{r.label}</dt>
            <dd className="text-[clamp(14px,1.45vw,30px)] font-semibold leading-snug">{r.v}</dd>
          </div>
        ))}
      </dl>
      {SHOW_EXPECTATION && c.expectation_details && (
        <div className="rounded-2xl bg-white/5 p-[1vw] ring-1 ring-white/10">
          <p className="text-[clamp(11px,1vw,20px)] text-haldi-300">अपेक्षा</p>
          <p className="mt-1 line-clamp-4 text-[clamp(13px,1.2vw,24px)] leading-snug">{c.expectation_details}</p>
        </div>
      )}
    </div>
  );
}
export default function DisplayScreen({ candidates, startId }: { candidates: Candidate[]; startId?: number }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "groom" | "bride">("all");
  const list = useMemo(() => candidates.filter((c) => filter === "all" || c.gender === filter), [candidates, filter]);
  const [idx, setIdx] = useState(() => Math.max(0, candidates.findIndex((c) => c.id === startId)));
  const [playing, setPlaying] = useState(!startId);
  const [secs, setSecs] = useState(20);
  const [ui, setUi] = useState(true);
  const [full, setFull] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout>>();
  const currentId = useRef<number | undefined>(startId);

  const safe = list.length ? Math.min(idx, list.length - 1) : 0;
  const cur = list[safe];
  useEffect(() => { currentId.current = cur?.id; }, [cur]);

  const go = useCallback((d: number) => setIdx((i) => (list.length ? (i + d + list.length) % list.length : 0)), [list.length]);

  // auto-advance
  useEffect(() => {
    if (!playing || list.length < 2) return;
    const t = setTimeout(() => go(1), secs * 1000);
    return () => clearTimeout(t);
  }, [playing, secs, safe, list.length, go]);

  // pull newly added profiles every minute without a page reload
  useEffect(() => { const t = setInterval(() => router.refresh(), 60_000); return () => clearInterval(t); }, [router]);
  useEffect(() => {
    if (currentId.current === undefined) return;
    const i = list.findIndex((c) => c.id === currentId.current);
    if (i >= 0) setIdx(i);
  }, [list]);

  // preload photos of the next two profiles
  useEffect(() => {
    for (const o of [1, 2]) {
      const n = list[(safe + o) % (list.length || 1)];
      if (n?.photo_slots[0]) new Image().src = photoUrl(n, n.photo_slots[0]);
    }
  }, [safe, list]);

  // keep the TV awake
  useEffect(() => {
    let lock: any;
    (navigator as any).wakeLock?.request("screen").then((l: any) => (lock = l)).catch(() => {});
    return () => lock?.release?.();
  }, []);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.();
  }, []);
  useEffect(() => {
    const f = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", f);
    return () => document.removeEventListener("fullscreenchange", f);
  }, []);

  // keyboard remote
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
      else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key.toLowerCase() === "f") toggleFull();
      else if (e.key.toLowerCase() === "h") setUi((u) => !u);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go, toggleFull]);

  // auto-hide controls + cursor
  const wake = useCallback(() => {
    setUi(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setUi(false), 3500);
  }, []);
  useEffect(() => { wake(); return () => clearTimeout(idle.current); }, [wake]);

  // const upNext = list.length > 1 ? [1, 2, 3].map((o) => list[(safe + o) % list.length]).filter((c, i, a) => c.id !== cur?.id && a.findIndex((x) => x.id === c.id) === i) : [];

  return (
    <div onMouseMove={wake} onTouchStart={wake} className={`relative h-dvh w-screen overflow-hidden bg-[#1a0910] ${ui ? "" : "cursor-none"}`}
      style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, #4a1220 0%, #1a0910 65%)" }}>
      {!cur ? (
        <div className="grid h-full place-items-center px-6 text-center text-white">
          <div>
            <h1 className="text-2xl font-bold">Nothing to show yet</h1>
            <p className="mt-2 text-kumkum-200">Add bio-data (or switch profiles to “visible”) and they will appear here automatically.</p>
            <Link href="/" className="btn-gold mt-6">Back to dashboard</Link>
          </div>
        </div>
      ) : (
        <div key={cur.id} className="mvm-fade grid h-full grid-cols-1 gap-[2vw] px-[2vw] py-[2vh] min-[1100px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="hidden min-[1100px]:block"><Highlight c={cur} /></div>
          <div className="h-full min-[1100px]:aspect-[794/1123]">
            <ScaleToFit mode="contain" className="h-full w-full">
              <div className="shadow-[0_20px_80px_rgba(0,0,0,.6)]"><BioDataSheet c={cur} hideContact /></div>
            </ScaleToFit>
          </div>
                <div className="hidden min-[1100px]:block"><RightInfo c={cur} /></div>
        </div>
      )}

      {/* progress */}
      {cur && playing && list.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/10">
          <div key={`${cur.id}-${secs}`} className="h-full origin-left bg-haldi-500" style={{ animation: `mvm-progress ${secs}s linear forwards` }} />
        </div>
      )}

      {/* controls */}
      <div className={`absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent p-3 transition-opacity duration-300 ${ui ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <Link href={cur ? `/candidates/${cur.id}` : "/"} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"><ArrowLeft size={16} /> Exit</Link>
        <div className="flex flex-wrap items-center gap-2 text-sm text-white">
          <div className="inline-flex rounded-lg bg-white/10 p-0.5" role="group" aria-label="Filter">
            {([["all", "All"], ["groom", "Grooms"], ["bride", "Brides"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => { setFilter(k); setIdx(0); }} aria-pressed={filter === k} className={`rounded-md px-3 py-1.5 font-semibold ${filter === k ? "bg-haldi-500 text-kumkum-900" : "hover:bg-white/10"}`}>{l}</button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
            <span className="text-kumkum-100">Change every</span>
            <select value={secs} onChange={(e) => setSecs(Number(e.target.value))} className="rounded bg-transparent font-semibold focus:outline-none">
              {INTERVALS.map((s) => <option key={s} value={s} className="text-ink">{s}s</option>)}
            </select>
          </label>
          <button onClick={() => go(-1)} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20" aria-label="Previous"><ChevronLeft size={18} /></button>
          <button onClick={() => setPlaying(!playing)} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 font-semibold hover:bg-white/20">{playing ? <Pause size={16} /> : <Play size={16} />}{playing ? "Pause" : "Auto-play"}</button>
          <button onClick={() => go(1)} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20" aria-label="Next"><ChevronRight size={18} /></button>
          <button onClick={toggleFull} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 font-semibold hover:bg-white/20">{full ? <Minimize size={16} /> : <Maximize size={16} />}{full ? "Exit full screen" : "Full screen"}</button>
          {cur && <span className="px-1 text-kumkum-200">{safe + 1} / {list.length}</span>}
        </div>
      </div>
    </div>
  );
}
