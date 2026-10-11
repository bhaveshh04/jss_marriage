"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); router.refresh(); }}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-kumkum-100 transition-colors hover:bg-white/10"
    >
      <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
