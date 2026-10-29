"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize, Pause, Play } from "lucide-react";
import BioDataSheet from "./BioDataSheet";
import ScaleToFit from "./ScaleToFit";
import { photoUrl, type Candidate } from "@/lib/schema";
import { ageYears, dateMr, heightMr, timeMr, toMr } from "@/lib/marathi";
import type { DisplayConfigRow } from "@/lib/db";

const INTERVALS = [10, 15, 20, 30, 60];

// ── Left highlight panel ──────────────────────────────────────────────────────
function Highlight({ c, lang }: { c: Candidate; lang: "mr" | "en" }) {
  const age = ageYears(c.birth_date);
  const lines = [
    age !== null && (lang === "mr" ? `वय ${toMr(age)} वर्षे` : `Age: ${age} yrs`),
    heightMr(c.height_feet, c.height_inch) && (lang === "mr" ? `उंची ${heightMr(c.height_feet, c.height_inch)}` : `Height: ${c.height_feet}'${c.height_inch}"`),
    c.kul && (lang === "mr" ? `कुळ: ${c.kul}` : `Kul: ${c.kul}`),
    c.education,
    [c.job_designation, c.job_details].filter(Boolean).join(", "),
    c.job_place,
    c.job_salary && (lang === "mr" ? `उत्पन्न: ${c.job_salary}` : `Income: ${c.job_salary}`),
  ].filter(Boolean) as string[];

  return (
    <div className="flex h-full flex-col justify-center pr-4 font-marathi text-white">
      <p className="text-[clamp(14px,1.4vw,26px)] text-haldi-300">
        {c.gender === "bride"
          ? (lang === "mr" ? "वधू" : "Bride")
          : (lang === "mr" ? "वर" : "Groom")}
        {" · "}
        {lang === "mr" ? "नोंदणी क्र." : "Reg. No."}
      </p>
      <p className="font-marathiHead text-[clamp(40px,5.2vw,110px)] font-bold leading-none text-haldi-500">
        {toMr(c.registration_no)}
      </p>
      <h2 className="mt-[2vh] font-marathiHead text-[clamp(26px,3vw,64px)] font-bold leading-tight">{c.candidate_name}</h2>
      <ul className="mt-[2.5vh] space-y-[1.2vh] text-[clamp(16px,1.7vw,34px)] leading-snug text-kumkum-100">
        {lines.slice(0, 7).map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    </div>
  );
}

// ── Right info panel (dynamic from DB config) ─────────────────────────────────
const placeMr = (p?: string, t?: string, d?: string) =>
  [p && `रा. ${p}`, t && `ता. ${t}`, d && `जि. ${d}`].filter(Boolean).join(", ");
const siblingsMr = (m: number, u: number) =>
  [m ? `विवाहित ${toMr(m)}` : "", u ? `अविवाहित ${toMr(u)}` : ""].filter(Boolean).join(", ");

function getFieldValue(c: Candidate, key: string): string {
  switch (key) {
    case "birth_date":         return dateMr(c.birth_date);
    case "birth_time":         return c.birth_time ? timeMr(c.birth_time, c.birth_vel) : "";
    case "complexion":         return c.complexion;
    case "blood_group":        return c.blood_group;
    case "father_name":        return c.father_name;
    case "father_job_details": return c.father_job_details;
    case "mother_name":        return c.mother_name;
    case "mother_job_details": return c.mother_job_details;
    case "father_place":       return placeMr(c.father_place, c.father_taluka, c.father_district);
    case "uncle_name":         return [c.uncle_name, c.uncle_kul && `(${c.uncle_kul})`].filter(Boolean).join(" ");
    case "brother_info":       return siblingsMr(c.brother_married, c.brother_unmarried);
    case "sister_info":        return siblingsMr(c.sister_married, c.sister_unmarried);
    case "expectation_details":return ""; // rendered separately
    default:                   return (c as any)[key] || "";
  }
}

function RightInfo({ c, displayConfig, lang }: { c: Candidate; displayConfig: DisplayConfigRow[]; lang: "mr" | "en" }) {
  const rows = displayConfig
    .filter(r => r.enabled && r.field_key !== "expectation_details")
    .map(r => ({ label: lang === "mr" ? r.label_mr : r.label_en, v: getFieldValue(c, r.field_key) }))
    .filter(r => r.v)
    .slice(0, 10);

  const showExp = displayConfig.find(r => r.field_key === "expectation_details")?.enabled;

  return (
    <div className="flex h-full flex-col justify-center gap-[1.6vh] pl-4 font-marathi text-white">
      <p className="text-[clamp(14px,1.3vw,24px)] text-haldi-300">
        {lang === "mr" ? "अधिक माहिती" : "More Details"}
      </p>
      <dl className="space-y-[1.3vh]">
        {rows.map((r) => (
          <div key={r.label} className="border-l-2 border-haldi-500/60 pl-3">
            <dt className="text-[clamp(11px,1vw,20px)] text-kumkum-200">{r.label}</dt>
            <dd className="text-[clamp(14px,1.45vw,30px)] font-semibold leading-snug">{r.v}</dd>
          </div>
        ))}
      </dl>
      {showExp && c.expectation_details && (
        <div className="rounded-2xl bg-white/5 p-[1vw] ring-1 ring-white/10">
          <p className="text-[clamp(11px,1vw,20px)] text-haldi-300">
            {lang === "mr" ? "अपेक्षा" : "Expectations"}
          </p>
          <p className="mt-1 line-clamp-4 text-[clamp(13px,1.2vw,24px)] leading-snug">{c.expectation_details}</p>
        </div>
      )}
    </div>
  );
}

export default function DisplayScreen({
  candidates,
  startId,
  displayConfig,
}: {
  candidates: Candidate[];
  startId?: number;
  displayConfig: DisplayConfigRow[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "groom" | "bride">("all");
  const [lang, setLang] = useState<"mr" | "en">("mr");
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

  useEffect(() => {
    if (!playing || list.length < 2) return;
    const t = setTimeout(() => go(1), secs * 1000);
    return () => clearTimeout(t);
  }, [playing, secs, safe, list.length, go]);

  useEffect(() => { const t = setInterval(() => router.refresh(), 60_000); return () => clearInterval(t); }, [router]);
  useEffect(() => {
    if (currentId.current === undefined) return;
    const i = list.findIndex((c) => c.id === currentId.current);
    if (i >= 0) setIdx(i);
  }, [list]);

  useEffect(() => {
    for (const o of [1, 2]) {
      const n = list[(safe + o) % (list.length || 1)];
      if (n?.photo_slots[0]) new Image().src = photoUrl(n, n.photo_slots[0]);
    }
  }, [safe, list]);

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

  const wake = useCallback(() => {
    setUi(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setUi(false), 3500);
  }, []);
  useEffect(() => { wake(); return () => clearTimeout(idle.current); }, [wake]);

  return (
    <div onMouseMove={wake} onTouchStart={wake}
      className={`relative h-dvh w-screen overflow-hidden bg-[#1a0910] ${ui ? "" : "cursor-none"}`}
      style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, #4a1220 0%, #1a0910 65%)" }}>

      {!cur ? (
        <div className="grid h-full place-items-center px-6 text-center text-white">
          <div>
            <h1 className="text-2xl font-bold font-marathi">
              {lang === "mr" ? "अजून काहीही दाखवायचे नाही" : "Nothing to show yet"}
            </h1>
            <p className="mt-2 text-kumkum-200 font-marathi">
              {lang === "mr"
                ? "बायोडेटा जोडा किंवा 'दृश्य' वर ठेवा."
                : "Add bio-data (switch profiles to visible) and they will appear here."}
            </p>
            <Link href="/" className="btn-gold mt-6">
              {lang === "mr" ? "← डॅशबोर्ड" : "← Back to dashboard"}
            </Link>
          </div>
        </div>
      ) : (
        <div key={cur.id} className="mvm-fade grid h-full grid-cols-1 gap-[2vw] px-[2vw] py-[2vh] min-[1100px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="hidden min-[1100px]:block"><Highlight c={cur} lang={lang} /></div>
          <div className="h-full min-[1100px]:aspect-[794/1123]">
            <ScaleToFit mode="contain" className="h-full w-full">
              <div className="shadow-[0_20px_80px_rgba(0,0,0,.6)]"><BioDataSheet c={cur} hideContact /></div>
            </ScaleToFit>
          </div>
          <div className="hidden min-[1100px]:block">
            <RightInfo c={cur} displayConfig={displayConfig} lang={lang} />
          </div>
        </div>
      )}

      {/* Progress bar */}
      {cur && playing && list.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/10">
          <div key={`${cur.id}-${secs}`} className="h-full origin-left bg-haldi-500"
            style={{ animation: `mvm-progress ${secs}s linear forwards` }} />
        </div>
      )}

      {/* Controls */}
      <div className={`absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent p-3 transition-opacity duration-300 ${ui ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <Link href={cur ? `/candidates/${cur.id}` : "/"} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20">
          <ArrowLeft size={16} /> {lang === "mr" ? "बाहेर" : "Exit"}
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm text-white">
          {/* Language toggle */}
          <div className="inline-flex rounded-lg bg-white/10 p-0.5" role="group" aria-label="Language">
            <button onClick={() => setLang("mr")} aria-pressed={lang === "mr"}
              className={`rounded-md px-3 py-1.5 text-xs font-bold ${lang === "mr" ? "bg-haldi-500 text-kumkum-900" : "hover:bg-white/10"}`}>मराठी</button>
            <button onClick={() => setLang("en")} aria-pressed={lang === "en"}
              className={`rounded-md px-3 py-1.5 text-xs font-bold ${lang === "en" ? "bg-haldi-500 text-kumkum-900" : "hover:bg-white/10"}`}>English</button>
          </div>
          {/* Gender filter */}
          <div className="inline-flex rounded-lg bg-white/10 p-0.5" role="group" aria-label="Filter">
            {(([["all", lang === "mr" ? "सर्व" : "All"], ["groom", lang === "mr" ? "वर" : "Grooms"], ["bride", lang === "mr" ? "वधू" : "Brides"]] as const)).map(([k, l]) => (
              <button key={k} onClick={() => { setFilter(k); setIdx(0); }} aria-pressed={filter === k}
                className={`rounded-md px-3 py-1.5 font-semibold text-xs ${filter === k ? "bg-haldi-500 text-kumkum-900" : "hover:bg-white/10"}`}>{l}</button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
            <span className="text-kumkum-100 text-xs">{lang === "mr" ? "बदल दर" : "Change every"}</span>
            <select value={secs} onChange={(e) => setSecs(Number(e.target.value))} className="rounded bg-transparent text-xs font-semibold focus:outline-none">
              {INTERVALS.map((s) => <option key={s} value={s} className="text-ink">{s}s</option>)}
            </select>
          </label>
          <button onClick={() => go(-1)} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20" aria-label="Previous"><ChevronLeft size={18} /></button>
          <button onClick={() => setPlaying(!playing)} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20">
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? (lang === "mr" ? "थांबवा" : "Pause") : (lang === "mr" ? "चालू करा" : "Auto-play")}
          </button>
          <button onClick={() => go(1)} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20" aria-label="Next"><ChevronRight size={18} /></button>
          <button onClick={toggleFull} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20">
            {full ? <Minimize size={16} /> : <Maximize size={16} />}
            {full ? (lang === "mr" ? "लहान करा" : "Exit Full") : (lang === "mr" ? "पूर्ण स्क्रीन" : "Full Screen")}
          </button>
          {cur && <span className="px-1 text-kumkum-200">{safe + 1} / {list.length}</span>}
        </div>
      </div>
    </div>
  );
}
