// Language context for Marathi/English toggle — used throughout the app
"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "mr" | "en";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "mr",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("mr");

  useEffect(() => {
    const saved = localStorage.getItem("mvm_lang") as Lang | null;
    if (saved === "en" || saved === "mr") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("mvm_lang", l);
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

// Bilingual text helper
export function t(lang: Lang, mr: string, en: string) {
  return lang === "mr" ? mr : en;
}
