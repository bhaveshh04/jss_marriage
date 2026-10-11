const DIGITS = "०१२३४५६७८९";
const MONTHS = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];

export const toMr = (v: string | number) => String(v).replace(/\d/g, (d) => DIGITS[Number(d)]);

export function dateMr(iso?: string) {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${toMr(Number(m[3]))} ${MONTHS[Number(m[2]) - 1]} ${toMr(m[1])}`;
}

export function timeMr(t?: string, vel?: string) {
  if (!t) return vel ?? "";
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  const base = m ? `${toMr(Number(m[1]) % 12 || 12)}:${toMr(m[2])} वा.` : toMr(t);
  return vel ? `${base} (${vel})` : base;
}

export function heightMr(ft: number, inch: number) {
  if (!ft && !inch) return "";
  return `${toMr(ft)} फूट ${toMr(inch)} इंच`;
}

export function ageYears(iso?: string) {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const now = new Date();
  let a = now.getFullYear() - Number(m[1]);
  if (now.getMonth() + 1 < Number(m[2]) || (now.getMonth() + 1 === Number(m[2]) && now.getDate() < Number(m[3]))) a--;
  return a;
}

export const titleMr = (g: string) => (g === "bride" ? "वधू परिचय" : "वर परिचय");
