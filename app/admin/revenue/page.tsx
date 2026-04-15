"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalMembers: number;
  activeMembers: number;
  cancelledMembers: number;
  planCounts: Record<string, number>;
  mrr: number;
  recentCharges: { amount: number; currency: string; date: number; email: string | null }[];
};

const planLabel: Record<string, string> = {
  monthly: "Месечен",
  yearly: "Годишен",
  lifetime: "Lifetime",
};

export default function AdminRevenue() {
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

  if (!stats) return <p className="text-white/40 text-sm">Грешка при зареждане.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white/90">Приходи</h1>
        <p className="text-sm text-white/30 mt-1">Преглед на Stripe абонаменти и плащания</p>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">MRR</p>
          <p className="text-4xl font-black text-emerald-400 mt-2">€{stats.mrr}</p>
          <p className="text-[11px] text-white/20 mt-1">Месечен рекурентен приход</p>
        </div>
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Активни абонати</p>
          <p className="text-4xl font-black text-[#c8ff00] mt-2">{stats.activeMembers}</p>
          <p className="text-[11px] text-white/20 mt-1">Платени членства</p>
        </div>
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Churn</p>
          <p className="text-4xl font-black text-red-400 mt-2">{stats.cancelledMembers}</p>
          <p className="text-[11px] text-white/20 mt-1">Отписани потребители</p>
        </div>
      </div>

      {/* Plan distribution */}
      <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white/60 mb-4">Разпределение по планове</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.planCounts).map(([plan, count]) => {
            const total = stats.activeMembers || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={plan} className="bg-white/[0.03] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white/70">{planLabel[plan] ?? plan}</span>
                  <span className="text-sm font-bold text-white/50">{count}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      plan === "lifetime"
                        ? "bg-[#c8ff00]"
                        : plan === "yearly"
                        ? "bg-blue-400"
                        : "bg-white/30"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/20 mt-1">{pct}% от активните</p>
              </div>
            );
          })}
          {Object.keys(stats.planCounts).length === 0 && (
            <p className="text-xs text-white/20 col-span-3">Няма абонати все още</p>
          )}
        </div>
      </div>

      {/* Recent charges */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6">
          <h2 className="text-sm font-bold text-white/60">Последни плащания (30 дни)</h2>
        </div>
        {stats.recentCharges.length === 0 ? (
          <div className="text-center py-12 text-white/20 text-sm">Няма плащания за последните 30 дни</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Имейл</th>
                <th className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Дата</th>
                <th className="text-right px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Сума</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCharges.map((c, i) => (
                <tr key={i} className="border-b border-white/4">
                  <td className="px-6 py-3 text-white/60">{c.email ?? "—"}</td>
                  <td className="px-6 py-3 text-white/40">
                    {new Date(c.date * 1000).toLocaleDateString("bg-BG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-emerald-400">+€{c.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
