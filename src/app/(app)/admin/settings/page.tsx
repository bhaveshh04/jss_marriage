"use client";
import { useEffect, useState } from "react";
import { GripVertical, Eye, EyeOff, Save, RefreshCw, MonitorPlay } from "lucide-react";

type ConfigRow = { id: number; field_key: string; label_mr: string; label_en: string; enabled: boolean; sort_order: number };

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/display-config");
    if (r.ok) setConfig(await r.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  function toggle(key: string) {
    setConfig(c => c.map(r => r.field_key === key ? { ...r, enabled: !r.enabled } : r));
  }

  function moveUp(i: number) {
    if (i === 0) return;
    setConfig(c => {
      const n = [...c];
      [n[i - 1], n[i]] = [n[i], n[i - 1]];
      return n.map((r, idx) => ({ ...r, sort_order: idx + 1 }));
    });
  }

  function moveDown(i: number) {
    setConfig(c => {
      if (i >= c.length - 1) return c;
      const n = [...c];
      [n[i], n[i + 1]] = [n[i + 1], n[i]];
      return n.map((r, idx) => ({ ...r, sort_order: idx + 1 }));
    });
  }

  // drag-reorder
  function onDragStart(i: number) { setDragIdx(i); }
  function onDrop(i: number) {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); return; }
    setConfig(c => {
      const n = [...c];
      const [moved] = n.splice(dragIdx, 1);
      n.splice(i, 0, moved);
      return n.map((r, idx) => ({ ...r, sort_order: idx + 1 }));
    });
    setDragIdx(null);
  }

  async function save() {
    setSaving(true);
    const payload = config.map(r => ({ field_key: r.field_key, enabled: r.enabled, sort_order: r.sort_order }));
    await fetch("/api/display-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-kumkum-900">Display Settings</h1>
          <p className="mt-0.5 text-sm text-stone-500 font-marathi">
            मोठ्या स्क्रीनवर कोणती माहिती दाखवायची ते ठरवा · Configure what shows on the big screen
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost"><RefreshCw size={16} /></button>
          <button onClick={save} disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Display preview hint */}
      <div className="flex items-start gap-3 rounded-xl border border-haldi-500/30 bg-haldi-50 p-4">
        <MonitorPlay size={20} className="mt-0.5 shrink-0 text-haldi-600" />
        <div>
          <p className="font-semibold text-haldi-800">Live Display Configuration</p>
          <p className="mt-0.5 text-sm text-haldi-700">
            Toggle fields on/off and drag to reorder. Changes affect the right-side panel on the big screen slideshow.
            The left panel (name, reg no, age, height, education) is always shown.
          </p>
        </div>
      </div>

      {/* Config table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-400">Loading configuration…</div>
        ) : (
          <div>
            <div className="border-b border-stone-100 bg-stone-50 px-4 py-3">
              <div className="grid grid-cols-[24px_1fr_1fr_80px_80px] gap-3 text-[12px] font-semibold uppercase tracking-wide text-stone-500">
                <span></span>
                <span>Field (Marathi)</span>
                <span>Field (English)</span>
                <span className="text-center">Show</span>
                <span className="text-center">Order</span>
              </div>
            </div>
            <ul className="divide-y divide-stone-100">
              {config.map((row, i) => (
                <li
                  key={row.field_key}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDrop(i)}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${dragIdx === i ? "bg-haldi-50 opacity-60" : "hover:bg-stone-50"} ${row.enabled ? "" : "opacity-50"}`}
                >
                  <button className="cursor-grab text-stone-300 hover:text-stone-500 active:cursor-grabbing" title="Drag to reorder">
                    <GripVertical size={16} />
                  </button>
                  <div className="flex-1 font-marathi text-[15px] text-ink">{row.label_mr}</div>
                  <div className="flex-1 text-sm text-stone-500">{row.label_en}</div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => toggle(row.field_key)}
                      title={row.enabled ? "Hide this field" : "Show this field"}
                      className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
                        row.enabled ? "bg-mehendi-500/10 text-mehendi-600 hover:bg-red-50 hover:text-red-500" : "bg-stone-100 text-stone-400 hover:bg-mehendi-50 hover:text-mehendi-600"
                      }`}
                    >
                      {row.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="icon-btn h-7 w-7 disabled:opacity-30" title="Move up">↑</button>
                    <button onClick={() => moveDown(i)} disabled={i === config.length - 1} className="icon-btn h-7 w-7 disabled:opacity-30" title="Move down">↓</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={save} disabled={saving} className="btn-primary">
          <Save size={16} /> {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
