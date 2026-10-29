"use client";
import { forwardRef } from "react";
import { photoUrl, type Candidate } from "@/lib/schema";
import { ageYears, dateMr, heightMr, timeMr, titleMr, toMr } from "@/lib/marathi";

export const SHEET_W = 794; // A4 @ 96dpi
export const SHEET_H = 1123;

// Khandesh Maratha Mandal — event branding
const EVENT  = process.env.NEXT_PUBLIC_EVENT_TITLE_MR  || "मराठा वधू-वर मेळावा";
const ORG    = process.env.NEXT_PUBLIC_ORG_NAME_MR     || "खान्देश मराठा मंडळ";
const SUBORG = process.env.NEXT_PUBLIC_ORG_SUBNAME_MR  || "पिंपरी चिंचवड व पुणे जिल्हा परिसर";
const STHAPANA = process.env.NEXT_PUBLIC_STHAPANA      || "स्थापना : १ मे १९८६";
const REG_NO   = process.env.NEXT_PUBLIC_REG_NO        || "र. नं. महाराष्ट्र २८८९/८६ एफ ३९७८-पुणे";
const CONTACT  = process.env.NEXT_PUBLIC_ORG_CONTACT   || "";
const JAI1     = process.env.NEXT_PUBLIC_JAI1          || "जय जिजाऊ";
const JAI2     = process.env.NEXT_PUBLIC_JAI2          || "जय शिवराय";

const K = "#8C1D2F"; // kumkum red
const H = "#D9A21B"; // haldi gold

