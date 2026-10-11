"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Save } from "lucide-react";
import MarathiInput, { TranslitContext } from "./MarathiInput";
import PhotoUploader, { type PhotoState } from "./PhotoUploader";
import BioDataSheet from "./BioDataSheet";
import ScaleToFit from "./ScaleToFit";
import { BIRTH_VEL, BLOOD_GROUPS, COMPLEXIONS, REGISTRATION_TYPES } from "@/lib/fields";
import { photoUrl, type Candidate } from "@/lib/schema";

type Kind = "mr" | "text" | "date" | "time" | "number" | "tel" | "email" | "area" | "select" | "combo";
type F = { k: string; label: string; kind: Kind; options?: string[]; span?: 1 | 2; hint?: string; mrDefault?: boolean };

const SECTIONS: { title: string; note?: string; fields: F[] }[] = [
  {
    title: "Registration",
    fields: [
      { k: "registration_no", label: "Registration no.", kind: "text", hint: "Leave empty to auto-generate" },
      { k: "registration_date", label: "Registration date", kind: "date" },
      { k: "registration_type", label: "Registration type", kind: "select", options: REGISTRATION_TYPES, span: 2 },
      { k: "old_registration_no", label: "Old registration no.", kind: "text" },
      { k: "pavati_book_no", label: "Receipt book no.", kind: "text" },
      { k: "pavati_no", label: "Receipt no.", kind: "text" },
      { k: "renew_date", label: "Renewal date", kind: "date" },
    ],
  },
  {
    title: "Personal details",
    fields: [
      { k: "candidate_name", label: "Full name", kind: "mr", span: 2 },
      { k: "birth_date", label: "Date of birth", kind: "date" },
      { k: "birth_time", label: "Birth time", kind: "time" },
      { k: "birth_vel", label: "Day / night birth", kind: "select", options: BIRTH_VEL },
      { k: "kul", label: "Kul (clan)", kind: "mr" },
      { k: "height_feet", label: "Height (feet)", kind: "number" },
      { k: "height_inch", label: "Height (inches)", kind: "number" },
      { k: "complexion", label: "Complexion", kind: "combo", options: COMPLEXIONS },
      { k: "blood_group", label: "Blood group", kind: "select", options: BLOOD_GROUPS },
    ],
  },
  {
    title: "Education & profession",
    note: "Type in English for degrees and company names — the toggle on each field switches Marathi typing on or off.",
    fields: [
      { k: "education", label: "Education", kind: "mr", mrDefault: false, span: 2 },
      { k: "job_details", label: "Job / business / company", kind: "mr", mrDefault: false, span: 2 },
      { k: "job_designation", label: "Designation", kind: "mr", mrDefault: false },
      { k: "job_place", label: "Work location", kind: "mr" },
      { k: "job_salary", label: "Annual income", kind: "mr" },
    ],
  },
  {
    title: "Family",
    fields: [
      { k: "father_name", label: "Father's name", kind: "mr", span: 2 },
      { k: "father_job_details", label: "Father's occupation", kind: "mr", span: 2 },
      { k: "mother_name", label: "Mother's name", kind: "mr", span: 2 },
      { k: "mother_job_details", label: "Mother's occupation", kind: "mr", span: 2 },
      { k: "father_place", label: "Native village", kind: "mr" },
      { k: "father_taluka", label: "Taluka", kind: "mr" },
      { k: "father_district", label: "District", kind: "mr" },
      { k: "uncle_name", label: "Maternal uncle (mama)", kind: "mr", span: 2 },
      { k: "uncle_kul", label: "Uncle's kul", kind: "mr" },
      { k: "uncle_place", label: "Uncle's village", kind: "mr" },
      { k: "uncle_taluka", label: "Uncle's taluka", kind: "mr" },
      { k: "uncle_district", label: "Uncle's district", kind: "mr" },
      { k: "brother_married", label: "Brothers (married)", kind: "number" },
      { k: "brother_unmarried", label: "Brothers (unmarried)", kind: "number" },
      { k: "sister_married", label: "Sisters (married)", kind: "number" },
      { k: "sister_unmarried", label: "Sisters (unmarried)", kind: "number" },
      { k: "relations_details", label: "Other relatives / notes", kind: "area", span: 2 },
    ],
  },
  {
    title: "Expectations",
    fields: [{ k: "expectation_details", label: "Expectations from the partner", kind: "area", span: 2 }],
  },
  {
    title: "Contact",
    note: "Contact details appear on printed and downloaded bio-data. On the big screen they stay hidden unless you switch them on below.",
    fields: [
      { k: "candidate_address", label: "Address", kind: "area", span: 2 },
      { k: "candidate_cell_no", label: "Candidate mobile", kind: "tel" },
      { k: "father_cell_no", label: "Father's mobile", kind: "tel" },
      { k: "mother_cell_no", label: "Mother's mobile", kind: "tel" },
      { k: "uncle_cell_no", label: "Uncle's mobile", kind: "tel" },
      { k: "candidate_email", label: "Email", kind: "email", span: 2 },
    ],
  },
];

