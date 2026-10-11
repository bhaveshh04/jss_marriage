import Link from "next/link";
import { Eye, EyeOff, ImageOff, Pencil, Printer, Search, MonitorPlay, Users, UserRound, Image as ImageIcon } from "lucide-react";
import { getStats, listCandidates } from "@/lib/db";
import { photoUrl, type Candidate } from "@/lib/schema";
import { ageYears, toMr } from "@/lib/marathi";
import DeleteButton from "@/components/DeleteButton";
import VisibilityToggle from "@/components/VisibilityToggle";

export const dynamic = "force-dynamic";
const PAGE = 12;

function Stat({ icon, label, value, tone = "" }: { icon: React.ReactNode; label: string; value: number; tone?: string }) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone || "bg-kumkum-50 text-kumkum-600"}`}>{icon}</span>
      <div><p className="text-2xl font-extrabold leading-none text-ink">{value}</p><p className="mt-1 text-xs font-medium text-stone-500">{label}</p></div>
    </div>
  );
}

function CandidateCard({ c }: { c: Candidate }) {
  const age = ageYears(c.birth_date);
  const main = c.photo_slots[0];
  return (
    <article className={`card flex gap-4 p-4 ${c.is_active ? "" : "opacity-70"}`}>
      <Link href={`/candidates/${c.id}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200" aria-label={`Open ${c.candidate_name}`}>
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl(c, main)} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
        ) : (
          <span className="grid h-full w-full place-items-center text-stone-400"><ImageOff size={24} /></span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/candidates/${c.id}`} className="min-w-0">
            <h2 className="truncate font-marathi text-[17px] font-bold text-ink hover:text-kumkum-700">{c.candidate_name}</h2>
          </Link>
          <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${c.gender === "bride" ? "bg-haldi-100 text-haldi-700" : "bg-kumkum-50 text-kumkum-700"}`}>
            {c.gender === "bride" ? "Bride" : "Groom"}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-stone-500">Reg. {c.registration_no}{age !== null && <> · <span className="font-marathi">{toMr(age)} वर्षे</span></>}</p>
        <p className="mt-1.5 line-clamp-2 font-marathi text-[13px] text-stone-700">
          {[c.education, c.job_designation, c.job_place].filter(Boolean).join(" · ") || "—"}
        </p>
        <div className="mt-auto flex items-center gap-0.5 pt-2">
          <Link href={`/candidates/${c.id}?print=1`} className="icon-btn" title="Print" aria-label="Print"><Printer size={17} /></Link>
          <Link href={`/display?id=${c.id}`} className="icon-btn" title="Show on big screen" aria-label="Display"><MonitorPlay size={17} /></Link>
          <Link href={`/candidates/${c.id}/edit`} className="icon-btn" title="Edit" aria-label="Edit"><Pencil size={17} /></Link>
          <VisibilityToggle id={c.id} active={c.is_active} />
          <span className="ml-auto"><DeleteButton id={c.id} name={c.candidate_name} /></span>
        </div>
      </div>
    </article>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: { q?: string; gender?: string; status?: string; page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const [{ rows, total }, stats] = await Promise.all([
    listCandidates({ ...searchParams, page, pageSize: PAGE }),
    getStats(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const qs = (p: number) => {
    const u = new URLSearchParams();
    for (const k of ["q", "gender", "status"] as const) if (searchParams[k]) u.set(k, searchParams[k]!);
    u.set("page", String(p));
    return `/?${u}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Users size={20} />} label="Total bio-data" value={stats.total} />
        <Stat icon={<UserRound size={20} />} label={`Grooms · ${stats.brides} brides`} value={stats.grooms} tone="bg-haldi-100 text-haldi-700" />
        <Stat icon={<MonitorPlay size={20} />} label="On the big screen" value={stats.on_screen} tone="bg-mehendi-500/10 text-mehendi-600" />
        <Stat icon={<ImageIcon size={20} />} label="Missing a photo" value={stats.no_photo} tone="bg-stone-100 text-stone-600" />
      </div>

      <form className="card flex flex-wrap items-end gap-3 p-4" role="search">
        <div className="min-w-56 flex-1">
          <label htmlFor="q" className="mb-1 block text-[13px] font-semibold text-stone-700">Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
            <input id="q" name="q" defaultValue={searchParams.q} placeholder="Name, registration no., education, kul, place" className="field-input pl-10 font-marathi" />
          </div>
        </div>
        <div>
          <label htmlFor="g" className="mb-1 block text-[13px] font-semibold text-stone-700">Show</label>
          <select id="g" name="gender" defaultValue={searchParams.gender ?? ""} className="field-input">
            <option value="">Grooms & brides</option><option value="groom">Grooms</option><option value="bride">Brides</option>
          </select>
        </div>
        <div>
          <label htmlFor="s" className="mb-1 block text-[13px] font-semibold text-stone-700">Big screen</label>
          <select id="s" name="status" defaultValue={searchParams.status ?? ""} className="field-input">
            <option value="">All</option><option value="active">Visible</option><option value="hidden">Hidden</option>
          </select>
        </div>
        <button className="btn-primary">Apply</button>
        {(searchParams.q || searchParams.gender || searchParams.status) && <Link href="/" className="btn-ghost">Clear</Link>}
      </form>

      {rows.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <h2 className="text-lg font-bold text-kumkum-900">{total === 0 && !searchParams.q ? "No bio-data yet" : "Nothing matches that search"}</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">
            {total === 0 && !searchParams.q ? "Add the first groom or bride to get started." : "Try a different name or clear the filters."}
          </p>
          <Link href="/candidates/new" className="btn-primary mt-5">Add bio-data</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-500">{total} bio-data{total === 1 ? "" : "s"}</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((c) => <CandidateCard key={c.id} c={c} />)}</div>
          {pages > 1 && (
            <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Pagination">
              {page > 1 ? <Link href={qs(page - 1)} className="btn-outline">Previous</Link> : <span />}
              <span className="text-sm text-stone-500">Page {page} of {pages}</span>
              {page < pages ? <Link href={qs(page + 1)} className="btn-outline">Next</Link> : <span />}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
