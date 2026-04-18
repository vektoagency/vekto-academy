"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalMembers: number;
  activeMembers: number;
  cancelledMembers: number;
  planCounts: Record<string, number>;
  totalLessonsCompleted: number;
  mrr: number;
  recentCharges: { amount: number; currency: string; date: number; email: string | null }[];
  wau: number;
  lessonsThisWeek: number;
  newMembersWeek: number;
  newMembersMonth: number;
  totalSubmissions: number;
  submissionsThisWeek: number;
  jobsPending: number;
};

const planLabel: Record<string, string> = {
  monthly: "Месечен",
  yearly: "Годишен",
  lifetime: "Lifetime",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-white/40 text-sm">Грешка при зареждане на статистиките.</p>;
  }

  const cards = [
    { label: "Общо потребители", value: stats.totalMembers, color: "text-white" },
    { label: "Активни членове", value: stats.activeMembers, color: "text-[#c8ff00]" },
    { label: "Отписани", value: stats.cancelledMembers, color: "text-red-400" },
    { label: "MRR", value: `€${stats.mrr}`, color: "text-emerald-400" },
    { label: "Завършени уроци", value: stats.totalLessonsCompleted, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white/90">Табло</h1>
        <p className="text-sm text-white/30 mt-1">Преглед на платформата</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#111] border border-white/6 rounded-2xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/30">{c.label}</p>
            <p className={`text-2xl sm:text-3xl font-black mt-2 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Activity — last 7 days */}
      <div>
        <h2 className="text-sm font-bold text-white/60 mb-3">Активност (7 дни)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Активни users (WAU)", value: stats.wau, hint: "уникални, гледали урок", color: "text-[#c8ff00]" },
            { label: "Завършени уроци", value: stats.lessonsThisWeek, hint: "тази седмица", color: "text-blue-400" },
            { label: "Нови регистрации", value: stats.newMembersWeek, hint: `${stats.newMembersMonth} за 30 дни`, color: "text-emerald-400" },
            { label: "Арена проекти", value: stats.submissionsThisWeek, hint: `${stats.totalSubmissions} общо`, color: "text-amber-400" },
          ].map((c) => (
            <div key={c.label} className="bg-[#111] border border-white/6 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{c.label}</p>
              <p className={`text-2xl font-black mt-2 ${c.color}`}>{c.value}</p>
              <p className="text-[10px] text-white/25 mt-1">{c.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action items */}
      {stats.jobsPending > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-bold text-amber-400">💼 {stats.jobsPending} кандидатури чакат преглед</p>
            <p className="text-xs text-white/40 mt-1">Отиди в Кандидатури за да ги прегледаш.</p>
          </div>
          <a href="/admin/jobs" className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-colors">
            Преглед →
          </a>
        </div>
      )}

      {/* Plans breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white/60 mb-4">Разпределение по планове</h2>
          <div className="space-y-3">
            {Object.entries(stats.planCounts).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    plan === "lifetime" ? "bg-[#c8ff00]" : plan === "yearly" ? "bg-blue-400" : "bg-white/20"
                  }`} />
                  <span className="text-sm text-white/60">{planLabel[plan] ?? plan}</span>
                </div>
                <span className="text-sm font-bold text-white/80">{count}</span>
              </div>
            ))}
            {Object.keys(stats.planCounts).length === 0 && (
              <p className="text-xs text-white/20">Няма абонати все още</p>
            )}
          </div>
        </div>

        {/* Recent charges */}
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white/60 mb-4">Последни плащания</h2>
          <div className="space-y-3">
            {stats.recentCharges.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">{c.email ?? "—"}</p>
                  <p className="text-[10px] text-white/25">
                    {new Date(c.date * 1000).toLocaleDateString("bg-BG")}
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-400">
                  +€{c.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {stats.recentCharges.length === 0 && (
              <p className="text-xs text-white/20">Няма плащания за последните 30 дни</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
