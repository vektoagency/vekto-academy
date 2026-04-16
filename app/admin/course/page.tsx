"use client";

import { useEffect, useState } from "react";

type Lesson = {
  id: string;
  module_id: number;
  title: string;
  duration: string;
  bunny_id: string;
  sort_order: number;
};

type Module = {
  id: number;
  title: string;
  emoji: string;
  sort_order: number;
};

export default function AdminCoursePage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", duration: "", bunny_id: "" });
  const [saving, setSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

  async function load() {
    const res = await fetch("/api/admin/course");
    const data = await res.json();
    setModules(data.modules ?? []);
    setLessons(data.lessons ?? []);
    // Expand all modules by default
    const exp: Record<number, boolean> = {};
    (data.modules ?? []).forEach((m: Module) => { exp[m.id] = true; });
    setExpandedModules(exp);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  function startEdit(l: Lesson) {
    setEditingId(l.id);
    setEditForm({ title: l.title, duration: l.duration, bunny_id: l.bunny_id });
  }

  async function handleSave() {
    if (!editingId) return;
    setSaving(true);
    await fetch("/api/admin/course", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...editForm }),
    });
    await load();
    setEditingId(null);
    setSaving(false);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const lessonsWithVideo = lessons.filter((l) => l.bunny_id).length;
  const totalLessons = lessons.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white/90">Съдържание на обучението</h1>
        <p className="text-sm text-white/30 mt-1">
          {modules.length} модула · {totalLessons} урока · {lessonsWithVideo} с видео
        </p>
      </div>

      {/* Stats bar */}
      <div className="bg-[#111] border border-white/6 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40">Видеа качени</span>
          <span className="text-[#c8ff00] text-xs font-bold">{lessonsWithVideo}/{totalLessons}</span>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#c8ff00] rounded-full transition-all duration-500"
            style={{ width: `${totalLessons > 0 ? Math.round((lessonsWithVideo / totalLessons) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {modules.map((mod) => {
          const modLessons = lessons.filter((l) => l.module_id === mod.id);
          const modWithVideo = modLessons.filter((l) => l.bunny_id).length;
          const isExpanded = expandedModules[mod.id];

          return (
            <div key={mod.id} className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden">
              {/* Module header */}
              <button
                onClick={() => setExpandedModules((e) => ({ ...e, [mod.id]: !e[mod.id] }))}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-left"
              >
                <span className="text-xl flex-shrink-0">{mod.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/85">Модул {mod.id}: {mod.title}</p>
                  <p className="text-white/25 text-xs mt-0.5">
                    {modLessons.length} урока · {modWithVideo} с видео
                  </p>
                </div>
                {modWithVideo === modLessons.length && modLessons.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex-shrink-0">Готов</span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 flex-shrink-0">{modWithVideo}/{modLessons.length}</span>
                )}
                <svg className={`w-4 h-4 text-white/20 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Lessons */}
              {isExpanded && (
                <div className="border-t border-white/6">
                  {modLessons.map((l, i) => {
                    const isEditing = editingId === l.id;
                    const hasVideo = !!l.bunny_id;

                    if (isEditing) {
                      return (
                        <div key={l.id} className="px-5 py-4 bg-[#c8ff00]/[0.03] border-b border-white/6 last:border-0 space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#c8ff00] text-xs font-bold">Редактиране: {l.id}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Заглавие</label>
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Продължителност</label>
                              <input
                                type="text"
                                value={editForm.duration}
                                onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                                placeholder="12:00"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Bunny Video ID</label>
                            <input
                              type="text"
                              value={editForm.bunny_id}
                              onChange={(e) => setEditForm({ ...editForm, bunny_id: e.target.value })}
                              placeholder="dbc5a2c0-7b9e-48d4-a916-bfa313e9c9a8"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/15 font-mono focus:outline-none focus:border-[#c8ff00]/30"
                            />
                            <p className="text-[10px] text-white/20 mt-1">Копирай ID-то от Bunny Stream Dashboard</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="px-5 py-2 rounded-lg bg-[#c8ff00] text-black text-xs font-bold hover:bg-[#d4ff33] transition-colors disabled:opacity-40"
                            >
                              {saving ? "Запазване..." : "Запази"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-5 py-2 rounded-lg bg-white/5 text-white/40 text-xs hover:text-white/70 transition-colors"
                            >
                              Откажи
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={l.id}
                        className="flex items-center gap-4 px-5 py-3 border-b border-white/4 last:border-0 hover:bg-white/3 transition-colors group"
                      >
                        {/* Status */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${hasVideo ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/25"}`}>
                          {hasVideo ? "✓" : i + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/70 truncate">{l.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-white/20 text-[11px]">{l.duration}</span>
                            {hasVideo ? (
                              <span className="text-emerald-400/60 text-[10px] font-mono truncate max-w-[200px]">{l.bunny_id}</span>
                            ) : (
                              <span className="text-amber-400/50 text-[10px]">Няма видео</span>
                            )}
                          </div>
                        </div>

                        {/* Edit button */}
                        <button
                          onClick={() => startEdit(l)}
                          className="px-3 py-1.5 text-[11px] rounded-lg bg-white/5 text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                        >
                          Редактирай
                        </button>
                      </div>
                    );
                  })}

                  {modLessons.length === 0 && (
                    <p className="text-center py-6 text-white/15 text-xs">Няма урока в този модул</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-16 text-white/20 text-sm">
          Няма данни. Пусни SQL миграцията в Supabase.
        </div>
      )}
    </div>
  );
}