const INTS = ["height_feet", "height_inch", "brother_married", "brother_unmarried", "sister_married", "sister_unmarried"];
const today = () => new Date().toISOString().slice(0, 10);

function initialState(c?: Candidate): Record<string, any> {
  const base: Record<string, any> = {};
  for (const s of SECTIONS) for (const f of s.fields) base[f.k] = "";
  base.gender = "groom";
  base.registration_type = REGISTRATION_TYPES[0];
  base.registration_date = today();
  base.is_active = true;
  base.show_contact_on_screen = false;
  if (c) for (const k of Object.keys(base)) if ((c as any)[k] !== undefined && (c as any)[k] !== null) base[k] = (c as any)[k];
  for (const k of INTS) if (base[k] === 0) base[k] = "";
  return base;
}

function Field({ f, v, set }: { f: F; v: Record<string, any>; set: (k: string, val: any) => void }) {
  const id = `f_${f.k}`;
  const val = v[f.k] ?? "";
  let control: React.ReactNode;
  switch (f.kind) {
    case "mr":
      control = <MarathiInput id={id} value={val} onChange={(x) => set(f.k, x)} defaultMarathi={f.mrDefault ?? true} />;
      break;
    case "area":
      control = <MarathiInput id={id} multiline value={val} onChange={(x) => set(f.k, x)} />;
      break;
    case "select":
      control = (
        <select id={id} className="field-input" value={val} onChange={(e) => set(f.k, e.target.value)}>
          <option value="">—</option>
          {f.options!.map((o) => <option key={o}>{o}</option>)}
        </select>
      );
      break;
    case "combo":
      control = (
        <>
          <input id={id} list={`${id}_l`} className="field-input font-marathi" value={val} onChange={(e) => set(f.k, e.target.value)} />
          <datalist id={`${id}_l`}>{f.options!.map((o) => <option key={o} value={o} />)}</datalist>
        </>
      );
      break;
    case "number":
      control = <input id={id} type="number" min={0} max={99} inputMode="numeric" className="field-input" value={val} onChange={(e) => set(f.k, e.target.value)} />;
      break;
    default:
      control = <input id={id} type={f.kind} inputMode={f.kind === "tel" ? "tel" : undefined} className="field-input" value={val} onChange={(e) => set(f.k, e.target.value)} />;
  }
  return (
    <div className={f.span === 2 ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1 block text-[13px] font-semibold text-stone-700">{f.label}</label>
      {control}
      {f.hint && <p className="mt-1 text-xs text-stone-500">{f.hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, title, desc }: { checked: boolean; onChange: (b: boolean) => void; title: string; desc: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white p-3.5">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-stone-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-kumkum-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-kumkum-500 peer-focus-visible:ring-offset-2" />
      <span><span className="block text-sm font-semibold text-stone-800">{title}</span><span className="block text-xs text-stone-500">{desc}</span></span>
    </label>
  );
}

export default function CandidateForm({ initial }: { initial?: Candidate }) {
  const router = useRouter();
  const [v, setV] = useState(() => initialState(initial));
  const [photoState, setPhotoState] = useState<PhotoState>({ 1: undefined, 2: undefined, 3: undefined });
  const [translit, setTranslit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, val: any) => setV((p) => ({ ...p, [k]: val }));

  const sources = useMemo(() => {
    const out: Record<number, string | undefined> = {};
    for (const s of [1, 2, 3] as const) {
      const st = photoState[s];
      if (typeof st === "string") out[s] = st;
      else if (st === undefined && initial?.photo_slots.includes(s)) out[s] = photoUrl(initial, s);
    }
    return out;
  }, [photoState, initial]);

  const preview: Candidate = useMemo(() => {
    const n = (k: string) => Number(v[k]) || 0;
    return {
      ...(v as any),
      id: initial?.id ?? 0,
      registration_no: v.registration_no || "—",
      candidate_name: v.candidate_name || "उमेदवाराचे नाव",
      height_feet: n("height_feet"), height_inch: n("height_inch"),
      brother_married: n("brother_married"), brother_unmarried: n("brother_unmarried"),
      sister_married: n("sister_married"), sister_unmarried: n("sister_unmarried"),
      photo_slots: Object.keys(sources).map(Number).sort(),
      photo_v: initial?.photo_v ?? 0,
      created_at: "",
    } as Candidate;
  }, [v, sources, initial]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!v.candidate_name.trim()) { setError("Please enter the candidate's name."); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setBusy(true); setError("");
    const photos: Record<string, string | null> = {};
    for (const s of [1, 2, 3] as const) if (photoState[s] !== undefined) photos[String(s)] = photoState[s]!;
    const body = { ...v, photos };
    try {
      const res = await fetch(initial ? `/api/candidates/${initial.id}` : "/api/candidates", {
        method: initial ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Could not save");
      router.push(`/candidates/${initial?.id ?? j.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message); setBusy(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <TranslitContext.Provider value={translit}>
      <form onSubmit={save} className="pb-28">
        {error && (
          <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <div className="card p-5">
              <p className="mb-2 text-[13px] font-semibold text-stone-700">This bio-data is for a</p>
              <div className="inline-flex rounded-xl bg-stone-100 p-1" role="radiogroup" aria-label="Groom or bride">
                {(["groom", "bride"] as const).map((g) => (
                  <button key={g} type="button" role="radio" aria-checked={v.gender === g} onClick={() => set("gender", g)}
                    className={`rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${v.gender === g ? "bg-kumkum-600 text-white shadow-sm" : "text-stone-600 hover:text-stone-900"}`}>
                    {g === "groom" ? "Groom (वर)" : "Bride (वधू)"}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Toggle checked={translit} onChange={setTranslit} title="Type in English, get Marathi"
                  desc="Type a word like “patil” and press space — it becomes पाटील. Needs internet; turn off if you use a Marathi keyboard." />
              </div>
            </div>

            {SECTIONS.map((s) => (
              <fieldset key={s.title} className="card p-5">
                <legend className="sr-only">{s.title}</legend>
                <h2 className="text-base font-bold text-kumkum-800">{s.title}</h2>
                {s.note && <p className="mt-0.5 text-xs text-stone-500">{s.note}</p>}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {s.fields.map((f) => <Field key={f.k} f={f} v={v} set={set} />)}
                </div>
                {s.title === "Contact" && (
                  <div className="mt-4"><Toggle checked={v.show_contact_on_screen} onChange={(b) => set("show_contact_on_screen", b)} title="Show contact details on the big screen" desc="Off by default so phone numbers are not broadcast to the whole crowd." /></div>
                )}
              </fieldset>
            ))}

            <div className="card p-5">
              <Toggle checked={v.is_active} onChange={(b) => set("is_active", b)} title="Show on big screen" desc="Hidden profiles stay saved but are skipped in the live display." />
            </div>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
            <div className="card p-5">
              <h2 className="mb-3 text-base font-bold text-kumkum-800">Photos</h2>
              <PhotoUploader sources={sources} onChange={(slot, val) => setPhotoState((p) => ({ ...p, [slot]: val }))} />
            </div>
            <div className="card hidden p-4 xl:block">
              <h2 className="mb-3 text-base font-bold text-kumkum-800">Live preview</h2>
              <ScaleToFit mode="width" className="overflow-hidden rounded-lg ring-1 ring-stone-200">
                <BioDataSheet c={preview} photos={sources} />
              </ScaleToFit>
            </div>
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
            <button type="button" onClick={() => router.back()} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary min-w-40">
              {busy ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {initial ? "Save changes" : "Save bio-data"}
            </button>
          </div>
        </div>
      </form>
    </TranslitContext.Provider>
  );
}
