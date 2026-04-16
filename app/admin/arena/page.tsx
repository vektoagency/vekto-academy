"use client";

import { useEffect, useState } from "react";

type Challenge = {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  prize: string | null;
  status: string;
  created_at: string;
};

const emptyChallenge = {
  title: "",
  description: "",
  deadline: "",
  prize: "",
  status: "active",
};

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  ended: "bg-white/10 text-white/40",
  upcoming: "bg-blue-500/20 text-blue-400",
};

export default function AdminArena() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Challenge> | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadChallenges() {
    const res = await fetch("/api/admin/arena");
    const { data } = await res.json();
    setChallenges(data ?? []);
  }

  useEffect(() => {
    loadChallenges().finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing?.title?.trim()) return;
    setSaving(true);

    await fetch("/api/admin/arena", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });

    await loadChallenges();
    setEditing(null);
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Сигурен ли си?")) return;
    await fetch("/api/admin/arena", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadChallenges();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white/90">Арена</h1>
          <p className="text-sm text-white/30 mt-1">{challenges.length} предизвикателства</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyChallenge })}
          className="px-5 py-2.5 rounded-xl bg-[#c8ff00] text-black text-sm font-bold hover:bg-[#d4ff33] transition-colors"
        >
          + Ново предизвикателство
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-[#111] border border-white/6 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white/60">
            {editing.id ? "Редактиране" : "Ново предизвикателство"}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Заглавие</label>
              <input
                type="text"
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="AI реклама за 60 сек"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Награда</label>
              <input
                type="text"
                value={editing.prize ?? ""}
                onChange={(e) => setEditing({ ...editing, prize: e.target.value })}
                placeholder="€100 + Feature в портфолио"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Описание</label>
            <textarea
              value={editing.description ?? ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={3}
              placeholder="Подробно описание на предизвикателството..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Краен срок</label>
              <input
                type="date"
                value={editing.deadline ?? ""}
                onChange={(e) => setEditing({ ...editing, deadline: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Статус</label>
              <select
                value={editing.status ?? "active"}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
              >
                <option value="active">Активно</option>
                <option value="upcoming">Предстоящо</option>
                <option value="ended">Приключило</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#c8ff00] text-black text-sm font-bold hover:bg-[#d4ff33] transition-colors disabled:opacity-40"
            >
              {saving ? "Запазване..." : "Запази"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-6 py-2.5 rounded-xl bg-white/5 text-white/40 text-sm hover:text-white/70 transition-colors"
            >
              Откажи
            </button>
          </div>
        </form>
      )}

      {/* Challenges list */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/6">
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Заглавие</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Награда</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Краен срок</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Статус</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Действия</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((c) => (
              <tr key={c.id} className="border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <p className="text-white/70 font-medium">{c.title}</p>
                  {c.description && (
                    <p className="text-[11px] text-white/25 truncate max-w-xs mt-0.5">{c.description}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-white/50">{c.prize ?? "—"}</td>
                <td className="px-5 py-3 text-white/40">
                  {c.deadline ? new Date(c.deadline).toLocaleDateString("bg-BG") : "—"}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusBadge[c.status] ?? "bg-white/10 text-white/30"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditing(c)}
                      className="px-3 py-1 text-[11px] rounded-lg bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                    >
                      Редактирай
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1 text-[11px] rounded-lg bg-red-500/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Изтрий
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {challenges.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-white/20 text-sm">
                  Няма предизвикателства. Създай първото от бутона горе.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
