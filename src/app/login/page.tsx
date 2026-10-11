"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: user, password: pass }) });
    if (r.ok) { router.replace(next.startsWith("/") ? next : "/"); router.refresh(); }
    else { setErr((await r.json().catch(() => ({}))).error || "Could not sign in"); setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <div className="mb-8 lg:hidden"><Logo light={false} /></div>
      <h1 className="text-2xl font-extrabold tracking-tight text-kumkum-900">Sign in</h1>
      <p className="mt-1 text-sm text-stone-500">Use the organiser account to manage bio-data.</p>
      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="u" className="mb-1 block text-[13px] font-semibold text-stone-700">Username</label>
          <input id="u" className="field-input" autoComplete="username" value={user} onChange={(e) => setUser(e.target.value)} autoFocus />
        </div>
        <div>
          <label htmlFor="p" className="mb-1 block text-[13px] font-semibold text-stone-700">Password</label>
          <input id="p" type="password" className="field-input" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        {err && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
        <button className="btn-primary w-full" disabled={busy || !user || !pass}>{busy && <Loader2 size={16} className="animate-spin" />}Sign in</button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-kumkum-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full border border-haldi-500/30" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full border border-haldi-500/40" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-[280px] w-[280px] rounded-full border border-haldi-500/50" />
        <Logo />
        <div>
          <p className="font-marathi text-lg text-haldi-300">॥ श्री गणेशाय नमः ॥</p>
          <h2 className="mt-3 max-w-md font-marathiHead text-5xl font-bold leading-[1.2]">मराठा वधू-वर मेळावा</h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-kumkum-100">
            Enter a bio-data once. Print it on A4, download it, or put it on the big screen so everyone in the hall can read it.
          </p>
        </div>
        <p className="text-xs text-kumkum-200">Organiser access only</p>
      </aside>
      <main className="flex items-center justify-center bg-white p-6">
        <Suspense><LoginForm /></Suspense>
      </main>
    </div>
  );
}
