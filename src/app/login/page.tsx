"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });
    if (r.ok) {
      router.replace(next.startsWith("/") ? next : "/");
      router.refresh();
    } else {
      setErr((await r.json().catch(() => ({}))).error || "Could not sign in");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <div className="mb-8 lg:hidden flex justify-center">
        <Logo light={false} size="large" />
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-kumkum-900">
        प्रवेश करा <span className="text-stone-400 font-normal text-xl">/ Sign In</span>
      </h1>
      <p className="mt-1 text-sm text-stone-500 font-marathi">
        आयोजक खात्याने बायोडेटा व्यवस्थापन करा
      </p>
      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="u" className="mb-1 block text-[13px] font-semibold text-stone-700">
            Username <span className="font-marathi font-normal text-stone-400">/ वापरकर्तानाव</span>
          </label>
          <input
            id="u" className="field-input" autoComplete="username"
            value={user} onChange={(e) => setUser(e.target.value)} autoFocus
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label htmlFor="p" className="mb-1 block text-[13px] font-semibold text-stone-700">
            Password <span className="font-marathi font-normal text-stone-400">/ संकेतशब्द</span>
          </label>
          <div className="relative">
            <input
              id="p" type={showPass ? "text" : "password"} className="field-input pr-11"
              autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)}
              placeholder="Enter your password"
            />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-600">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {err && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{err}</p>}
        <button className="btn-primary w-full" disabled={busy || !user || !pass}>
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? "Signing in…" : "Sign In / प्रवेश करा"}
        </button>
      </div>
      <p className="mt-6 text-center text-xs text-stone-400 font-marathi">
        खान्देश मराठा मंडळ — पिंपरी चिंचवड व पुणे जिल्हा परिसर
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
      {/* Left panel — branding */}
      <aside className="relative hidden overflow-hidden bg-kumkum-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full border border-haldi-500/20" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full border border-haldi-500/30" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-[260px] w-[260px] rounded-full border border-haldi-500/40" />
        {/* Bottom decorative */}
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full border border-kumkum-700/50" />

        <Logo size="default" />

        <div>
          <p className="font-marathi text-lg text-haldi-300">॥ श्री गणेशाय नमः ॥</p>
          <h2 className="mt-3 max-w-md font-marathiHead text-[42px] font-bold leading-[1.2]">
            खान्देश मराठा मंडळ
          </h2>
          <p className="mt-1 font-marathi text-xl text-haldi-300">पिंपरी चिंचवड व पुणे जिल्हा परिसर</p>
          <div className="mt-4 inline-block rounded-xl bg-haldi-500/20 px-4 py-2">
            <p className="font-marathi text-base text-haldi-300">मराठा वधू-वर मेळावा</p>
          </div>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-kumkum-100">
            बायोडेटा एकदा नोंदवा — A4 वर प्रिंट करा, PDF डाउनलोड करा,
            किंवा सभागृहातील मोठ्या स्क्रीनवर सर्वांना दाखवा.
          </p>
          <div className="mt-6 flex items-center gap-6 text-sm text-kumkum-200">
            <span className="font-marathi">स्थापना : १ मे १९८६</span>
            <span className="h-px flex-1 bg-kumkum-700" />
            <span className="font-marathi text-[12px]">र. नं. महाराष्ट्र २८८९/८६ एफ ३९७८-पुणे</span>
          </div>
          {/* Jai slogans */}
          <div className="mt-4 flex items-center justify-between text-haldi-400 font-marathiHead text-lg font-bold">
            <span>जय जिजाऊ</span>
            <span>❖</span>
            <span>जय शिवराय</span>
          </div>
        </div>
        <p className="text-xs text-kumkum-300 font-marathi">आयोजक प्रवेश · Organiser access only</p>
      </aside>

      {/* Right panel — login form */}
      <main className="flex items-center justify-center bg-white p-6">
        <Suspense><LoginForm /></Suspense>
      </main>
    </div>
  );
}
