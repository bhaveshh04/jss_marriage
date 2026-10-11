"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteButton({ id, name, redirect, variant = "icon" }: { id: number; name: string; redirect?: string; variant?: "icon" | "button" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm(`Delete the bio-data of “${name}”? This removes it from the list and the big screen.`)) return;
    setBusy(true);
    const r = await fetch(`/api/candidates/${id}`, { method: "DELETE" });
    if (!r.ok) { alert("Could not delete. Please try again."); setBusy(false); return; }
    if (redirect) router.push(redirect);
    router.refresh();
  }

  return variant === "icon" ? (
    <button onClick={del} disabled={busy} className="icon-btn hover:!text-red-600" aria-label={`Delete ${name}`} title="Delete">
      {busy ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />}
    </button>
  ) : (
    <button onClick={del} disabled={busy} className="btn-outline !text-red-700 hover:!border-red-400">
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
    </button>
  );
}
