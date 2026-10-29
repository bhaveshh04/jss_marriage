"use client";
import { useLang } from "@/lib/lang";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div
      className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-0.5"
      role="group"
      aria-label="Language selector"
      title="भाषा / Language"
    >
      <button
        onClick={() => setLang("mr")}
        aria-pressed={lang === "mr"}
        className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
          lang === "mr"
            ? "bg-haldi-500 text-kumkum-900 shadow"
            : "text-white/70 hover:text-white"
        }`}
      >
        मराठी
      </button>
      <button
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
          lang === "en"
            ? "bg-haldi-500 text-kumkum-900 shadow"
            : "text-white/70 hover:text-white"
        }`}
      >
        English
      </button>
    </div>
  );
}
