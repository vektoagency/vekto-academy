"use client";

import { useEffect, useState } from "react";

type Module = {
  id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  duration: string | null;
  order: number;
  available: boolean;
  created_at: string;
};

const emptyModule = {
  title: "",
  description: "",
  video_url: "",
  duration: "",
  order: 0,
  available: false,
};

export default function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Module> | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadModules() {
    const res = await fetch("/api/admin/modules");
    const { data } = await res.json();
    setModules(data ?? []);
  }

  useEffect(() => {
    loadModules().finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing?.title?.trim()) return;
    setSaving(true);

    await fetch("/api/admin/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });

    await loadModules();
    setEditing(null);
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Сигурен ли си?")) return;
    await fetch("/api/admin/modules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadModules();
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
          <h1 className="text-2xl font-black text-white/90">Модули</h1>
          <p className="text-sm text-white/30 mt-1">{modules.length} модула</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyModule, order: modules.length + 1 })}
          className="px-5 py-2.5 rounded-xl bg-[#c8ff00] text-black text-sm font-bold hover:bg-[#d4ff33] transition-colors"
        >
          + Нов модул
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-[#111] border border-white/6 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white/60">
            {editing.id ? "Редактиране на модул" : "Нов модул"}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Заглавие</label>
              <input
                type="text"
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Продължителност</label>
              <input
                type="text"
                value={editing.duration ?? ""}
                onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                placeholder="45 мин"
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Video URL</label>
              <input
                type="text"
                value={editing.video_url ?? ""}
                onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Ред (order)</label>
              <input
                type="number"
                value={editing.order ?? 0}
                onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.available ?? false}
                  onChange={(e) => setEditing({ ...editing, available: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#c8ff00]"
                />
                <span className="text-sm text-white/60">Достъпен за потребители</span>
              </label>
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

      {/* Modules list */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6">
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">#</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Заглавие</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Продължителност</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Статус</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Действия</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} className="border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 text-white/30 font-mono">{m.order}</td>
                <td className="px-5 py-3 text-white/70 font-medium">{m.title}</td>
                <td className="px-5 py-3 text-white/40">{m.duration ?? "—"}</td>
                <td className="px-5 py-3">
                  {m.available ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">Активен</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-white/30">Скрит</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditing(m)}
                      className="px-3 py-1 text-[11px] rounded-lg bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                    >
                      Редактирай
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="px-3 py-1 text-[11px] rounded-lg bg-red-500/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Изтрий
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {modules.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-white/20 text-sm">
                  Няма модули. Създай първия от бутона горе.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
