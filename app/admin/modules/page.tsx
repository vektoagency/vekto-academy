"use client";

import { useEffect, useState, useRef } from "react";

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
  const [reordering, setReordering] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

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

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  async function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const items = [...modules];
    const dragged = items.splice(dragItem.current, 1)[0];
    items.splice(dragOverItem.current, 0, dragged);

    const reordered = items.map((m, i) => ({ ...m, order: i + 1 }));
    setModules(reordered);

    dragItem.current = null;
    dragOverItem.current = null;

    setReordering(true);
    await fetch("/api/admin/modules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((m) => ({ id: m.id, order: m.order })) }),
    });
    setReordering(false);
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
          <p className="text-sm text-white/30 mt-1">
            {modules.length} модула
            {reordering && <span className="ml-2 text-[#c8ff00]">· Запазване...</span>}
          </p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Video URL</label>
              <input
                type="text"
                value={editing.video_url ?? ""}
                onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                placeholder="https://iframe.mediadelivery.net/embed/..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
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

      {/* Drag & drop hint */}
      <p className="text-[11px] text-white/20">Дръпни и пусни за пренареждане на модулите</p>

      {/* Modules list — draggable */}
      <div className="space-y-2">
        {modules.map((m, index) => (
          <div
            key={m.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="bg-[#111] border border-white/6 rounded-xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-white/12 transition-colors group"
          >
            {/* Drag handle */}
            <div className="flex-shrink-0 text-white/15 group-hover:text-white/30 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
              </svg>
            </div>

            {/* Order */}
            <span className="text-white/20 font-mono text-sm w-6 text-center flex-shrink-0">{m.order}</span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white/70 font-medium text-sm truncate">{m.title}</p>
              <p className="text-white/25 text-xs mt-0.5">{m.duration ?? "—"} · {m.video_url ? "Video OK" : "Няма видео"}</p>
            </div>

            {/* Status */}
            {m.available ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex-shrink-0">Активен</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/30 flex-shrink-0">Скрит</span>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
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
          </div>
        ))}
        {modules.length === 0 && (
          <div className="text-center py-12 text-white/20 text-sm bg-[#111] border border-white/6 rounded-xl">
            Няма модули. Създай първия от бутона горе.
          </div>
        )}
      </div>
    </div>
  );
}
