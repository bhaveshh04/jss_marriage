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
import { useLang, t } from "@/lib/lang";

type Kind = "mr" | "text" | "date" | "time" | "number" | "tel" | "email" | "area" | "select" | "combo";
type F = {
  k: string;
  label_mr: string;
  label_en: string;
  kind: Kind;
  options?: string[];
  span?: 1 | 2;
  hint_mr?: string;
  hint_en?: string;
  mrDefault?: boolean;
};

const SECTIONS: { title_mr: string; title_en: string; note_mr?: string; note_en?: string; fields: F[] }[] = [
  {
    title_mr: "नोंदणी", title_en: "Registration",
    fields: [
      { k: "registration_no",   label_mr: "नोंदणी क्र.",     label_en: "Registration No.",   kind: "text", hint_mr: "रिकामे सोडा - आपोआप तयार होईल", hint_en: "Leave empty to auto-generate" },
      { k: "registration_date", label_mr: "नोंदणी तारीख",    label_en: "Registration Date",  kind: "date" },
      { k: "registration_type", label_mr: "नोंदणी प्रकार",   label_en: "Registration Type",  kind: "select", options: REGISTRATION_TYPES, span: 2 },
      { k: "old_registration_no", label_mr: "जुना नोंदणी क्र.", label_en: "Old Reg. No.",    kind: "text" },
      { k: "pavati_book_no",    label_mr: "पावती पुस्तक क्र.", label_en: "Receipt Book No.",  kind: "text" },
      { k: "pavati_no",         label_mr: "पावती क्र.",       label_en: "Receipt No.",        kind: "text" },
      { k: "renew_date",        label_mr: "नूतनीकरण तारीख",  label_en: "Renewal Date",       kind: "date" },
    ],
  },
  {
    title_mr: "वैयक्तिक माहिती", title_en: "Personal Details",
    fields: [
      { k: "candidate_name", label_mr: "पूर्ण नाव",       label_en: "Full Name",         kind: "mr", span: 2 },
      { k: "birth_date",     label_mr: "जन्म तारीख",      label_en: "Date of Birth",     kind: "date" },
      { k: "birth_time",     label_mr: "जन्म वेळ",        label_en: "Birth Time",        kind: "time" },
      { k: "birth_vel",      label_mr: "दिवसा / रात्री",  label_en: "Day / Night Birth", kind: "select", options: BIRTH_VEL },
      { k: "kul",            label_mr: "कुळ",             label_en: "Kul (Clan)",        kind: "mr" },
      { k: "height_feet",    label_mr: "उंची (फूट)",      label_en: "Height (Feet)",     kind: "number" },
      { k: "height_inch",    label_mr: "उंची (इंच)",      label_en: "Height (Inches)",   kind: "number" },
      { k: "complexion",     label_mr: "वर्ण",            label_en: "Complexion",        kind: "combo", options: COMPLEXIONS },
      { k: "blood_group",    label_mr: "रक्तगट",          label_en: "Blood Group",       kind: "select", options: BLOOD_GROUPS },
    ],
  },
  {
    title_mr: "शिक्षण व व्यवसाय", title_en: "Education & Profession",
    note_mr: "डिग्री व कंपनीची नावे इंग्रजीत लिहा — प्रत्येक फील्डवर मराठी/इंग्रजी बटण आहे.",
    note_en: "Type in English for degrees and company names — the toggle on each field switches Marathi typing.",
    fields: [
      { k: "education",       label_mr: "शिक्षण",              label_en: "Education",             kind: "mr", mrDefault: false, span: 2 },
      { k: "job_details",     label_mr: "नोकरी / व्यवसाय",    label_en: "Job / Business",        kind: "mr", mrDefault: false, span: 2 },
      { k: "job_designation", label_mr: "पद",                  label_en: "Designation",           kind: "mr", mrDefault: false },
      { k: "job_place",       label_mr: "कामाचे ठिकाण",       label_en: "Work Location",         kind: "mr" },
      { k: "job_salary",      label_mr: "वार्षिक उत्पन्न",    label_en: "Annual Income",         kind: "mr" },
    ],
  },
  {
    title_mr: "कौटुंबिक माहिती", title_en: "Family Details",
    fields: [
      { k: "father_name",         label_mr: "वडिलांचे नाव",       label_en: "Father's Name",        kind: "mr", span: 2 },
      { k: "father_job_details",  label_mr: "वडिलांचा व्यवसाय",   label_en: "Father's Occupation",  kind: "mr", span: 2 },
      { k: "mother_name",         label_mr: "आईचे नाव",            label_en: "Mother's Name",        kind: "mr", span: 2 },
      { k: "mother_job_details",  label_mr: "आईचा व्यवसाय",       label_en: "Mother's Occupation",  kind: "mr", span: 2 },
      { k: "father_place",        label_mr: "मूळ गाव",             label_en: "Native Village",       kind: "mr" },
      { k: "father_taluka",       label_mr: "तालुका",              label_en: "Taluka",               kind: "mr" },
      { k: "father_district",     label_mr: "जिल्हा",              label_en: "District",             kind: "mr" },
      { k: "uncle_name",          label_mr: "मामा",                label_en: "Maternal Uncle",       kind: "mr", span: 2 },
      { k: "uncle_kul",           label_mr: "मामांचे कुळ",         label_en: "Uncle's Kul",          kind: "mr" },
      { k: "uncle_place",         label_mr: "मामांचे गाव",         label_en: "Uncle's Village",      kind: "mr" },
      { k: "uncle_taluka",        label_mr: "मामांचा तालुका",      label_en: "Uncle's Taluka",       kind: "mr" },
      { k: "uncle_district",      label_mr: "मामांचा जिल्हा",      label_en: "Uncle's District",     kind: "mr" },
      { k: "brother_married",     label_mr: "भाऊ (विवाहित)",       label_en: "Brothers (Married)",   kind: "number" },
      { k: "brother_unmarried",   label_mr: "भाऊ (अविवाहित)",      label_en: "Brothers (Unmarried)", kind: "number" },
      { k: "sister_married",      label_mr: "बहीण (विवाहित)",      label_en: "Sisters (Married)",    kind: "number" },
      { k: "sister_unmarried",    label_mr: "बहीण (अविवाहित)",     label_en: "Sisters (Unmarried)",  kind: "number" },
      { k: "relations_details",   label_mr: "इतर नातेसंबंध",       label_en: "Other Relatives",      kind: "area", span: 2 },
    ],
  },
  {
    title_mr: "अपेक्षा", title_en: "Expectations",
    fields: [{ k: "expectation_details", label_mr: "जोडीदाराकडून अपेक्षा", label_en: "Expectations from Partner", kind: "area", span: 2 }],
  },
  {
    title_mr: "संपर्क", title_en: "Contact",
    note_mr: "संपर्क माहिती मुद्रित बायोडेटावर दिसेल. मोठ्या स्क्रीनवर डीफॉल्टने लपवले जाते.",
    note_en: "Contact details appear on printed bio-data. On the big screen they stay hidden unless switched on.",
    fields: [
      { k: "candidate_address", label_mr: "पत्ता",              label_en: "Address",           kind: "area", span: 2 },
      { k: "candidate_cell_no", label_mr: "उमेदवाराचा मोबाईल",  label_en: "Candidate Mobile",  kind: "tel" },
      { k: "father_cell_no",    label_mr: "वडिलांचा मोबाईल",    label_en: "Father's Mobile",   kind: "tel" },
      { k: "mother_cell_no",    label_mr: "आईचा मोबाईल",        label_en: "Mother's Mobile",   kind: "tel" },
      { k: "uncle_cell_no",     label_mr: "मामांचा मोबाईल",     label_en: "Uncle's Mobile",    kind: "tel" },
      { k: "candidate_email",   label_mr: "ईमेल",               label_en: "Email",             kind: "email", span: 2 },
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

function Field({ f, v, set, lang: appLang }: { f: F; v: Record<string, any>; set: (k: string, val: any) => void; lang: "mr" | "en" }) {
  const id = `f_${f.k}`;
  const val = v[f.k] ?? "";
  const label = appLang === "mr" ? f.label_mr : f.label_en;
  const hint = appLang === "mr" ? f.hint_mr : f.hint_en;
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
      <label htmlFor={id} className="mb-1 block text-[13px] font-semibold text-stone-700">{label}</label>
      {control}
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
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
  const { lang } = useLang();
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
      candidate_name: v.candidate_name || (lang === "mr" ? "उमेदवाराचे नाव" : "Candidate Name"),
      height_feet: n("height_feet"), height_inch: n("height_inch"),
      brother_married: n("brother_married"), brother_unmarried: n("brother_unmarried"),
      sister_married: n("sister_married"), sister_unmarried: n("sister_unmarried"),
      photo_slots: Object.keys(sources).map(Number).sort(),
      photo_v: initial?.photo_v ?? 0,
      created_at: "",
    } as Candidate;
  }, [v, sources, initial, lang]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!v.candidate_name.trim()) {
      setError(t(lang, "कृपया उमेदवाराचे नाव प्रविष्ट करा.", "Please enter the candidate's name."));
      window.scrollTo({ top: 0, behavior: "smooth" }); return;
    }
    setBusy(true); setError("");
    const photos: Record<string, string | null> = {};
    for (const s of [1, 2, 3] as const) if (photoState[s] !== undefined) photos[String(s)] = photoState[s]!;
    const body = { ...v, photos };
    try {
      const res = await fetch(initial ? `/api/candidates/${initial.id}` : "/api/candidates", {
        method: initial ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || t(lang, "जतन करता आले नाही", "Could not save"));
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
            {/* Gender selector */}
            <div className="card p-5">
              <p className="mb-2 text-[13px] font-semibold text-stone-700">
                {t(lang, "हा बायोडेटा कोणासाठी आहे?", "This bio-data is for a")}
              </p>
              <div className="inline-flex rounded-xl bg-stone-100 p-1" role="radiogroup" aria-label="Groom or bride">
                {(["groom", "bride"] as const).map((g) => (
                  <button key={g} type="button" role="radio" aria-checked={v.gender === g} onClick={() => set("gender", g)}
                    className={`rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${v.gender === g ? "bg-kumkum-600 text-white shadow-sm" : "text-stone-600 hover:text-stone-900"}`}>
                    {g === "groom" ? t(lang, "वर (Groom)", "Groom (वर)") : t(lang, "वधू (Bride)", "Bride (वधू)")}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Toggle checked={translit} onChange={setTranslit}
                  title={t(lang, "इंग्रजीत टाइप करा, मराठी मिळवा", "Type in English, get Marathi")}
                  desc={t(lang, "'patil' टाइप करून space दाबा → 'पाटील' होते. इंटरनेट लागते.", "Type 'patil' and press space → it becomes पाटील. Needs internet.")} />
              </div>
            </div>

            {SECTIONS.map((s) => (
              <fieldset key={s.title_en} className="card p-5">
                <legend className="sr-only">{lang === "mr" ? s.title_mr : s.title_en}</legend>
                <h2 className="text-base font-bold text-kumkum-800">{lang === "mr" ? s.title_mr : s.title_en}</h2>
                {(lang === "mr" ? s.note_mr : s.note_en) && (
                  <p className="mt-0.5 text-xs text-stone-500">{lang === "mr" ? s.note_mr : s.note_en}</p>
                )}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {s.fields.map((f) => <Field key={f.k} f={f} v={v} set={set} lang={lang} />)}
                </div>
                {(lang === "mr" ? s.title_mr : s.title_en) === (lang === "mr" ? "संपर्क" : "Contact") && (
                  <div className="mt-4">
                    <Toggle checked={v.show_contact_on_screen} onChange={(b) => set("show_contact_on_screen", b)}
                      title={t(lang, "मोठ्या स्क्रीनवर संपर्क दाखवा", "Show contact details on the big screen")}
                      desc={t(lang, "डीफॉल्टने बंद आहे - फोन नंबर सार्वजनिक होत नाही.", "Off by default so phone numbers are not broadcast to the whole crowd.")} />
                  </div>
                )}
              </fieldset>
            ))}

            <div className="card p-5">
              <Toggle checked={v.is_active} onChange={(b) => set("is_active", b)}
                title={t(lang, "मोठ्या स्क्रीनवर दाखवा", "Show on big screen")}
                desc={t(lang, "लपवलेले प्रोफाइल जतन राहतात पण लाइव्ह डिस्प्लेमध्ये दिसत नाहीत.", "Hidden profiles stay saved but are skipped in the live display.")} />
            </div>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
            <div className="card p-5">
              <h2 className="mb-3 text-base font-bold text-kumkum-800">{t(lang, "फोटो", "Photos")}</h2>
              <PhotoUploader sources={sources} onChange={(slot, val) => setPhotoState((p) => ({ ...p, [slot]: val }))} />
            </div>
            <div className="card hidden p-4 xl:block">
              <h2 className="mb-3 text-base font-bold text-kumkum-800">{t(lang, "लाइव्ह पूर्वावलोकन", "Live Preview")}</h2>
              <ScaleToFit mode="width" className="overflow-hidden rounded-lg ring-1 ring-stone-200">
                <BioDataSheet c={preview} photos={sources} />
              </ScaleToFit>
            </div>
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
            <button type="button" onClick={() => router.back()} className="btn-ghost">
              {t(lang, "रद्द करा", "Cancel")}
            </button>
            <button type="submit" disabled={busy} className="btn-primary min-w-40">
              {busy ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {initial ? t(lang, "बदल जतन करा", "Save Changes") : t(lang, "बायोडेटा जतन करा", "Save Bio-Data")}
            </button>
          </div>
        </div>
      </form>
    </TranslitContext.Provider>
  );
}
