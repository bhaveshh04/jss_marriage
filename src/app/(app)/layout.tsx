import Link from "next/link";
import { MonitorPlay, Plus, LayoutGrid, FileSpreadsheet, Settings, Users } from "lucide-react";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";
import LangToggle from "@/components/LangToggle";
import { cookies } from "next/headers";
import { COOKIE, verifySession, isAdmin } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession(cookies().get(COOKIE)?.value);
  const admin = isAdmin(session);

  return (
    <div className="min-h-dvh">
      {/* ── Top header bar ── */}
      <header className="no-print sticky top-0 z-40 bg-kumkum-900 shadow-lg">
        {/* Org info strip */}
        <div className="border-b border-white/10 bg-kumkum-950 px-4 sm:px-6">
          <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4">
            <p className="font-marathi text-[11px] text-haldi-300/80">
              स्थापना : १ मे १९८६ &nbsp;|&nbsp; र. नं. महाराष्ट्र २८८९/८६ एफ ३९७८-पुणे
            </p>
            <p className="hidden font-marathi text-[11px] text-haldi-300/80 sm:block">
              जय जिजाऊ &nbsp;·&nbsp; जय शिवराय
            </p>
          </div>
        </div>
        {/* Main nav */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="Dashboard"><Logo /></Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            <LangToggle />
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-kumkum-100 hover:bg-white/10">
              <LayoutGrid size={16} /><span className="hidden md:inline">Dashboard</span>
            </Link>
            <Link href="/display" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-kumkum-100 hover:bg-white/10">
              <MonitorPlay size={16} /><span className="hidden md:inline">Live Display</span>
            </Link>
            <Link href="/candidates/import" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-kumkum-100 hover:bg-white/10">
              <FileSpreadsheet size={16} /><span className="hidden md:inline">Import</span>
            </Link>
            {admin && (
              <>
                <Link href="/admin/users" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-kumkum-100 hover:bg-white/10">
                  <Users size={16} /><span className="hidden md:inline">Users</span>
                </Link>
                <Link href="/admin/settings" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-kumkum-100 hover:bg-white/10">
                  <Settings size={16} /><span className="hidden md:inline">Settings</span>
                </Link>
              </>
            )}
            <Link href="/candidates/new" className="btn-gold ml-1 !py-2 whitespace-nowrap">
              <Plus size={16} /> <span>Add Bio-Data</span>
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
