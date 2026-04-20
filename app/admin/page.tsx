"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "./PageHeader";

type Stats = {
  totalMembers: number;
  activeMembers: number;
  pastDueMembers: number;
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

const planColor: Record<string, string> = {
  lifetime: "bg-[#c8ff00]",
  yearly: "bg-blue-400",
  monthly: "bg-white/25",
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
      <div className="flex items-center justify-center h-96">
        <div className="w-7 h-7 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-sm text-red-400">
        Грешка при зареждане на статистиките.
      </div>
    );
  }

  const totalPlans = Object.values(stats.planCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Табло"
        subtitle="Преглед на платформата в реално време"
        icon="📊"
      />

      {/* Action items (if any) */}
      {stats.pastDueMembers > 0 && (
        <Link
          href="/admin/users?status=past_due"
          className="group flex items-center justify-between gap-4 bg-gradient-to-r from-amber-500/8 to-amber-500/4 border border-amber-500/25 rounded-2xl p-4 sm:p-5 hover:border-amber-500/40 transition-colors"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-lg flex-shrink-0">
              ⚠
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-amber-400">
                {stats.pastDueMembers} абонамент{stats.pastDueMembers === 1 ? "" : "а"} с неуспешно плащане
              </p>
              <p className="text-xs text-white/40 mt-0.5">Stripe опитва повторно — ако не успее, ще се откажат автоматично</p>
            </div>
          </div>
          <span className="text-amber-400 text-sm font-bold group-hover:translate-x-0.5 transition-transform flex-shrink-0">→</span>
        </Link>
      )}
      {stats.jobsPending > 0 && (
        <Link
          href="/admin/jobs"
          className="group flex items-center justify-between gap-4 bg-gradient-to-r from-amber-500/8 to-amber-500/4 border border-amber-500/25 rounded-2xl p-4 sm:p-5 hover:border-amber-500/40 transition-colors"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-lg flex-shrink-0">
              💼
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-amber-400">
                {stats.jobsPending} кандидатур{stats.jobsPending === 1 ? "а чака" : "и чакат"} преглед
              </p>
              <p className="text-xs text-white/40 mt-0.5">Отвори секция Кандидатури за да ги разгледаш</p>
            </div>
          </div>
          <span className="text-amber-400 text-sm font-bold group-hover:translate-x-0.5 transition-transform flex-shrink-0">→</span>
        </Link>
      )}

      {/* Hero KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HeroCard
          label="MRR"
          value={`€${stats.mrr.toFixed(0)}`}
          hint="Месечен recurring доход"
          icon="💰"
          accent="emerald"
          href="/admin/revenue"
        />
        <HeroCard
          label="Активни членове"
          value={stats.activeMembers}
          hint={`${stats.totalMembers} общо регистрирани · виж списъка →`}
          icon="⚡"
          accent="lime"
          href="/admin/users?status=active"
        />
        <HeroCard
          label="WAU"
          value={stats.wau}
          hint="Уникални потребители (7д)"
          icon="🔥"
          accent="blue"
        />
      </div>

      {/* Activity — last 7 days */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
            Активност · последните 7 дни
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Завършени уроци"
            value={stats.lessonsThisWeek}
            hint={`${stats.totalLessonsCompleted} общо`}
            icon="🎓"
          />
          <MetricCard
            label="Нови регистрации"
            value={stats.newMembersWeek}
            hint={`${stats.newMembersMonth} за 30 дни`}
            icon="✨"
          />
          <MetricCard
            label="Арена проекти"
            value={stats.submissionsThisWeek}
            hint={`${stats.totalSubmissions} общо`}
            icon="🏆"
          />
          <MetricCard
            label="Отписани"
            value={stats.cancelledMembers}
            hint="За всички времена"
            icon="👋"
            warning={stats.cancelledMembers > 0}
          />
        </div>
      </section>

      {/* Plans + Recent charges */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Plans */}
        <div className="lg:col-span-2 bg-[#111] border border-white/6 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
              Разпределение по планове
            </h2>
            <span className="text-[10px] text-white/30 font-mono">{totalPlans} total</span>
          </div>
          <div className="space-y-3">
            {Object.keys(stats.planCounts).length === 0 && (
              <p className="text-sm text-white/25 text-center py-8">Няма абонати все още</p>
            )}
            {Object.entries(stats.planCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([plan, count]) => {
                const pct = Math.round((count / totalPlans) * 100);
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${planColor[plan] ?? "bg-white/25"}`} />
                        <span className="text-white/75 font-medium">{planLabel[plan] ?? plan}</span>
                      </div>
                      <span className="text-white/50 font-mono text-xs">
                        <span className="text-white/90 font-bold">{count}</span>
                        <span className="text-white/25 ml-1.5">{pct}%</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/4 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${planColor[plan] ?? "bg-white/25"} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent charges */}
        <div className="lg:col-span-3 bg-[#111] border border-white/6 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
              Последни плащания
            </h2>
            <Link
              href="/admin/revenue"
              className="text-[11px] text-white/40 hover:text-[#c8ff00] transition-colors flex items-center gap-1"
            >
              Всички →
            </Link>
          </div>
          <div className="space-y-1">
            {stats.recentCharges.length === 0 ? (
              <p className="text-sm text-white/25 text-center py-8">Няма плащания за последните 30 дни</p>
            ) : (
              stats.recentCharges.slice(0, 8).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs flex-shrink-0">
                      💳
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white/80 truncate font-mono text-xs">{c.email ?? "—"}</p>
                      <p className="text-[10px] text-white/30">
                        {new Date(c.date * 1000).toLocaleDateString("bg-BG", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 flex-shrink-0 font-mono">
                    +€{c.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroCard({
  label,
  value,
  hint,
  icon,
  accent,
  href,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: string;
  accent: "emerald" | "lime" | "blue";
  href?: string;
}) {
  const accents = {
    emerald: { text: "text-emerald-400", glow: "from-emerald-500/10", bg: "bg-emerald-500/10 border-emerald-500/20", hover: "hover:border-emerald-500/30" },
    lime: { text: "text-[#c8ff00]", glow: "from-[#c8ff00]/10", bg: "bg-[#c8ff00]/10 border-[#c8ff00]/25", hover: "hover:border-[#c8ff00]/35" },
    blue: { text: "text-blue-400", glow: "from-blue-500/10", bg: "bg-blue-500/10 border-blue-500/20", hover: "hover:border-blue-500/30" },
  };
  const a = accents[accent];
  const inner = (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${a.glow} to-transparent pointer-events-none opacity-60`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</p>
          <div className={`w-9 h-9 rounded-xl ${a.bg} border flex items-center justify-center text-base`}>
            {icon}
          </div>
        </div>
        <p className={`text-4xl font-black tracking-tight ${a.text}`}>{value}</p>
        <p className="text-xs text-white/35 mt-1.5">{hint}</p>
      </div>
    </>
  );
  const base = `relative bg-[#111] border border-white/8 rounded-2xl p-5 overflow-hidden block transition-colors ${a.hover}`;
  if (href) {
    return (
      <Link href={href} className={base}>
        {inner}
      </Link>
    );
  }
  return <div className={base}>{inner}</div>;
}

function MetricCard({
  label,
  value,
  hint,
  icon,
  warning,
}: {
  label: string;
  value: number;
  hint: string;
  icon: string;
  warning?: boolean;
}) {
  return (
    <div className="bg-[#111] border border-white/6 rounded-xl p-4 hover:border-white/12 transition-colors">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm opacity-60">{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">{label}</p>
      </div>
      <p className={`text-2xl font-black tracking-tight ${warning ? "text-red-400" : "text-white/95"}`}>
        {value}
      </p>
      <p className="text-[10px] text-white/30 mt-1">{hint}</p>
    </div>
  );
}
