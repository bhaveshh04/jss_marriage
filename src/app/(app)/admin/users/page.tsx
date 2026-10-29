"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Shield, UserCheck, RefreshCw, Eye, EyeOff, Copy, Check } from "lucide-react";

type User = { id: number; username: string; display_name: string; role: string; is_active: boolean; created_at: string };

function Badge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
      role === "admin" ? "bg-kumkum-100 text-kumkum-700" : "bg-mehendi-500/10 text-mehendi-600"
    }`}>
      {role === "admin" ? <Shield size={10} /> : <UserCheck size={10} />}
      {role === "admin" ? "Admin" : "Operator"}
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-1 inline-flex items-center rounded p-0.5 text-stone-400 hover:text-kumkum-600" title="Copy">
      {copied ? <Check size={13} className="text-mehendi-600" /> : <Copy size={13} />}
    </button>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", display_name: "", role: "operator" });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ display_name: "", role: "operator", is_active: true, password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [lastCreated, setLastCreated] = useState<{ username: string; password: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/users");
    if (r.ok) setUsers(await r.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    const r = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const j = await r.json();
    if (!r.ok) { setError(j.error); return; }
    setLastCreated({ username: form.username, password: form.password });
    setForm({ username: "", password: "", display_name: "", role: "operator" });
    setShowAdd(false);
    setSuccess(`User "${form.username}" created successfully!`);
    load();
  }

  async function deleteUser(id: number, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  }

  async function saveEdit(id: number) {
    const r = await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    if (r.ok) { setEditId(null); load(); }
  }

  function startEdit(u: User) {
    setEditId(u.id);
    setEditForm({ display_name: u.display_name, role: u.role, is_active: u.is_active, password: "" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-kumkum-900">User Management</h1>
          <p className="mt-0.5 text-sm text-stone-500 font-marathi">वापरकर्ता व्यवस्थापन · Admin can create and manage operator accounts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost"><RefreshCw size={16} /></button>
          <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={16} /> Add User</button>
        </div>
      </div>

      {/* Success / last-created credential card */}
      {lastCreated && (
        <div className="rounded-xl border border-mehendi-500/30 bg-mehendi-500/5 p-5">
          <p className="font-semibold text-mehendi-700">✓ User created — save these credentials:</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-3 border border-stone-200">
              <p className="text-xs text-stone-500">Username</p>
              <p className="font-mono font-bold text-ink">{lastCreated.username} <CopyBtn text={lastCreated.username} /></p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-stone-200">
              <p className="text-xs text-stone-500">Password</p>
              <p className="font-mono font-bold text-ink">{lastCreated.password} <CopyBtn text={lastCreated.password} /></p>
            </div>
          </div>
          <button onClick={() => setLastCreated(null)} className="mt-3 text-xs text-stone-400 hover:text-stone-600">Dismiss</button>
        </div>
      )}

      {/* Error/success banner */}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && !lastCreated && <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

      {/* Add user form */}
      {showAdd && (
        <form onSubmit={addUser} className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-kumkum-800">Create New User</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stone-700">Username *</label>
              <input className="field-input" placeholder="e.g. operator1" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stone-700">Display Name</label>
              <input className="field-input font-marathi" placeholder="e.g. राहुल पाटील" value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stone-700">Password *</label>
              <div className="relative">
                <input className="field-input pr-10" type={showPass ? "text" : "password"} placeholder="Set a password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-3 text-stone-400 hover:text-stone-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stone-700">Role</label>
              <select className="field-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary"><Plus size={16} /> Create User</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-stone-500">User</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-stone-500">Username</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-stone-500">Role</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-stone-500">Status</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-stone-500">Created</th>
                <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-stone-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-400">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-400">No users found</td></tr>
              ) : users.map((u) => (
                editId === u.id ? (
                  <tr key={u.id} className="bg-haldi-50">
                    <td className="px-4 py-3" colSpan={4}>
                      <div className="grid gap-3 sm:grid-cols-4">
                        <input className="field-input" placeholder="Display name" value={editForm.display_name} onChange={e => setEditForm(p => ({ ...p, display_name: e.target.value }))} />
                        <input className="field-input" type="password" placeholder="New password (optional)" value={editForm.password} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} />
                        <select className="field-input" value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                          <option value="operator">Operator</option>
                          <option value="admin">Admin</option>
                        </select>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm(p => ({ ...p, is_active: e.target.checked }))} />
                          <span className="text-sm">Active</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right" colSpan={2}>
                      <button onClick={() => saveEdit(u.id)} className="btn-primary mr-2 !py-1.5 text-xs">Save</button>
                      <button onClick={() => setEditId(null)} className="btn-ghost !py-1.5 text-xs">Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kumkum-100 font-bold text-kumkum-700 text-sm">
                          {(u.display_name || u.username).charAt(0).toUpperCase()}
                        </span>
                        <span className="font-semibold text-ink">{u.display_name || u.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-stone-500">{u.username}</td>
                    <td className="px-4 py-3"><Badge role={u.role} /></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.is_active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-[12px]">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(u)} className="icon-btn mr-1" title="Edit"><Pencil size={15} /></button>
                      <button onClick={() => deleteUser(u.id, u.username)} className="icon-btn text-red-400 hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2"><Shield size={16} className="text-kumkum-600" /><span className="font-semibold text-kumkum-800">Admin Role</span></div>
          <ul className="space-y-1 text-sm text-stone-600">
            <li>• Full access to all features</li>
            <li>• Create / manage users</li>
            <li>• Configure display settings</li>
            <li>• Add / edit / delete bio-data</li>
          </ul>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2"><UserCheck size={16} className="text-mehendi-600" /><span className="font-semibold text-mehendi-700">Operator Role</span></div>
          <ul className="space-y-1 text-sm text-stone-600">
            <li>• Add and edit bio-data</li>
            <li>• View and print profiles</li>
            <li>• Control live display</li>
            <li>• Cannot manage users or settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
