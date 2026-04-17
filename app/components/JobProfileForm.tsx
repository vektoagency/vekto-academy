"use client";

import { useEffect, useState } from "react";

type Profile = {
  specialty: string;
  bio: string;
  portfolio_url: string;
  social_url: string;
  status: string;
};

const empty: Profile = {
  specialty: "",
  bio: "",
  portfolio_url: "",
  social_url: "",
  status: "draft",
};

const statusLabel: Record<string, { text: string; color: string }> = {
  draft: { text: "Чернова", color: "bg-white/8 text-white/40" },
  submitted: { text: "Изпратено за преглед", color: "bg-[#c8ff00]/15 text-[#c8ff00]" },
  reviewed: { text: "Прегледано", color: "bg-blue-500/15 text-blue-400" },
  accepted: { text: "Прието ✓", color: "bg-emerald-500/15 text-emerald-400" },
  rejected: { text: "Не съвпада", color: "bg-white/8 text-white/40" },
};

export default function JobProfileForm() {
  const [profile, setProfile] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/job-profile")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) setProfile({ ...empty, ...data });
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  async function save(submit: boolean) {
    if (submit) setSubmitting(true);
    else setSavingDraft(true);

    const res = await fetch("/api/job-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, submit }),
    });

    if (res.ok) {
      const { status } = await res.json();
      setProfile((p) => ({ ...p, status }));
      setSavedAt(Date.now());
    }

    setSavingDraft(false);
    setSubmitting(false);
  }

  const justSaved = savedAt && Date.now() - savedAt < 2500;
  const badge = statusLabel[profile.status] ?? statusLabel.draft;
  const submitted = profile.status === "submitted" || profile.status === "reviewed" || profile.status === "accepted";

  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${badge.color}`}>
          {badge.text}
        </span>
        {justSaved && <span className="text-[#c8ff00] text-xs animate-[fadeIn_0.3s_ease]">Запазено ✓</span>}
      </div>

      <div>
        <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5 block">Специализация</label>
        <input
          type="text"
          value={profile.specialty}
          onChange={(e) => update("specialty", e.target.value)}
          placeholder="напр. AI Video Creator, Editor..."
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#c8ff00]/30 transition-colors"
        />
      </div>
      <div>
        <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5 block">Bio</label>
        <textarea
          rows={3}
          value={profile.bio}
          onChange={(e) => update("bio", e.target.value)}
          placeholder="Кратко описание — кой си и какво правиш..."
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#c8ff00]/30 transition-colors resize-none"
        />
      </div>
      <div>
        <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5 block">Линк към портфолио</label>
        <input
          type="url"
          value={profile.portfolio_url}
          onChange={(e) => update("portfolio_url", e.target.value)}
          placeholder="https://..."
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#c8ff00]/30 transition-colors"
        />
      </div>
      <div>
        <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5 block">YouTube / Instagram</label>
        <input
          type="url"
          value={profile.social_url}
          onChange={(e) => update("social_url", e.target.value)}
          placeholder="https://..."
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#c8ff00]/30 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => save(true)}
          disabled={loading || submitting || savingDraft}
          className="flex-1 bg-[#c8ff00] text-black font-black py-3 rounded-xl text-sm hover:bg-[#d4ff1a] transition-colors disabled:opacity-50"
        >
          {submitting ? "Изпращане..." : submitted ? "Изпрати отново →" : "Изпрати за преглед →"}
        </button>
        <button
          onClick={() => save(false)}
          disabled={loading || submitting || savingDraft}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white/50 hover:text-white hover:bg-white/8 text-sm transition-colors disabled:opacity-50"
        >
          {savingDraft ? "..." : "Запази"}
        </button>
      </div>
    </div>
  );
}