function Row({ l, v, strong }: { l: string; v?: string | null; strong?: boolean }) {
  if (!v) return null;
  return (
    <div className="grid grid-cols-[118px_1fr] gap-x-2 py-[2.5px] leading-[1.4]">
      <span className="text-[#6b4a43]">{l}</span>
      <span className={strong ? "font-bold text-[#241B18]" : "text-[#241B18]"}>
        <span className="mr-1 text-[#b79a6a]">:</span>{v}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-[14px]">
      <div className="flex items-center gap-3">
        <h3 className="font-marathiHead text-[17px] font-bold" style={{ color: K }}>{title}</h3>
        <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${H}, transparent)` }} />
      </div>
      <div className="mt-1">{children}</div>
    </section>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <svg className={`absolute ${className}`} width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <path d="M2 62V14C2 7 7 2 14 2h48" stroke={K} strokeWidth="2.5" />
      <path d="M10 62V22c0-6 5-12 12-12h40" stroke={H} strokeWidth="1.2" />
      <circle cx="16" cy="16" r="5" fill={H} />
      <circle cx="16" cy="16" r="2" fill={K} />
    </svg>
  );
}

function Silhouette() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#F3E9D2] text-[#b79a6a]">
      <svg width="84" height="84" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="12" cy="8" r="4.2" /><path d="M3.5 21c0-4.7 3.8-8 8.5-8s8.5 3.3 8.5 8z" />
      </svg>
      <span className="mt-1 font-marathi text-[13px]">फोटो उपलब्ध नाही</span>
    </div>
  );
}

type Props = { c: Candidate; hideContact?: boolean; photos?: Record<number, string | undefined> };

const BioDataSheet = forwardRef<HTMLDivElement, Props>(function BioDataSheet({ c, hideContact, photos }, ref) {
  const src = (s: number) => photos?.[s] ?? photoUrl(c, s);
  const age = ageYears(c.birth_date);
  const place = (p?: string, t?: string, d?: string) =>
    [p && `रा. ${p}`, t && `ता. ${t}`, d && `जि. ${d}`].filter(Boolean).join(", ");
  const job = [c.job_details, c.job_designation].filter(Boolean).join(" — ");
  const siblings = (m: number, u: number) =>
    m || u ? [m ? `विवाहित ${toMr(m)}` : "", u ? `अविवाहित ${toMr(u)}` : ""].filter(Boolean).join(", ") : "";
  const showContact = !hideContact || c.show_contact_on_screen;
  const extra = c.photo_slots.filter((s) => s !== 1);
  const main = c.photo_slots.includes(1) ? 1 : c.photo_slots[0];

  return (
    <div
      ref={ref}
      className="bio-sheet relative overflow-hidden bg-[#FFFCF4] font-marathi text-[14px] text-[#241B18]"
      style={{ width: SHEET_W, height: SHEET_H }}
    >
      {/* decorative border frame */}
      <div className="pointer-events-none absolute inset-[14px] border-[3px]" style={{ borderColor: K }} />
      <div className="pointer-events-none absolute inset-[22px] border" style={{ borderColor: H }} />
      <Corner className="left-[10px] top-[10px]" />
      <Corner className="right-[10px] top-[10px] -scale-x-100" />
      <Corner className="bottom-[10px] left-[10px] -scale-y-100" />
      <Corner className="bottom-[10px] right-[10px] -scale-100" />

      <div className="relative flex h-full flex-col px-[52px] pb-[40px] pt-[32px]">
        {/* ── Header: Khandesh Maratha Mandal branding ── */}
        <header className="text-center">
          {/* Top info bar */}
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#6b4a43]">
            <span>{STHAPANA}</span>
            <span>{REG_NO}</span>
          </div>
          {/* Jai slogans */}
          <div className="flex items-center justify-between font-marathiHead text-[15px] font-bold" style={{ color: K }}>
            <span>{JAI1}</span>
            <span className="text-[10px] tracking-wide text-[#b79a6a]">॥ श्री गणेशाय नमः ॥</span>
            <span>{JAI2}</span>
          </div>
          {/* Org name banner */}
          <div
            className="my-1.5 py-[5px] px-6 font-marathiHead text-[28px] font-bold text-white leading-tight"
            style={{ background: K, borderLeft: `5px solid ${H}`, borderRight: `5px solid ${H}` }}
          >
            {ORG}
          </div>
          <p className="text-[13px] font-semibold text-[#6b4a43]">{SUBORG}</p>
          {/* Event title */}
          <p className="mt-0.5 font-marathiHead text-[17px] font-bold" style={{ color: H }}>{EVENT}</p>
          {/* Gender badge */}
          <div className="mx-auto mt-2 flex w-fit items-center gap-3 rounded-sm px-8 py-[3px] font-marathiHead text-[18px] font-bold text-white" style={{ background: K }}>
            <span style={{ color: H }}>❖</span>{titleMr(c.gender)}<span style={{ color: H }}>❖</span>
          </div>
          {/* Registration info */}
          <div className="mt-1.5 flex justify-between text-[12.5px] text-[#6b4a43]">
            <span>नोंदणी क्र. : <b className="text-[#241B18]">{toMr(c.registration_no)}</b></span>
            <span>नोंदणी दिनांक : <b className="text-[#241B18]">{dateMr(c.registration_date)}</b></span>
          </div>
        </header>

        {/* ── Personal + photo ── */}
        <div className="mt-2 flex gap-5">
          <div className="min-w-0 flex-1">
            <Section title="वैयक्तिक माहिती">
              <Row l="नाव" v={c.candidate_name} strong />
              <Row l="नोंदणी प्रकार" v={c.registration_type} />
              <Row l="जन्म तारीख" v={`${dateMr(c.birth_date)}${age !== null ? ` (वय ${toMr(age)} वर्षे)` : ""}`.trim()} />
              <Row l="जन्म वेळ" v={c.birth_time ? timeMr(c.birth_time, c.birth_vel) : ""} />
              <Row l="कुळ" v={c.kul} />
              <Row l="उंची" v={heightMr(c.height_feet, c.height_inch)} />
              <Row l="वर्ण" v={c.complexion} />
              <Row l="रक्तगट" v={c.blood_group} />
            </Section>
          </div>
          <div className="mt-[14px] w-[200px] shrink-0">
            <div className="p-[5px]" style={{ background: `linear-gradient(135deg, ${H}, #f3d98a, ${H})` }}>
              <div className="h-[250px] w-full overflow-hidden border-2 bg-white" style={{ borderColor: K }}>
                {main ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src(main)} alt={c.candidate_name} className="h-full w-full object-cover object-top" crossOrigin="anonymous" />
                ) : <Silhouette />}
              </div>
            </div>
            {extra.length > 0 && (
              <div className="mt-2 flex gap-2">
                {extra.slice(0, 2).map((s) => (
                  <div key={s} className="h-[76px] flex-1 overflow-hidden border" style={{ borderColor: H }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src(s)} alt="" className="h-full w-full object-cover object-top" crossOrigin="anonymous" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Section title="शिक्षण व व्यवसाय">
          <Row l="शिक्षण" v={c.education} />
          <Row l="नोकरी / व्यवसाय" v={job} />
          <Row l="कामाचे ठिकाण" v={c.job_place} />
          <Row l="वार्षिक उत्पन्न" v={c.job_salary} />
        </Section>

        <Section title="कौटुंबिक माहिती">
          <Row l="वडिलांचे नाव" v={c.father_name} strong />
          <Row l="वडिलांचा व्यवसाय" v={c.father_job_details} />
          <Row l="आईचे नाव" v={c.mother_name} />
          <Row l="आईचा व्यवसाय" v={c.mother_job_details} />
          <Row l="मूळ गाव" v={place(c.father_place, c.father_taluka, c.father_district)} />
          <Row l="मामा" v={[c.uncle_name, c.uncle_kul && `(${c.uncle_kul})`].filter(Boolean).join(" ")} />
          <Row l="मामांचे गाव" v={place(c.uncle_place, c.uncle_taluka, c.uncle_district)} />
          <Row l="भाऊ" v={siblings(c.brother_married, c.brother_unmarried)} />
          <Row l="बहीण" v={siblings(c.sister_married, c.sister_unmarried)} />
          <Row l="इतर नातेसंबंध" v={c.relations_details} />
        </Section>

        {c.expectation_details && (
          <Section title="अपेक्षा">
            <p className="leading-[1.5]">{c.expectation_details}</p>
          </Section>
        )}

        {showContact && (c.candidate_address || c.father_cell_no || c.candidate_cell_no) && (
          <Section title="संपर्क">
            <Row l="पत्ता" v={c.candidate_address} />
            <Row l="मोबाईल" v={[c.candidate_cell_no && toMr(c.candidate_cell_no), c.father_cell_no && `वडील: ${toMr(c.father_cell_no)}`].filter(Boolean).join("   ")} />
          </Section>
        )}

        <footer className="mt-auto flex items-end justify-between border-t pt-2 text-[12px] text-[#6b4a43]" style={{ borderColor: H }}>
          <span>{ORG} — {SUBORG}</span>
          <span>{CONTACT}</span>
        </footer>
      </div>
    </div>
  );
});

export default BioDataSheet;
