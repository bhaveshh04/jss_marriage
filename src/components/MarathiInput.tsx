"use client";
import { createContext, useContext, useRef, useState } from "react";
import { Languages } from "lucide-react";

/** Master switch so the operator can turn English→Marathi typing off for the whole form. */
export const TranslitContext = createContext(true);

const cache = new Map<string, string>();
async function transliterate(word: string): Promise<string> {
  const key = word.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;
  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=mr-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch(url, { signal: ctl.signal });
    clearTimeout(t);
    const j = await r.json();
    const out: string = j?.[0] === "SUCCESS" ? j[1]?.[0]?.[1]?.[0] ?? word : word;
    cache.set(key, out);
    return out;
  } catch {
    return word; // offline / blocked: leave the English text, user can still type Marathi directly
  }
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  defaultMarathi?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
};

export default function MarathiInput({ value, onChange, multiline, defaultMarathi = true, placeholder, id, className = "" }: Props) {
  const master = useContext(TranslitContext);
  const [on, setOn] = useState(defaultMarathi);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const active = master && on;

  async function convertAt(caret: number, trailing: string) {
    const before = value.slice(0, caret);
    const m = before.match(/([A-Za-z]+)$/);
    if (!m) return false;
    const mr = await transliterate(m[1]);
    const next = before.slice(0, before.length - m[1].length) + mr + trailing + value.slice(caret);
    onChange(next);
    const pos = before.length - m[1].length + mr.length + trailing.length;
    requestAnimationFrame(() => ref.current?.setSelectionRange(pos, pos));
    return true;
  }

  async function onKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!active || e.key !== " ") return;
    const caret = e.currentTarget.selectionStart ?? value.length;
    if (/[A-Za-z]$/.test(value.slice(0, caret))) {
      e.preventDefault();
      await convertAt(caret, " ");
    }
  }

  async function onBlur() {
    if (!active) return;
    await convertAt(value.length, "");
  }

  const common = {
    id, ref: ref as never, value, placeholder, onBlur, onKeyDown,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: `field-input font-marathi pr-10 ${className}`,
    spellCheck: false, autoComplete: "off",
  };

  return (
    <div className="relative">
      {multiline ? <textarea rows={3} {...common} /> : <input type="text" {...common} />}
      <button
        type="button"
        onClick={() => setOn(!on)}
        title={active ? "English → मराठी typing is ON (click to type normally)" : "Typing normally (click to convert English → मराठी)"}
        aria-pressed={active}
        className={`absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md transition-colors ${active ? "bg-kumkum-600 text-white" : "bg-stone-200 text-stone-500 hover:bg-stone-300"}`}
      >
        <Languages size={15} />
      </button>
    </div>
  );
}
