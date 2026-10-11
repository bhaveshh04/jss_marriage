export default function Logo({ light = true }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="14" fill={light ? "#D9A21B" : "#8C1D2F"} />
        <circle cx="32" cy="32" r="19" fill="none" stroke={light ? "#3A0A13" : "#D9A21B"} strokeWidth="3" />
        <circle cx="32" cy="32" r="8" fill={light ? "#3A0A13" : "#D9A21B"} />
      </svg>
      <span className="leading-tight">
        <span className={`block text-[15px] font-extrabold tracking-tight ${light ? "text-white" : "text-kumkum-800"}`}>Vadhu Var Melava</span>
        <span className={`block font-marathi text-[12px] ${light ? "text-haldi-300" : "text-stone-500"}`}>मराठा वधू-वर मेळावा</span>
      </span>
    </span>
  );
}
