"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function VisibilityToggle({ id, active }: { id: number; active: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(active);
  async function toggle() {
    const next = !on;
    setOn(next);
    const r = await fetch(`/api/candidates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: next }) });
    if (!r.ok) setOn(!next); else router.refresh();
  }
  return (
    <button onClick={toggle} className="icon-btn" aria-pressed={on} title={on ? "Shown on big screen — click to hide" : "Hidden from big screen — click to show"} aria-label="Toggle big-screen visibility">
      {on ? <Eye size={17} /> : <EyeOff size={17} />}
    </button>
  );
}
