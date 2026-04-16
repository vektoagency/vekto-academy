import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import CommunityChat from "../components/CommunityChat";
import ArenaRules from "../components/ArenaRules";
import BillingPortalButton from "../components/BillingPortalButton";
import NotificationBell from "../components/NotificationBell";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const planLabel: Record<string, string> = {
  monthly: "Месечен",
  yearly: "Годишен",
  lifetime: "Доживотен ⚡",
};

const modules = [
  { id: 0, title: "Старт", duration: "8 мин", available: true },
  { id: 1, title: "Майндсет", duration: "25 мин", available: true },
  { id: 2, title: "Психология и стратегия", duration: "55 мин", available: true },
  { id: 3, title: "Инструментите", duration: "105 мин", available: true },
  { id: 4, title: "The Playbooks ⭐", duration: "120 мин", available: true },
  { id: 5, title: "Монтаж за задържане на внимание", duration: "35 мин", available: true },
  { id: 6, title: "Машината за клиенти (бонус)", duration: "25 мин", available: true },
];

const announcements = [
  {
    author: "Vekto Team",
    avatar: "V",
    time: "преди 2ч",
    tag: "📢 Обява",
    text: "Добре дошли в Vekto Academy! Първите модули се качват тази седмица. Следете за нотификации.",
  },
  {
    author: "Vekto Team",
    avatar: "V",
    time: "преди 1д",
    tag: "📅 Събитие",
    text: "Q&A на живо — всяка събота в 18:00ч. Задавай въпроси директно към екипа на агенцията.",
  },
];

