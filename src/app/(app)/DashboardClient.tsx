"use client";
import { useLang, t } from "@/lib/lang";
import Link from "next/link";
import { Eye, EyeOff, ImageOff, Pencil, Printer, Search, MonitorPlay, Users, UserRound, Image as ImageIcon, Heart } from "lucide-react";
import { type Candidate } from "@/lib/schema";
import { ageYears, toMr } from "@/lib/marathi";
import DeleteButton from "@/components/DeleteButton";
import VisibilityToggle from "@/components/VisibilityToggle";
import { photoUrl } from "@/lib/schema";

type Stats = { total: number; grooms: number; brides: number; on_screen: number; no_photo: number };

function Stat({ icon, label_mr, label_en, value, tone = "" }: { icon: React.ReactNode; label_mr: string; label_en: string; value: number; tone?: string }) {
  const { lang } = useLang();
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone || "bg-kumkum-50 text-kumkum-600"}`}>{icon}</span>
      <div>
        <p className="text-2xl font-extrabold leading-none text-ink">{value}</p>
        <p className="mt-1 text-xs font-medium text-stone-500">{t(lang, label_mr, label_en)}</p>
      </div>
    </div>
  );
}

function CandidateCard({ c }: { c: Candidate }) {
  const { lang } = useLang();
  const age = ageYears(c.birth_date);
  const main = c.photo_slots[0];
  const genderLabel = c.gender === "bride"
    ? t(lang, "वधू", "Bride")
    : t(lang, "वर", "Groom");

  return (
    <article className={`card group flex gap-4 p-4 transition-shadow hover:shadow-md ${c.is_active ? "" : "opacity-70"}`}>
      <Link href={`/candidates/${c.id}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200 transition-transform group-hover:scale-[1.02]"
        aria-label={`Open ${c.candidate_name}`}>
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl(c, main)} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
        ) : (
          <span className="grid h-full w-full place-items-center text-stone-400"><ImageOff size={24} /></span>
        )}
        {/* Active/hidden indicator dot */}
        <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white ${c.is_active ? "bg-green-400" : "bg-stone-400"}`} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/candidates/${c.id}`} className="min-w-0">
            <h2 className="truncate font-marathi text-[17px] font-bold text-ink hover:text-kumkum-700">{c.candidate_name}</h2>
          </Link>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${c.gender === "bride" ? "bg-haldi-100 text-haldi-700" : "bg-kumkum-50 text-kumkum-700"}`}>
            <Heart size={9} className="mr-0.5 inline" />{genderLabel}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-stone-500">
          {t(lang, "नोंदणी", "Reg.")} {c.registration_no}
          {age !== null && <> · <span className="font-marathi">{toMr(age)} {t(lang, "वर्षे", "yrs")}</span></>}
        </p>
        {(c.education || c.job_designation || c.job_place) && (
          <p className="mt-1.5 line-clamp-2 font-marathi text-[13px] text-stone-600">
            {[c.education, c.job_designation, c.job_place].filter(Boolean).join(" · ")}
          </p>
        )}
        {(c.kul) && (
          <p className="mt-0.5 font-marathi text-[12px] text-stone-400">
            {t(lang, "कुळ:", "Kul:")} {c.kul}
          </p>
        )}
        <div className="mt-auto flex items-center gap-0.5 pt-2">
          <Link href={`/candidates/${c.id}?print=1`} className="icon-btn" title={t(lang, "छपाई", "Print")}><Printer size={17} /></Link>
          <Link href={`/display?id=${c.id}`} className="icon-btn" title={t(lang, "मोठ्या स्क्रीनवर", "Display")}><MonitorPlay size={17} /></Link>
          <Link href={`/candidates/${c.id}/edit`} className="icon-btn" title={t(lang, "संपादन", "Edit")}><Pencil size={17} /></Link>
          <VisibilityToggle id={c.id} active={c.is_active} />
          <span className="ml-auto"><DeleteButton id={c.id} name={c.candidate_name} /></span>
        </div>
      </div>
    </article>
  );
}

export default function DashboardClient({ rows, total, stats, page, pages, searchParams }: {
  rows: Candidate[];
  total: number;
  stats: Stats;
  page: number;
  pages: number;
  searchParams: Record<string, string | undefined>;
}) {
  const { lang } = useLang();

  const qs = (p: number) => {
    const u = new URLSearchParams();
    for (const k of ["q", "gender", "status"] as const) if (searchParams[k]) u.set(k, searchParams[k]!);
    u.set("page", String(p));
    return `/?${u}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Users size={20} />} label_mr="एकूण बायोडेटा" label_en="Total Bio-Data" value={stats.total} />
        <Stat icon={<UserRound size={20} />} label_mr={`वर · ${stats.brides} वधू`} label_en={`Grooms · ${stats.brides} brides`} value={stats.grooms} tone="bg-haldi-100 text-haldi-700" />
        <Stat icon={<MonitorPlay size={20} />} label_mr="मोठ्या स्क्रीनवर" label_en="On Big Screen" value={stats.on_screen} tone="bg-mehendi-500/10 text-mehendi-600" />
        <Stat icon={<ImageIcon size={20} />} label_mr="फोटो नाही" label_en="Missing Photo" value={stats.no_photo} tone="bg-stone-100 text-stone-600" />
      </div>

      {/* Search / filter form */}
      <form className="card flex flex-wrap items-end gap-3 p-4" role="search" method="GET" action="/">
        <div className="min-w-56 flex-1">
          <label htmlFor="q" className="mb-1 block text-[13px] font-semibold text-stone-700">
            {t(lang, "शोधा", "Search")}
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
            <input id="q" name="q" defaultValue={searchParams.q}
              placeholder={t(lang, "नाव, नोंदणी क्र., शिक्षण, कुळ, ठिकाण", "Name, reg no., education, kul, place")}
              className="field-input pl-10 font-marathi" />
          </div>
        </div>
        <div>
          <label htmlFor="g" className="mb-1 block text-[13px] font-semibold text-stone-700">
            {t(lang, "दाखवा", "Show")}
          </label>
          <select id="g" name="gender" defaultValue={searchParams.gender ?? ""} className="field-input">
            <option value="">{t(lang, "वर आणि वधू", "Grooms & Brides")}</option>
            <option value="groom">{t(lang, "वर", "Grooms")}</option>
            <option value="bride">{t(lang, "वधू", "Brides")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="s" className="mb-1 block text-[13px] font-semibold text-stone-700">
            {t(lang, "स्क्रीन", "Screen")}
          </label>
          <select id="s" name="status" defaultValue={searchParams.status ?? ""} className="field-input">
            <option value="">{t(lang, "सर्व", "All")}</option>
            <option value="active">{t(lang, "दृश्य", "Visible")}</option>
            <option value="hidden">{t(lang, "लपवलेले", "Hidden")}</option>
          </select>
        </div>
        <button className="btn-primary">{t(lang, "लागू करा", "Apply")}</button>
        {(searchParams.q || searchParams.gender || searchParams.status) && (
          <Link href="/" className="btn-ghost">{t(lang, "साफ करा", "Clear")}</Link>
        )}
      </form>

      {/* Results */}
      {rows.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-kumkum-50">
            <Heart size={32} className="text-kumkum-400" />
          </div>
          <h2 className="text-lg font-bold text-kumkum-900">
            {total === 0 && !searchParams.q
              ? t(lang, "अजून बायोडेटा नाही", "No bio-data yet")
              : t(lang, "काहीही जुळत नाही", "Nothing matches that search")}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">
            {total === 0 && !searchParams.q
              ? t(lang, "पहिला वर किंवा वधू जोडा.", "Add the first groom or bride to get started.")
              : t(lang, "वेगळे नाव किंवा फिल्टर वापरा.", "Try a different name or clear the filters.")}
          </p>
          <Link href="/candidates/new" className="btn-primary mt-5">
            {t(lang, "+ बायोडेटा जोडा", "+ Add Bio-Data")}
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-500">
            {total} {t(lang, "बायोडेटा", "bio-data record")}{total !== 1 && lang === "en" ? "s" : ""}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((c) => <CandidateCard key={c.id} c={c} />)}
          </div>
          {pages > 1 && (
            <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Pagination">
              {page > 1 ? <Link href={qs(page - 1)} className="btn-outline">{t(lang, "मागील", "Previous")}</Link> : <span />}
              <span className="text-sm text-stone-500">
                {t(lang, "पृष्ठ", "Page")} {page} / {pages}
              </span>
              {page < pages ? <Link href={qs(page + 1)} className="btn-outline">{t(lang, "पुढील", "Next")}</Link> : <span />}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
