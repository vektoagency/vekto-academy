"use client";

import { useEffect, useState } from "react";

type QASession = {
  label: string;
  url: string;
  next_at: string | null;
};

const emptyQA: QASession = { label: "Събота 18:00", url: "", next_at: null };

export default function AdminSettings() {
  const [qa, setQa] = useState<QASession>(emptyQA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function load() {
    const res = await fetch("/api/admin/settings");
    const { data } = await res.json();
    if (data?.qa_session) setQa({ ...emptyQA, ...data.qa_session });
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function saveQA(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "qa_session", value: qa }),
    });
    setSaving(false);
    setSavedAt(Date.now());
  }

  const justSaved = savedAt && Date.now() - savedAt < 2500;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white/90">Настройки</h1>
        <p className="text-sm text-white/30 mt-1">Управление на глобални стойности — Q&A сесия и др.</p>
      </div>

      {/* Q&A session */}
      <form onSubmit={saveQA} className="bg-[#111] border border-white/6 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white/80">Q&A на живо</h2>
          {justSaved && <span className="text-[#c8ff00] text-xs">Запазено ✓</span>}
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
            Етикет (показва се на студентите)
          </label>
          <input
            type="text"
            value={qa.label}
            onChange={(e) => setQa({ ...qa, label: e.target.value })}
            placeholder="Събота 18:00"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
            Линк за присъединяване
          </label>
          <input
            type="url"
            value={qa.url}
            onChange={(e) => setQa({ ...qa, url: e.target.value })}
            placeholder="https://meet.google.com/... или https://zoom.us/..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
          />
          <p className="text-[11px] text-white/25 mt-1.5">
            Остави празно за да покажеш &quot;Очаквай линк скоро&quot; на студентите.
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
            Следваща сесия (по избор)
          </label>
          <input
            type="datetime-local"
            value={qa.next_at ?? ""}
            onChange={(e) => setQa({ ...qa, next_at: e.target.value || null })}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#c8ff00] text-black text-sm font-bold hover:bg-[#d4ff33] transition-colors disabled:opacity-40"
        >
          {saving ? "Запазване..." : "Запази"}
        </button>
      </form>
    </div>
  );
}
