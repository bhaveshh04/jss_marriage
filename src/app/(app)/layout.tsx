import Link from "next/link";
import { MonitorPlay, Plus, LayoutGrid } from "lucide-react";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="no-print sticky top-0 z-40 bg-kumkum-900 shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Dashboard"><Logo /></Link>
          <nav className="flex items-center gap-1">
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-kumkum-100 hover:bg-white/10"><LayoutGrid size={16} /><span className="hidden md:inline">Dashboard</span></Link>
            <Link href="/display" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-kumkum-100 hover:bg-white/10"><MonitorPlay size={16} /><span className="hidden md:inline">Live display</span></Link>
            <Link href="/candidates/new" className="btn-gold ml-1 !py-2"><Plus size={16} /> Add bio-data</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