// SVG Icons
const IconHome = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconPlay = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconBriefcase = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IconArena = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconLock = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; tab?: string }>;
}) {
  const user = await currentUser();
  if (!user?.id) redirect("/sign-in");

  const { success, tab = "home" } = await searchParams;

  const [{ data: member }, { data: progressRows }] = await Promise.all([
    supabase.from("members").select("*").eq("user_id", user.id).single(),
    supabase.from("module_progress").select("module_id, completed").eq("user_id", user.id),
  ]);

  const hasPlan = member?.status === "active";
  const isAdmin = (user.publicMetadata as Record<string, string>)?.role === "admin";
  const completedLessons = (progressRows ?? []).filter((p: { completed: boolean }) => p.completed).length;
  const hasStarted = completedLessons > 0;
  const totalLessonsCount = 26; // 2+2+5+7+5+3+2 across 7 modules
  const courseProgressPct = Math.round((completedLessons / totalLessonsCount) * 100);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "VA";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  if (!hasPlan) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vekto-logo.png" alt="Vekto Academy" className="h-16 w-auto mx-auto mb-8" />
          <h1 className="text-3xl font-black mb-3">Нямаш активен план</h1>
          <p className="text-white/40 mb-8">Избери план за да получиш пълен достъп до платформата.</p>
          <Link href="/#pricing" className="inline-block bg-[#c8ff00] text-black font-black px-8 py-3 rounded-full hover:bg-[#d4ff1a] transition-colors">
            Виж плановете
          </Link>
        </div>
      </main>
    );
  }

  const navItems = [
    { href: "/dashboard", icon: <IconHome />, label: "Начало", key: "home" },
    { href: "/dashboard?tab=course", icon: <IconPlay />, label: "Обучение", key: "course" },
    { href: "/dashboard?tab=community", icon: <IconUsers />, label: "Общност", key: "community" },
    { href: "/dashboard?tab=jobs", icon: <IconArena />, label: "Арена", key: "jobs" },
    { href: "/dashboard?tab=arena", icon: <IconBriefcase />, label: "Работа", key: "arena" },
  ];

  const activeKey = tab === "home" || !tab ? "home" : tab;

  return (
    <div className="flex h-dvh bg-[#080808] text-white overflow-hidden">

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-[#0a0a0a] border-r border-white/8 hidden md:flex">

        {/* Logo */}
        <div className="px-5 h-16 flex items-center border-b border-white/8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vekto-logo.png" alt="Vekto Academy" className="h-24 w-auto" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">

          <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 mb-1.5 font-semibold">Главно</p>
          {navItems.map((l) => {
            const active = activeKey === l.key;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? "bg-[#c8ff00]/10 text-[#c8ff00]" : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={`flex-shrink-0 ${active ? "text-[#c8ff00]" : "text-white/30"}`}>{l.icon}</span>
                {l.label}
                {l.key === "community" && (
                  <span className="ml-auto text-[10px] bg-[#c8ff00]/15 text-[#c8ff00] px-1.5 py-0.5 rounded font-bold">Ново</span>
                )}
                {l.key === "jobs" && (
                  <span className="ml-auto text-[10px] bg-white/8 text-white/30 px-1.5 py-0.5 rounded font-semibold">Скоро</span>
                )}
              </Link>
            );
          })}

          {/* Progress */}
          <div className="mt-4 mb-1">
            <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 mb-2 font-semibold">Прогрес</p>
            <div className="mx-3 rounded-xl bg-white/4 border border-white/6 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40">Обучение</span>
                <span className="text-xs font-bold text-[#c8ff00]">{completedLessons} / {totalLessonsCount}</span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-[#c8ff00] rounded-full" style={{ width: `${courseProgressPct}%` }} />
              </div>
              <Link href="/dashboard?tab=course" className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Продължи обучението
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="mt-4 mb-1">
            <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 mb-1.5 font-semibold">Ресурси</p>
            {[
              { label: "AI Инструменти", icon: "⚡" },
              { label: "Промпт шаблони", icon: "◻" },
            ].map((r) => (
              <button key={r.label} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all text-left">
                <span className="text-base w-4 text-center leading-none">{r.icon}</span>
                {r.label}
                <svg className="w-3 h-3 ml-auto opacity-30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </button>
            ))}
          </div>

          {/* Admin */}
          {isAdmin && (
            <div className="mt-4 mb-1">
              <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 mb-1.5 font-semibold">Админ</p>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-[#c8ff00] hover:bg-[#c8ff00]/5 transition-all"
              >
                <span className="text-white/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </span>
                Админ панел
              </Link>
            </div>
          )}

          {/* Account */}
          <div className="mt-auto pt-4 border-t border-white/8">
            <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 mb-1.5 font-semibold">Акаунт</p>
            <Link
              href="/dashboard?tab=account"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeKey === "account" ? "bg-[#c8ff00]/10 text-[#c8ff00]" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              <span className={activeKey === "account" ? "text-[#c8ff00]" : "text-white/30"}><IconUser /></span>
              Профил
            </Link>
            <Link href="/sign-out" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all">
              <span className="text-white/20"><IconLogout /></span>
              Log out
            </Link>
          </div>
        </nav>

        {/* User card */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/4 border border-white/6">
            <div className="w-9 h-9 rounded-full bg-[#c8ff00] flex items-center justify-center text-black text-xs font-black flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{fullName || "Потребител"}</p>
              <p className="text-white/30 text-xs truncate mt-0.5">{planLabel[member?.plan]}</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#c8ff00] flex-shrink-0" title="Активен" />
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 border-b border-white/8 px-4 md:px-6 flex items-center justify-between flex-shrink-0 bg-[#080808]">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vekto-logo.png" alt="" className="h-8 w-auto md:hidden" />
            <p className="font-black text-base leading-tight hidden md:block">
              {activeKey === "home" && "Начало"}
              {activeKey === "course" && "Обучение"}
              {activeKey === "community" && "Общност"}
              {activeKey === "jobs" && "Арена"}
              {activeKey === "arena" && "Работа"}
              {activeKey === "account" && "Профил"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="p-2 rounded-lg text-white/30 hover:text-[#c8ff00] hover:bg-[#c8ff00]/5 transition-all"
                title="Админ панел"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </Link>
            )}
            <NotificationBell />
            <span className="hidden sm:flex items-center gap-1.5 bg-[#c8ff00]/10 text-[#c8ff00] text-xs font-bold px-3 py-1.5 rounded-full border border-[#c8ff00]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00] animate-pulse" />
              {planLabel[member?.plan]}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#c8ff00] flex items-center justify-center text-black text-xs font-black md:hidden">
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className={`flex-1 overflow-y-auto ${activeKey === "community" ? "p-3 md:p-4" : "p-5 md:p-8"}`}>

          {/* Success banner */}
          {success && (
            <div className="mb-6 rounded-xl bg-[#c8ff00]/10 border border-[#c8ff00]/20 px-5 py-3 flex items-center gap-3 max-w-5xl mx-auto">
              <span className="text-[#c8ff00] font-bold">✓</span>
              <p className="text-[#c8ff00] text-sm font-semibold">Плащането е успешно! Добре дошъл в Vekto Academy.</p>
            </div>
          )}

          {/* ── HOME TAB ── */}
          {activeKey === "home" && (
            <div className="max-w-5xl mx-auto space-y-5">

              {/* Greeting + stats row */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black mb-1">Здравей, {user?.firstName || "приятел"} 👋</h2>
                  <p className="text-white/40 text-sm">Добре дошъл в Vekto Academy.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#111] border border-white/8 px-4 py-2.5 text-center">
                    <p className="text-[#c8ff00] font-black text-lg leading-none">{completedLessons}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">завършени</p>
                  </div>
                  <div className="rounded-xl bg-[#111] border border-white/8 px-4 py-2.5 text-center">
                    <p className="text-white font-black text-lg leading-none">{courseProgressPct}%</p>
                    <p className="text-white/30 text-[10px] mt-0.5">прогрес</p>
                  </div>
                </div>
              </div>

              {/* Main grid — 3 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Continue course — spans 2 cols */}
                <div className="lg:col-span-2 rounded-2xl bg-[#111] border border-white/8 overflow-hidden">
                  <div className="flex items-center justify-between px-5 pt-5 pb-4">
                    <p className="font-black text-sm uppercase tracking-widest text-white/40">Продължи обучението</p>
                    <Link href="/dashboard/course/1" className="text-[#c8ff00] text-xs font-bold hover:underline">Влез →</Link>
                  </div>
                  <Link href="/dashboard/course/1" className="block group mx-5 mb-4">
                    <div className="rounded-xl bg-[#0d0d0d] border border-white/6 overflow-hidden relative aspect-video flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#c8ff00]/5 to-transparent" />
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-[#c8ff00] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                        <p className="text-white/50 text-sm">Модул 0 — Старт</p>
                        <span className="text-[#c8ff00] text-xs font-bold bg-[#c8ff00]/10 px-3 py-1 rounded-full">Гледай сега</span>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 px-5 pb-5">
                    <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                      <div className="h-full bg-[#c8ff00] rounded-full transition-all" style={{ width: `${courseProgressPct}%` }} />
                    </div>
                    <span className="text-white/30 text-xs flex-shrink-0">{completedLessons} / {totalLessonsCount}</span>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-4">
                  <Link href="/dashboard?tab=community" className="rounded-2xl bg-[#111] border border-white/8 p-5 flex flex-col justify-between hover:border-white/15 transition-all group flex-1">
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3 font-semibold">Общност</p>
                      <div className="flex -space-x-2 mb-3">
                        {[
                          { l: "V", bg: "#c8ff00", color: "#000" },
                          { l: "И", bg: "#2a2a2a", color: "#fff" },
                          { l: "М", bg: "#1e1e1e", color: "#fff" },
                          { l: "Г", bg: "#252525", color: "#fff" },
                        ].map((a, i) => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-[#111] flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: a.bg, color: a.color }}>{a.l}</div>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/40 text-xs group-hover:text-white/60 transition-colors">Отвори чата →</p>
                  </Link>
                  <div className="rounded-2xl bg-[#111] border border-white/8 p-5 flex-1">
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2 font-semibold">На живо Q&A</p>
                    <p className="text-base font-black">Събота 18:00</p>
                    <p className="text-white/25 text-xs mt-1">Очаквай линк скоро</p>
                  </div>
                  <Link href="/dashboard?tab=jobs" className="rounded-2xl bg-[#111] border border-white/8 p-5 flex-1 hover:border-white/15 transition-all group">
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2 font-semibold">⚡ Арена</p>
                    <p className="text-base font-black leading-tight">Предизвикателство #001</p>
                    <p className="text-[#c8ff00] text-xs mt-1 font-bold group-hover:underline">€150 награда →</p>
                  </Link>
                </div>
              </div>

              {/* Upsell card */}
              <div className="rounded-2xl border border-[#c8ff00]/20 bg-gradient-to-br from-[#c8ff00]/6 via-[#c8ff00]/3 to-transparent p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-[#c8ff00]/15 border border-[#c8ff00]/25 rounded-full px-3 py-1 mb-3">
                    <span className="text-[#c8ff00] text-[10px] font-black uppercase tracking-widest">1:1 Менторство</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black mb-2 leading-tight">Искаш по-бързи резултати?</h3>
                  <p className="text-white/45 text-sm leading-relaxed">
                    Резервирай лична среща директно с нас — само ти и екипът на Vekto Agency. Никакви посредници, никакви записи. Гледаме твоята ситуация, твоите проекти и ти казваме точно какво да правиш следващото.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    {["Само ти и Vekto Team", "Ревю на твоите проекти", "Конкретен план за действие"].map((f) => (
                      <span key={f} className="flex items-center gap-1.5 text-xs text-white/50">
                        <span className="text-[#c8ff00]">✓</span> {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a href="https://vekto.agency" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#c8ff00] text-black font-black px-6 py-3 rounded-xl hover:bg-[#d4ff1a] transition-all text-sm whitespace-nowrap">
                    Резервирай сесия →
                  </a>
                  <a href="https://vekto.agency" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border border-white/10 text-white/40 hover:text-white hover:border-white/20 font-semibold px-6 py-3 rounded-xl transition-all text-sm whitespace-nowrap">
                    Виж агенцията
                  </a>
                </div>
              </div>

              {/* Bottom row: Announcements + Module list */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Announcements */}
                <div className="rounded-2xl bg-[#111] border border-white/8 p-5">
                  <p className="font-black text-xs uppercase tracking-widest text-white/40 mb-4">Обяви</p>
                  <div className="flex flex-col gap-4">
                    {announcements.map((a, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#c8ff00] flex items-center justify-center text-black text-xs font-black flex-shrink-0">{a.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-bold">{a.author}</span>
                            <span className="text-[10px] bg-white/6 text-white/40 px-2 py-0.5 rounded font-semibold">{a.tag}</span>
                            <span className="text-white/20 text-xs">{a.time}</span>
                          </div>
                          <p className="text-white/50 text-sm leading-relaxed">{a.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Module list preview */}
                <div className="rounded-2xl bg-[#111] border border-white/8 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-black text-xs uppercase tracking-widest text-white/40">Модули</p>
                    <Link href="/dashboard/course/1" className="text-[#c8ff00] text-xs font-bold hover:underline">Към обучението →</Link>
                  </div>
                  <div className="flex flex-col gap-2">
                    {modules.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-white/2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black bg-white/6 text-white/25">
                          {m.id}
                        </div>
                        <p className="text-xs font-semibold truncate flex-1 text-white/50">{m.title}</p>
                        <span className="text-white/15 text-[10px]">{m.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── COURSE TAB ── */}
          {activeKey === "course" && (
            <div className="max-w-5xl mx-auto">
              {/* Hero — direct entry */}
              <div className="rounded-2xl bg-[#111] border border-white/8 overflow-hidden mb-5">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <p className="text-[#c8ff00] text-[10px] font-black uppercase tracking-[0.2em] mb-2">Vekto Academy</p>
                    <h2 className="text-2xl md:text-3xl font-black mb-2">Обучение</h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-5 max-w-lg">
                      Научи се да правиш AI видеа от нулата до реален клиентски проект. 7 модула, {totalLessonsCount} урока, доживотен достъп.
                    </p>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-1 h-2 bg-white/6 rounded-full overflow-hidden">
                        <div className="h-full bg-[#c8ff00] rounded-full transition-all" style={{ width: `${courseProgressPct}%` }} />
                      </div>
                      <span className="text-white/40 text-xs flex-shrink-0">{completedLessons} / {totalLessonsCount}</span>
                    </div>
                    <Link
                      href="/dashboard/course/1"
                      className="inline-flex items-center gap-2 bg-[#c8ff00] text-black font-black px-6 py-3 rounded-xl hover:bg-[#d4ff1a] transition-all text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      {completedLessons > 0 ? "Продължи обучението" : "Влез в обучението"}
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                    {[
                      { n: "7", label: "Модула" },
                      { n: String(totalLessonsCount), label: "Урока" },
                      { n: "∞", label: "Достъп" },
                      { n: "На живо", label: "Q&A" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/4 border border-white/6 rounded-xl p-3 text-center w-24">
                        <p className="font-black text-lg text-white leading-none">{s.n}</p>
                        <p className="text-white/30 text-[10px] mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Module grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modules.map((m) => (
                  <Link
                    key={m.id}
                    href={`/dashboard/course/${m.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#111] hover:bg-white/5 p-4 transition-all group"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm bg-white/6 text-white/30">
                      {m.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate text-white/80">{m.title}</p>
                      <p className="text-white/25 text-xs mt-0.5">{m.duration}</p>
                    </div>
                    <span className="text-[#c8ff00] text-xs font-bold flex-shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                ))}
              </div>
              <p className="text-white/20 text-xs text-center pt-4">Съдържанието се качва постепенно — ще получиш имейл при нов модул.</p>
            </div>
          )}

          {/* ── COMMUNITY TAB ── */}
          {activeKey === "community" && <CommunityChat />}

          {/* ── ARENA TAB ── */}
          {activeKey === "jobs" && (
            <div className="max-w-5xl mx-auto">

              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <p className="text-[#c8ff00] text-[10px] font-black uppercase tracking-[0.2em] mb-1">⚡ Vekto Arena</p>
                  <h2 className="text-2xl md:text-3xl font-black leading-none mb-2">Влез. Докажи се.</h2>
                  <p className="text-white/35 text-sm leading-relaxed max-w-lg">
                    Всяка седмица пускаме реална задача от агенцията. Участваш, предаваш и Vekto избира победител. Всеки получава feedback и badge. Победителят получава плащане.
                  </p>
                </div>
                <div className="bg-[#0d0d0d] border border-white/8 rounded-xl px-5 py-3 text-center flex-shrink-0">
                  <p className="text-white/20 text-[10px] uppercase tracking-widest">Предизвикателство</p>
                  <p className="text-[#c8ff00] font-black text-2xl">#001</p>
                </div>
              </div>

              {/* Main 2-col layout */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* LEFT — Active challenge (wider) */}
                <div className="lg:col-span-3">
                  <div className="relative rounded-2xl overflow-hidden border border-white/8">

                    {/* Lock overlay */}
                    {!hasStarted && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#080808]/90 backdrop-blur-sm">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <IconLock />
                        </div>
                        <div className="text-center px-6">
                          <p className="text-white font-bold mb-1">Заключено</p>
                          <p className="text-white/40 text-sm">Започни обучението за да участваш</p>
                        </div>
                        <Link href="/dashboard/course/1" className="bg-[#c8ff00] text-black font-black px-5 py-2 rounded-full text-sm hover:bg-[#d4ff1a] transition-colors">
                          Започни сега →
                        </Link>
                      </div>
                    )}

                    <div className={!hasStarted ? "blur-sm pointer-events-none select-none" : ""}>
                      <div className="bg-[#0d0d0d] px-5 py-3.5 flex items-center justify-between border-b border-white/6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#c8ff00] animate-pulse" />
                          <p className="font-black text-sm tracking-wide uppercase">Live</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white/30 text-xs">⏱ 4 дни останали</span>
                          <span className="bg-[#c8ff00] text-black text-xs font-black px-3 py-1 rounded-full">€150</span>
                        </div>
                      </div>
                      <div className="bg-[#111] p-5">
                        <p className="text-white/25 text-[10px] uppercase tracking-widest mb-2">Brief</p>
                        <h3 className="font-black text-xl mb-2">Product Launch — AI Tool</h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-5">
                          Създай 30–60 сек промо видео за нов AI инструмент. Модерен, динамичен стил, без voiceover.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                          {[
                            { label: "Награда", value: "€150" },
                            { label: "Краен срок", value: "4 дни" },
                            { label: "Формат", value: "16:9" },
                            { label: "Участници", value: "12" },
                          ].map((d) => (
                            <div key={d.label} className="bg-white/3 border border-white/6 rounded-xl p-2.5 text-center">
                              <p className="text-white/20 text-[9px] uppercase tracking-widest mb-1">{d.label}</p>
                              <p className="font-black text-sm">{d.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                          {[
                            { icon: "🎖️", label: "Badge", sub: "за всеки" },
                            { icon: "💬", label: "Feedback", sub: "личен от Vekto" },
                            { icon: "💰", label: "Плащане", sub: "само победителя" },
                          ].map((r) => (
                            <div key={r.label} className="bg-white/3 border border-white/6 rounded-xl p-3 text-center">
                              <p className="text-lg mb-0.5">{r.icon}</p>
                              <p className="font-bold text-xs">{r.label}</p>
                              <p className="text-white/25 text-[10px]">{r.sub}</p>
                            </div>
                          ))}
                        </div>
                        <button className="w-full bg-[#c8ff00] text-black font-black py-3 rounded-xl text-sm">Предай проект →</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT — Rules + Scoreboard */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <ArenaRules />

                  <div className="border border-white/6 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-[#0d0d0d] border-b border-white/6 flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40">🏆 Scoreboard</p>
                      <span className="text-white/15 text-[10px]">2 завършени</span>
                    </div>
                    <div className="divide-y divide-white/4">
                      {[
                        { num: 1, title: "Brand Awareness — Fashion клиент", prize: "€150", winner: "М. Георгиев", entries: 8 },
                        { num: 2, title: "AI Avatar Demo × 3 видеа", prize: "€200", winner: "И. Петров", entries: 14 },
                      ].map((c) => (
                        <div key={c.num} className="px-4 py-3 flex items-center gap-3">
                          <p className="text-white/10 font-black text-base w-5 flex-shrink-0">#{c.num}</p>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{c.title}</p>
                            <p className="text-white/25 text-[10px]">🥇 {c.winner} · {c.entries} предадени</p>
                          </div>
                          <span className="text-[#c8ff00] text-sm font-black flex-shrink-0">{c.prize}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── JOB PIPELINE TAB ── */}
          {activeKey === "arena" && (
            <div className="max-w-5xl mx-auto">

              {/* Header */}
              <div className="mb-6">
                <p className="text-white/25 text-[10px] uppercase tracking-[0.2em] font-semibold mb-1">Vekto Работа</p>
                <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2">Твоята работа говори.<br/>Ние слушаме.</h2>
                <p className="text-white/35 text-sm max-w-md">Качи портфолиото си и кандидатствай. Разглеждаме всеки профил лично.</p>
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* LEFT — Profile form */}
                <div className="lg:col-span-3">
                  <div className="relative rounded-2xl border border-white/8 bg-[#111] overflow-hidden">

                    {/* Lock */}
                    {!hasStarted && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#080808]/90 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <IconLock />
                        </div>
                        <div className="text-center px-6">
                          <p className="text-white font-bold text-sm mb-1">Заключено</p>
                          <p className="text-white/35 text-xs">Завърши поне един урок</p>
                        </div>
                        <Link href="/dashboard/course/1" className="bg-[#c8ff00] text-black font-black px-4 py-2 rounded-full text-xs hover:bg-[#d4ff1a] transition-colors">
                          Започни сега →
                        </Link>
                      </div>
                    )}

                    <div className={!hasStarted ? "blur-sm pointer-events-none select-none" : ""}>
                      <div className="px-5 py-4 border-b border-white/6 bg-[#0d0d0d]">
                        <p className="text-xs font-black uppercase tracking-widest text-white/30">Твоят профил</p>
                      </div>
                      <div className="p-5 space-y-3">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-[#c8ff00] flex items-center justify-center text-black text-lg font-black flex-shrink-0">{initials}</div>
                          <div>
                            <p className="font-bold text-sm">{fullName || "Твоето Ime"}</p>
                            <p className="text-white/30 text-xs">{planLabel[member?.plan]}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5 block">Специализация</label>
                          <input type="text" placeholder="напр. AI Video Creator, Editor..." className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#c8ff00]/30 transition-colors" />
                        </div>
                        <div>
                          <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5 block">Bio</label>
                          <textarea rows={3} placeholder="Кратко описание — кой си и какво правиш..." className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#c8ff00]/30 transition-colors resize-none" />
                        </div>
                        <div>
                          <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5 block">Линк към портфолио</label>
                          <input type="url" placeholder="https://..." className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#c8ff00]/30 transition-colors" />
                        </div>
                        <div>
                          <label className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5 block">YouTube / Instagram</label>
                          <input type="url" placeholder="https://..." className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#c8ff00]/30 transition-colors" />
                        </div>
                        <button className="w-full bg-[#c8ff00] text-black font-black py-3 rounded-xl text-sm mt-1 hover:bg-[#d4ff1a] transition-colors">
                          Изпрати за преглед →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT — Info */}
                <div className="lg:col-span-2 space-y-5">

                  {/* What we look for */}
                  <div className="rounded-2xl bg-[#111] border border-white/8 p-5">
                    <p className="text-white/25 text-[10px] uppercase tracking-widest font-semibold mb-3">Какво търсим</p>
                    <div className="space-y-2">
                      {[
                        { emoji: "🎬", title: "AI Video Creators", desc: "Sora, Kling, Runway, HeyGen" },
                        { emoji: "✍️", title: "Video Editors", desc: "Post-production, motion graphics" },
                        { emoji: "🎙️", title: "Voiceover & Script", desc: "Скриптове и/или глас" },
                        { emoji: "📱", title: "Short-form", desc: "Reels, TikTok, Shorts" },
                      ].map((r) => (
                        <div key={r.title} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/6 bg-white/2">
                          <span className="text-lg flex-shrink-0">{r.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-xs">{r.title}</p>
                            <p className="text-white/25 text-[10px]">{r.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Process */}
                  <div className="rounded-2xl bg-[#111] border border-white/8 p-5">
                    <p className="text-white/25 text-[10px] uppercase tracking-widest font-semibold mb-3">Процесът</p>
                    <div className="space-y-3">
                      {[
                        { n: "1", text: "Попълваш профила с портфолио" },
                        { n: "2", text: "Vekto разглежда до 5 дни" },
                        { n: "3", text: "Получаваш отговор лично" },
                        { n: "4", text: "При match — договаряме проект" },
                      ].map((s) => (
                        <div key={s.n} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/6 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30 flex-shrink-0">{s.n}</div>
                          <p className="text-white/40 text-sm">{s.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ */}
                  <div className="rounded-2xl bg-[#111] border border-white/8 p-5">
                    <p className="text-white/25 text-[10px] uppercase tracking-widest font-semibold mb-3">FAQ</p>
                    <div className="space-y-3">
                      {[
                        { q: "Трябва ли да съм завършил обучението?", a: "Не — достатъчно е да си започнал." },
                        { q: "Как се плаща?", a: "По проект, по банков път или PayPal." },
                        { q: "Мога ли да кандидатствам повторно?", a: "Да, след 30 дни с обновен профил." },
                      ].map((item, i) => (
                        <div key={i} className="border-b border-white/6 pb-3 last:border-0 last:pb-0">
                          <p className="font-bold text-xs mb-1 text-white/70">{item.q}</p>
                          <p className="text-white/35 text-xs leading-relaxed">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ── ACCOUNT TAB ── */}
          {activeKey === "account" && (
            <div className="max-w-2xl mx-auto space-y-4">

              {/* Profile card */}
              <div className="rounded-2xl bg-[#111] border border-white/8 p-6">
                <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-5">Твоят профил</p>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-[#c8ff00] flex items-center justify-center text-black text-xl font-black flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="font-black text-lg leading-tight">{fullName || "Потребител"}</p>
                    <p className="text-white/35 text-sm">{user?.emailAddresses?.[0]?.emailAddress}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/4 border border-white/6 rounded-xl p-3">
                    <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">План</p>
                    <p className="font-bold text-sm">{planLabel[member?.plan]}</p>
                  </div>
                  <div className="bg-white/4 border border-white/6 rounded-xl p-3">
                    <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Статус</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00]" />
                      <p className="font-bold text-sm text-[#c8ff00]">Активен</p>
                    </div>
                  </div>
                  <div className="bg-white/4 border border-white/6 rounded-xl p-3">
                    <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Урока завършени</p>
                    <p className="font-bold text-sm">{completedLessons} / {totalLessonsCount}</p>
                  </div>
                  <div className="bg-white/4 border border-white/6 rounded-xl p-3">
                    <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Прогрес</p>
                    <p className="font-bold text-sm">{courseProgressPct}%</p>
                  </div>
                </div>
              </div>

              {/* Billing */}
              <div className="rounded-2xl bg-[#111] border border-white/8 p-6">
                <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-4">Абонамент</p>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="font-bold text-base mb-1">{planLabel[member?.plan]} план</p>
                    <p className="text-white/35 text-sm">
                      {member?.plan === "lifetime"
                        ? "Еднократно плащане — достъп завинаги."
                        : "Автоматично се подновява. Може да се отмени по всяко време."}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 bg-[#c8ff00]/10 text-[#c8ff00] text-xs font-bold px-3 py-1.5 rounded-full border border-[#c8ff00]/20 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00]" />
                    Активен
                  </span>
                </div>

                {member?.plan !== "lifetime" && <BillingPortalButton />}

                {member?.plan === "lifetime" && (
                  <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-[#c8ff00]/15 bg-[#c8ff00]/5">
                    <span className="text-[#c8ff00]">⚡</span>
                    <p className="text-sm text-white/60">Доживотен достъп — без месечни плащания.</p>
                  </div>
                )}
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl bg-[#111] border border-white/8 p-6">
                <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-4">Акаунт</p>
                <div className="space-y-2">
                  <Link
                    href="/sign-out"
                    className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/30"><IconLogout /></span>
                      <div>
                        <p className="font-bold text-sm">Log out</p>
                        <p className="text-white/35 text-xs">Излез от акаунта</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="md:hidden flex-shrink-0 border-t border-white/8 bg-[#0a0a0a] flex items-center">
          {navItems.map((l) => {
            const active = activeKey === l.key;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-center transition-colors ${active ? "text-[#c8ff00]" : "text-white/25 hover:text-white/60"}`}
              >
                <span className="flex-shrink-0">{l.icon}</span>
                <span className="text-[9px] font-semibold leading-none">{l.label}</span>
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
