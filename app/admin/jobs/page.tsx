"use client";

import { useEffect, useState } from "react";

type Profile = {
  user_id: string;
  user_name: string;
  user_email: string;
  specialty: string;
  bio: string;
  portfolio_url: string;
  social_url: string;
  status: string;
  submitted_at: string | null;
  updated_at: string;
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  draft: { label: "Чернова", cls: "bg-white/8 text-white/40" },
  submitted: { label: "Чака преглед", cls: "bg-amber-500/20 text-amber-400" },
  reviewed: { label: "Прегледано", cls: "bg-blue-500/20 text-blue-400" },
  accepted: { label: "Прието", cls: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "Отхвърлено", cls: "bg-red-500/20 text-red-400" },
};

export default function AdminJobs() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  async function load() {
    const res = await fetch("/api/admin/jobs");
    const { data } = await res.json();
    setProfiles(data ?? []);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function act(user_id: string, action: "accepted" | "rejected" | "reviewed") {
    await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, action }),
    });
    await load();
  }

  const filtered = filter === "all" ? profiles : profiles.filter((p) => p.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  const counts = profiles.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white/90">Кандидатури</h1>
        <p className="text-sm text-white/30 mt-1">{profiles.length} профила общо</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Всички", count: profiles.length },
          { key: "submitted", label: "Чакат преглед", count: counts.submitted ?? 0 },
          { key: "reviewed", label: "Прегледани", count: counts.reviewed ?? 0 },
          { key: "accepted", label: "Приети", count: counts.accepted ?? 0 },
          { key: "rejected", label: "Отхвърлени", count: counts.rejected ?? 0 },
          { key: "draft", label: "Чернови", count: counts.draft ?? 0 },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === f.key
                ? "bg-[#c8ff00] text-black"
                : "bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10"
            }`}
          >
            {f.label} <span className="opacity-60">· {f.count}</span>
          </button>
        ))}
      </div>

      {/* Profiles */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20 text-sm">Няма кандидатури в тази категория.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.user_id} className="bg-[#111] border border-white/6 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white/85">{p.user_name}</p>
                  {p.user_email && <p className="text-[11px] text-white/30">{p.user_email}</p>}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusBadge[p.status]?.cls ?? "bg-white/10 text-white/40"}`}>
                  {statusBadge[p.status]?.label ?? p.status}
                </span>
              </div>

              {p.specialty && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Специалност</p>
                  <p className="text-sm text-white/70">{p.specialty}</p>
                </div>
              )}

              {p.bio && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Био</p>
                  <p className="text-sm text-white/60 whitespace-pre-line leading-relaxed">{p.bio}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 mb-4">
                {p.portfolio_url && (
                  <a href={p.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#c8ff00] hover:underline">
                    🔗 Портфолио
                  </a>
                )}
                {p.social_url && (
                  <a href={p.social_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#c8ff00] hover:underline">
                    🔗 Социална мрежа
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap pt-3 border-t border-white/6">
                <p className="text-[10px] text-white/25">
                  {p.submitted_at ? `Предадено: ${new Date(p.submitted_at).toLocaleString("bg-BG")}` : "Не е предаден"}
                </p>
                {p.status !== "draft" && (
                  <div className="flex items-center gap-2">
                    {p.status !== "accepted" && (
                      <button
                        onClick={() => act(p.user_id, "accepted")}
                        className="px-3 py-1.5 text-[11px] rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors font-bold"
                      >
                        Приеми
                      </button>
                    )}
                    {p.status !== "reviewed" && p.status !== "accepted" && (
                      <button
                        onClick={() => act(p.user_id, "reviewed")}
                        className="px-3 py-1.5 text-[11px] rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        Прегледай
                      </button>
                    )}
                    {p.status !== "rejected" && (
                      <button
                        onClick={() => act(p.user_id, "rejected")}
                        className="px-3 py-1.5 text-[11px] rounded-lg bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      >
                        Отхвърли
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
