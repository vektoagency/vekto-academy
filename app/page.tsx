"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createCheckout } from "./actions/checkout";

const pipelineSteps = [
  {
    step: "01",
    title: "Учи",
    desc: "Завърши модулите и усвои workflow-а",
    detail: "Структурирано обучение от реална AI видео агенция. Научаваш инструментите, промптинга и workflow-а, които използваме за реални клиенти — стъпка по стъпка.",
  },
  {
    step: "02",
    title: "Докажи се",
    desc: "Предай тестов проект за оценка",
    detail: "Когато си готов, предаваш тестов проект. Екипът на Vekto го оценява лично. Ако отговаря на нашия стандарт — минаваш на следващото ниво.",
  },
  {
    step: "03",
    title: "Работи",
    desc: "Получи платени задачи от Vekto",
    detail: "Реални платени проекти директно от Vekto Agency. Работиш с реални брандове, изграждаш портфолио и ставаш част от екипа.",
  },
];

const navLinks = [
  { href: "#features", label: "Обучение" },
  { href: "#for-who", label: "За кого" },
  { href: "#path", label: "Път" },
  { href: "#about", label: "За нас" },
  { href: "#testimonials", label: "Резултати" },
  { href: "#pricing", label: "Цени" },
  { href: "#faq", label: "FAQ" },
];

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#080808]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/vekto-logo.png" alt="Vekto Academy" className="h-20 sm:h-28 w-auto" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="relative text-sm text-white/40 hover:text-white transition-colors group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#c8ff00] group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-white/40 hover:text-white transition-colors hidden md:block">Влез</Link>
          <Link href="/sign-up" className="text-sm bg-[#c8ff00] text-black font-bold px-5 py-2 rounded-full hover:bg-[#d4ff1a] transition-colors">
            Започни
          </Link>
          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-1.5 p-1 ml-1" aria-label="Меню">
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96" : "max-h-0"}`}>
        <div className="px-6 py-4 flex flex-col gap-1 bg-[#080808] border-t border-white/8">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white py-3 text-base border-b border-white/5 last:border-0 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/sign-in" onClick={() => setOpen(false)} className="text-white/40 hover:text-white py-3 text-base transition-colors">
            Влез
          </Link>
        </div>
      </div>
    </nav>
  );
}

const platformTabs = [
  {
    id: "course",
    label: "Обучение",
    title: "Структурирано обучение",
    desc: "Модули наредени по логика — гледаш, практикуваш, минаваш напред. Прогресът се пази автоматично.",
    ui: (
      <div className="w-full bg-[#0d0d0d] rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#111]">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <span className="text-white/20 text-xs ml-2">vektoacademy.com/course</span>
        </div>
        <div className="flex h-52 sm:h-64">
          <div className="w-44 sm:w-56 border-r border-white/8 p-3 flex flex-col gap-0.5 overflow-hidden flex-shrink-0">
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Меню</p>
            {[
              { n: "0.", title: "Старт", emoji: "🚀" },
              { n: "1.", title: "Майндсет", emoji: "🧠" },
              { n: "2.", title: "Стратегия", emoji: "🎯" },
              { n: "3.", title: "Инструменти", emoji: "🛠️" },
              { n: "4.", title: "Playbooks", emoji: "⭐" },
              { n: "5.", title: "Монтаж", emoji: "✂️" },
              { n: "6.", title: "Клиенти", emoji: "💼" },
            ].map((m, i) => (
              <div key={m.n} className={`px-2 py-1 rounded-md text-[11px] flex items-center gap-1.5 ${i === 4 ? "bg-[#c8ff00]/10 text-[#c8ff00]" : i < 4 ? "text-white/40" : "text-white/25"}`}>
                <span className="text-xs flex-shrink-0">{m.emoji}</span>
                <span className="truncate">{m.n} {m.title}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 p-4 flex flex-col gap-3">
            <div className="aspect-video bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-white/8 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#c8ff00] flex items-center justify-center">
                <svg className="w-3 h-3 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-1.5 flex-1 bg-white/8 rounded-full overflow-hidden"><div className="h-full w-3/5 bg-[#c8ff00] rounded-full" /></div>
              <span className="text-white/20 text-[10px]">2:10 / 3:42</span>
            </div>
            <p className="text-white/40 text-xs">4. The Playbooks — Higgsfield + Arcads</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "chat",
    label: "Общност",
    title: "Real-time чат",
    desc: "Задаваш въпрос — отговорът идва от реални хора в платформата. Без групи в Telegram, без изгубени съобщения.",
    ui: (
      <div className="w-full bg-[#0d0d0d] rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#111]">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <span className="text-white/20 text-xs ml-2">vektoacademy.com/community</span>
        </div>
        <div className="flex h-52 sm:h-64">
          <div className="w-36 sm:w-44 border-r border-white/8 p-3 flex-shrink-0">
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Канали</p>
            {["# общи", "# въпроси", "# проекти", "# инструменти", "# job-board"].map((c, i) => (
              <div key={c} className={`px-2 py-1.5 rounded text-xs ${i === 1 ? "bg-white/8 text-white" : "text-white/30"}`}>{c}</div>
            ))}
          </div>
          <div className="flex-1 p-3 flex flex-col justify-end gap-2 overflow-hidden">
            {[
              { u: "М", msg: "Как да направя lip sync с Hedra?", accent: false },
              { u: "V", msg: "Използвай този промпт → ...", accent: true },
              { u: "С", msg: "Работи, благодаря! 🔥", accent: false },
            ].map((m) => (
              <div key={m.msg} className="flex items-start gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${m.accent ? "bg-[#c8ff00] text-black" : "bg-white/10 text-white/50"}`}>{m.u}</div>
                <div className={`rounded-xl px-3 py-2 text-xs max-w-[80%] ${m.accent ? "bg-[#c8ff00]/10 text-[#c8ff00]/80" : "bg-white/5 text-white/50"}`}>{m.msg}</div>
              </div>
            ))}
            <div className="mt-1 flex items-center gap-2 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-1.5">
              <span className="text-white/20 text-xs flex-1">Напиши съобщение...</span>
              <div className="w-5 h-5 rounded-md bg-[#c8ff00] flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "jobs",
    label: "Арена",
    title: "Предизвикателства с награди",
    desc: "Реални задачи със срок и награда. Предаваш проект, получаваш обратна връзка от Vekto. Най-добрият печели.",
    ui: (
      <div className="w-full bg-[#0d0d0d] rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#111]">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <span className="text-white/20 text-xs ml-2">vektoacademy.com/dashboard?tab=arena</span>
        </div>
        <div className="p-3 sm:p-4 h-52 sm:h-64 grid grid-cols-5 gap-3 overflow-hidden">
          {/* Active challenge */}
          <div className="col-span-3 rounded-xl border border-white/8 overflow-hidden flex flex-col">
            <div className="bg-[#111] px-3 py-2 flex items-center justify-between border-b border-white/6">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00] animate-pulse" />
                <p className="font-black text-[10px] tracking-widest uppercase">Live</p>
              </div>
              <span className="bg-[#c8ff00] text-black text-[10px] font-black px-2 py-0.5 rounded-full">€30</span>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <p className="text-white/25 text-[9px] uppercase tracking-widest mb-1">Brief #001</p>
              <p className="font-black text-xs sm:text-sm leading-tight mb-2">Product Launch — AI Tool</p>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[
                  { l: "Срок", v: "4 дни" },
                  { l: "Формат", v: "16:9" },
                  { l: "Участ.", v: "12" },
                ].map((d) => (
                  <div key={d.l} className="bg-white/3 border border-white/6 rounded-md py-1 text-center">
                    <p className="text-white/20 text-[8px] uppercase">{d.l}</p>
                    <p className="font-black text-[10px]">{d.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-auto bg-[#c8ff00] text-black text-[10px] font-black py-1.5 rounded-md text-center">Предай проект →</div>
            </div>
          </div>
          {/* Scoreboard */}
          <div className="col-span-2 rounded-xl border border-white/6 overflow-hidden flex flex-col">
            <div className="px-2.5 py-2 bg-[#111] border-b border-white/6">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">🏆 Scoreboard</p>
            </div>
            <div className="divide-y divide-white/5 flex-1">
              {[
                { n: 1, w: "М. Георгиев", p: "€30" },
                { n: 2, w: "И. Петров", p: "€30" },
              ].map((c) => (
                <div key={c.n} className="px-2.5 py-2 flex items-center gap-1.5">
                  <p className="text-white/10 font-black text-xs w-3 flex-shrink-0">#{c.n}</p>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold truncate">🥇 {c.w}</p>
                  </div>
                  <span className="text-[#c8ff00] text-[10px] font-black flex-shrink-0">{c.p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "work",
    label: "Работа",
    title: "Подай портфолио — работи с нас",
    desc: "Качваш bio, линкове и примери. Vekto Agency преглежда всеки профил лично и възлага реални платени проекти.",
    ui: (
      <div className="w-full bg-[#0d0d0d] rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#111]">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <span className="text-white/20 text-xs ml-2">vektoacademy.com/dashboard?tab=jobs</span>
        </div>
        <div className="p-3 sm:p-4 h-52 sm:h-64 grid grid-cols-5 gap-3 overflow-hidden">
          {/* Profile form */}
          <div className="col-span-3 rounded-xl border border-white/8 bg-[#111] overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-white/6 bg-[#0d0d0d]">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Твоят профил</p>
            </div>
            <div className="p-3 flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#c8ff00] flex items-center justify-center text-black text-[10px] font-black flex-shrink-0">МГ</div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Мартин Георгиев</p>
                  <p className="text-white/30 text-[9px]">AI Video Creator</p>
                </div>
              </div>
              <div className="bg-white/4 border border-white/8 rounded-md px-2 py-1.5">
                <p className="text-white/20 text-[8px] uppercase tracking-widest">Портфолио</p>
                <p className="text-white/60 text-[10px] truncate">behance.net/martin.g</p>
              </div>
              <div className="bg-white/4 border border-white/8 rounded-md px-2 py-1.5 flex-1">
                <p className="text-white/20 text-[8px] uppercase tracking-widest">Bio</p>
                <p className="text-white/60 text-[10px] leading-tight">AI видеа за брандове. Специализация в UGC и product launch.</p>
              </div>
              <div className="bg-[#c8ff00] text-black text-[10px] font-black py-1.5 rounded-md text-center">Изпрати за преглед →</div>
            </div>
          </div>
          {/* What we look for */}
          <div className="col-span-2 rounded-xl border border-white/6 bg-[#111] overflow-hidden flex flex-col">
            <div className="px-2.5 py-2 bg-[#0d0d0d] border-b border-white/6">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Какво търсим</p>
            </div>
            <div className="p-2.5 flex flex-col gap-1.5 flex-1">
              {[
                "Реални финализирани проекти",
                "Ясен стил и почерк",
                "Опит с AI инструменти",
                "Комуникация на английски",
              ].map((t) => (
                <div key={t} className="flex items-start gap-1.5">
                  <span className="text-[#c8ff00] text-[10px] leading-tight flex-shrink-0">✓</span>
                  <p className="text-white/50 text-[10px] leading-tight">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

function PlatformPreview() {
  const [active, setActive] = useState(0);
  const tab = platformTabs[active];
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#080808] border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-3 block">Платформата</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight">Виж как изглежда отвътре</h2>
          <p className="text-white/40 text-sm mt-3">Влизаш с един акаунт — всичко е тук.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          {platformTabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActive(i)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${active === i ? "bg-[#c8ff00] text-black" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* UI mockup */}
        <div className="mb-6 animate-[fadeIn_0.25s_ease]" key={active}>
          {tab.ui}
        </div>

        {/* Description */}
        <div className="text-center">
          <h3 className="font-black text-xl mb-2">{tab.title}</h3>
          <p className="text-white/50 text-sm max-w-md mx-auto">{tab.desc}</p>
        </div>
      </div>
    </section>
  );
}

function PipelineSection() {
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!autoPlay) return;
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % pipelineSteps.length);
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoPlay]);

  function handleClick(i: number) {
    setActive(i);
    setAutoPlay(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  const s = pipelineSteps[active];

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#c8ff00]/3 rounded-full blur-[140px]" />
      </div>
      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-10 sm:mb-16">
          <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-4 block">Уникалното</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Плащаш да учиш.<br />
            <span className="text-[#c8ff00]">После ние ти плащаме.</span>
          </h2>
        </div>

        {/* Main interactive block */}
        <div className="rounded-3xl border border-white/10 bg-[#0e0e0e] overflow-hidden">

          {/* Step selector — top bar (desktop) / стacked (mobile) */}
          <div className="flex flex-col sm:flex-row border-b border-white/10">
            {pipelineSteps.map((step, i) => {
              const isActive = active === i;
              return (
                <button
                  key={step.step}
                  onClick={() => handleClick(i)}
                  className={`relative flex-1 py-4 px-5 text-left transition-all duration-300 ${isActive ? "bg-[#c8ff00]/5" : "hover:bg-white/3"} ${i < pipelineSteps.length - 1 ? "border-b sm:border-b-0 border-white/10" : ""}`}
                >
                  <span className={`block text-xs font-bold uppercase tracking-widest mb-1 transition-colors duration-300 ${isActive ? "text-[#c8ff00]" : "text-white/25"}`}>{step.step}</span>
                  <span className={`block font-black text-sm sm:text-base transition-colors duration-300 ${isActive ? "text-white" : "text-white/40"}`}>{step.title}</span>
                  {/* active underline */}
                  <div className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300 ${isActive ? "bg-[#c8ff00]" : "bg-transparent"}`}>
                    {isActive && autoPlay && <div className="h-full bg-[#c8ff00] animate-[progress_3s_linear_forwards]" />}
                  </div>
                  {/* desktop divider */}
                  {i < pipelineSteps.length - 1 && <div className="absolute right-0 top-4 bottom-4 w-px bg-white/10 hidden sm:block" />}
                </button>
              );
            })}
          </div>

          {/* Content area */}
          <div className="flex flex-row min-h-[180px] sm:min-h-[280px]">
            {/* Giant number — hidden on mobile */}
            <div className="hidden sm:flex items-center justify-center md:w-56 sm:w-36 border-r border-white/10 flex-shrink-0">
              <span key={active} className="text-[#c8ff00]/15 font-black leading-none select-none animate-[fadeIn_0.3s_ease]" style={{fontSize: "clamp(5rem,12vw,9rem)"}}>
                {s.step}
              </span>
            </div>

            {/* Text */}
            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center gap-3">
              <span className="text-[#c8ff00]/40 font-black text-2xl sm:hidden leading-none">{s.step}</span>
              <h3 key={`title-${active}`} className="text-2xl sm:text-3xl md:text-4xl font-black animate-[fadeIn_0.3s_ease]">{s.title}</h3>
              <p key={`desc-${active}`} className="text-white/40 text-sm sm:text-base font-medium animate-[fadeIn_0.3s_ease]">{s.desc}</p>
              <p key={`detail-${active}`} className="text-white/60 text-sm leading-relaxed max-w-lg animate-[fadeIn_0.35s_ease]">{s.detail}</p>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-[#c8ff00] pl-6 py-2 mt-8">
          <p className="text-white/50 leading-relaxed text-sm">
            Ако се докажеш — вратата е отворена.{" "}
            <span className="text-white">Най-активните членове получават реални проекти от Vekto и стават част от екипа.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Nav */}
      <MobileNav />

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-5 pt-24 pb-0 min-h-screen">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c8ff00]/4 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#c8ff00]/6 rounded-full blur-[80px]" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 mb-6 relative z-10">
          <span className="w-2 h-2 rounded-full bg-[#c8ff00] animate-pulse flex-shrink-0" />
          <span className="text-white/60 text-[10px] sm:text-xs font-medium tracking-wide">ДОЖИВОТЕН ДОСТЪП €349 — ОФЕРТАТА ИЗТИЧА НА 1 ЮНИ</span>
        </div>

        {/* Headline */}
        <h1 className="text-[2.4rem] sm:text-5xl md:text-6xl font-black leading-[1.1] mb-4 relative z-10 tracking-tight text-center">
          Научи се на AI контент.<br />
          <span className="text-[#c8ff00]">Получи реална работа.</span>
        </h1>

        <p className="text-white/50 text-sm sm:text-base md:text-lg max-w-sm md:max-w-md mb-8 relative z-10 leading-relaxed text-center">
          Учиш от агенция с реални клиенти. Докажи се —<span className="text-white/80"> и те плащаме.</span>
        </p>

        {/* CTA with plan toggle */}
        <PricingToggle />

        {/* Social proof */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs sm:text-sm text-white/30 relative z-10 mb-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c8ff00]" />
            <span>Early access отворен</span>
          </div>
          <span className="text-white/10 hidden sm:block">|</span>
          <div className="flex items-center gap-1">
            <span className="text-[#c8ff00] text-xs">★★★★★</span>
            <span>4.9 рейтинг</span>
          </div>
          <span className="text-white/10 hidden sm:block">|</span>
          <div className="flex items-center gap-1">
            <span className="text-[#c8ff00]">✓</span>
            <span>Реална агенция зад обучението</span>
          </div>
        </div>

        {/* Hero video */}
        <div className="relative mt-16 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="aspect-video bg-[#111] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c8ff00]/5 to-transparent" />
            {/* Placeholder за видеото — замени src с реалното видео */}
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#c8ff00] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-white/40 text-sm">Виж какво се случва вътре</p>
            </div>
            {/* Overlay UI mock */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
              <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-[#c8ff00] rounded-full" />
              </div>
              <span className="text-white/30 text-xs">2:34</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logos — клиенти на Vekto */}
      <section className="border-y border-white/10 py-8 md:py-16 px-0">
        <p className="text-center text-xs text-white/30 uppercase tracking-widest mb-12">Реални клиенти. Реален опит. Това преподаваме.</p>
        <div className="overflow-hidden relative">
          <div className="scroll-left flex gap-12 md:gap-24 items-center" style={{ width: "max-content" }}>
            {[...clients, ...clients, ...clients, ...clients].map((c, i) => (
              <div key={i} className="flex-shrink-0 px-2 md:px-8 opacity-70 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center md:h-[100px] h-[60px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.logo} alt={c.name} style={{ height: c.circular ? "60px" : "36px", width: c.circular ? "60px" : "auto", maxWidth: "160px", objectFit: "contain" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's inside — тъмен bg, 2+4 grid layout */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-3 block">Вътре в Academy-то</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight">Всичко на едно място</h2>
              <p className="text-white/40 text-sm mt-3 max-w-sm leading-relaxed">Един акаунт. Всичко точно тук — без Discord, без Telegram, без разхвърляни линкове.</p>
            </div>
            <div className="flex flex-col gap-1 md:items-end">
              <p className="text-white font-black text-lg md:text-right">Обучение. Общност. Работа.</p>
              <p className="text-white/40 text-sm md:text-right">На едно място. Влизаш и започваш.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl p-5 sm:p-6 border border-white/8 hover:border-[#c8ff00]/20 transition-all group bg-[#111]">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform preview */}
      <PlatformPreview />

      {/* For who — full width split, светъл акцент вляво */}
      <section id="for-who" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-3 block">За кого е</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight">Подходящо ли е за теб?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/10">
            <div className="p-6 sm:p-8 md:p-12 bg-[#c8ff00]/5 border-b md:border-b-0 md:border-r border-white/10">
              <p className="text-[#c8ff00] font-bold text-sm uppercase tracking-widest mb-6">Това е за теб ако...</p>
              <ul className="space-y-4">
                {["Искаш да правиш пари с AI съдържание", "Търсиш реална общност, не YouTube видеа", "Искаш да работиш freelance или remote", "Готов си да се докажеш и да получиш работа", "Нямаш опит но имаш желание да учиш"].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="text-[#c8ff00] mt-0.5 flex-shrink-0 font-bold">✓</span>{t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 sm:p-8 md:p-12 bg-[#0a0a0a]">
              <p className="text-white/30 font-bold text-sm uppercase tracking-widest mb-6">Не е за теб ако...</p>
              <ul className="space-y-4">
                {["Търсиш бърз и лесен начин да забогатееш", "Не си готов да отделяш време и усилия", "Очакваш гарантирана работа без да се докажеш", "Искаш само да гледаш видеа без да практикуваш"].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-white/30">
                    <span className="text-red-500/50 mt-0.5 flex-shrink-0">✕</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Progression — 3-step path to first client */}
      <section id="path" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0a0a0a] border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-3 block">Твоят път</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-4">Твоят път до първия клиент</h2>
            <p className="text-white/50 text-sm sm:text-base max-w-2xl mx-auto">Структурирана прогресия в 3 месеца — всеки етап надгражда предишния и те води към реална работа.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative">
            {/* Step 1 */}
            <div className="rounded-2xl p-6 sm:p-8 bg-[#0d0d0d] border border-white/10 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c8ff00] font-black text-sm">01</span>
                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Месец 1</span>
              </div>
              <h3 className="text-xl font-black mb-2">Основи</h3>
              <p className="text-white/60 text-sm mb-5">Изграждаш фундамента — AI инструменти, prompting, workflow-и и първите ти завършени проекти.</p>
              <ul className="space-y-2 text-sm text-white/70 mt-auto">
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Видео модули от нулата</li>
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Практически задания</li>
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Общност + Weekly Q&amp;A</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl p-6 sm:p-8 bg-[#0d0d0d] border border-white/10 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c8ff00] font-black text-sm">02</span>
                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Месец 2</span>
              </div>
              <h3 className="text-xl font-black mb-2">Арена</h3>
              <p className="text-white/60 text-sm mb-5">Състезания и challenges срещу други членове. Получаваш ревюта, изграждаш рефлекс и се откроиш.</p>
              <ul className="space-y-2 text-sm text-white/70 mt-auto">
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Седмични challenges</li>
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Ревю от Vekto екипа</li>
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Leaderboard и значки</li>
              </ul>
            </div>

            {/* Step 3 — highlighted */}
            <div className="rounded-2xl p-6 sm:p-8 bg-[#c8ff00]/[0.06] border-2 border-[#c8ff00]/40 flex flex-col shadow-[0_0_40px_rgba(200,255,0,0.08)] relative">
              <span className="absolute -top-3 left-6 bg-[#c8ff00] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Целта</span>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 rounded-full bg-[#c8ff00] text-black flex items-center justify-center font-black text-sm">03</span>
                <span className="text-[#c8ff00] text-[11px] font-bold uppercase tracking-widest">Месец 3</span>
              </div>
              <h3 className="text-xl font-black mb-2">Портфолио + Vekto задачи</h3>
              <p className="text-white/70 text-sm mb-5">Изграждаш професионално портфолио и влизаш в пула за реални платени задачи от Vekto клиенти.</p>
              <ul className="space-y-2 text-sm text-white/80 mt-auto">
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Професионално портфолио</li>
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Реални задачи от Vekto</li>
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Pipeline към наемане</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-white/40 text-xs sm:text-sm mt-10 max-w-2xl mx-auto">
            С <span className="text-[#c8ff00] font-semibold">Доживотен достъп</span> получаваш цялата структура отворена от ден 1 — можеш да прескачаш напред, да се връщаш и да работиш по свой темп.
          </p>
        </div>
      </section>

      {/* Instructor — premium split layout */}
      <section id="about" className="py-16 sm:py-24 bg-[#0d0d0d] border-y border-white/10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Label */}
          <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-12 block">Кои сме ние</span>

          {/* Main content */}
          <div className="flex flex-col md:flex-row gap-8 sm:gap-12 md:gap-24 items-start">
            {/* Left — headline + logo */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex items-start gap-5 md:block">
                <div className="w-20 h-20 md:hidden rounded-xl bg-[#111] border border-white/10 flex items-center justify-center p-4 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/vekto-logo.png" alt="Vekto" className="w-full h-auto" />
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-7xl font-black tracking-tight leading-[1.0]">
                  Учиш от хора,<br />
                  <span className="text-white/30">които правят.</span>
                </h2>
              </div>
              <div className="w-32 h-32 rounded-2xl bg-[#111] border border-white/10 hidden md:flex items-center justify-center p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/vekto-logo.png" alt="Vekto" className="w-full h-auto" />
              </div>
            </div>

            {/* Right — text + stats */}
            <div className="flex-1 flex flex-col gap-8 md:pt-2">
              <p className="text-white/60 text-lg md:text-xl leading-relaxed border-l-2 border-[#c8ff00] pl-5">
                Vekto прави AI видеа за реални брандове всеки месец. Всичко което преподаваме е тествано на реални клиенти — не теория.
              </p>
              <a href="https://vektoagency.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white transition-colors group w-fit">
                <span>vektoagency.com</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </a>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                <div>
                  <p className="text-[#c8ff00] font-black text-3xl md:text-4xl leading-none">200+</p>
                  <p className="text-white/40 text-xs sm:text-sm mt-2">проекта</p>
                </div>
                <div>
                  <p className="text-[#c8ff00] font-black text-3xl md:text-4xl leading-none">20+</p>
                  <p className="text-white/40 text-xs sm:text-sm mt-2">клиента</p>
                </div>
                <div>
                  <p className="text-[#c8ff00] font-black text-3xl md:text-4xl leading-none">100%</p>
                  <p className="text-white/40 text-xs sm:text-sm mt-2">AI-базирано</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job pipeline — интерактивен stepper */}
      <PipelineSection />

      {/* Testimonials — brutal, big photo */}
      <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0a0a0a] border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-3 block">Какво казват</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight">Реални хора.<br />Реални резултати.</h2>
            </div>
            <p className="text-white/30 text-sm max-w-xs md:text-right">Тези трима вече са част от Vekto екипа. Влязоха като членове — останаха като колеги.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="group rounded-2xl overflow-hidden border border-white/8 bg-[#111] flex flex-col">
                {/* Photo */}
                <div className="relative aspect-[4/3] bg-[#1a1a1a] overflow-hidden">
                  {t.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/10 text-6xl font-black">{t.name[0]}</span>
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#c8ff00] text-black text-xs font-bold px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
                    Вече в екипа
                  </div>
                </div>
                {/* Content */}
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <p className="text-white/80 text-base leading-relaxed flex-1">"{t.text}"</p>
                  <div className="pt-4 border-t border-white/10">
                    <p className="font-black text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — asymmetric, lifetime dominant */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#c8ff00]/4 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-3">Избери своя план</h2>
            <p className="text-white/40 text-sm sm:text-base">Започни с €59/мес или заключи доживотен достъп за €349 — завинаги.</p>
          </div>

          {/* Deadline strip — urgency first */}
          <div className="mb-8 rounded-2xl border border-[#c8ff00]/20 bg-[#c8ff00]/5 px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[#c8ff00] text-[10px] font-bold tracking-widest uppercase mb-1">⏰ Офертата изтича на 1 юни</p>
              <p className="text-white/50 text-xs">След 1 юни 2026 — цената на доживотния достъп се вдига</p>
            </div>
            <Countdown target={new Date("2026-06-01T00:00:00")} />
          </div>

          {/* Cards — asymmetric 3:2 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Lifetime — dominant */}
            <div className="md:col-span-3 order-1 rounded-3xl p-6 sm:p-10 bg-[#c8ff00] relative flex flex-col shadow-[0_0_60px_rgba(200,255,0,0.15)]">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-black text-[#c8ff00] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  <span>⚡</span>
                  <span>Всичко отворено от ден 1</span>
                </span>
                <span className="inline-flex items-center bg-black/10 text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Оферта до 1 юни
                </span>
                <span className="inline-flex items-center bg-black/10 text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Спестяваш €359
                </span>
              </div>

              <p className="text-black/50 text-xs mb-3 uppercase tracking-[0.2em] font-semibold">Доживотен достъп · еднократно</p>

              <div className="flex items-baseline gap-3 flex-wrap mb-2">
                <span className="text-black/30 text-xl line-through">€708/год</span>
                <span className="text-6xl sm:text-7xl font-black text-black leading-none">€349</span>
              </div>
              <p className="text-black/50 text-sm mb-6">≈ €1.15 на ден първата година</p>

              <ul className="space-y-2.5 text-sm text-black/80 mb-8">
                <li className="flex items-center gap-2"><span className="text-black font-bold">✓</span> Всичко от месечния план</li>
                <li className="flex items-center gap-2"><span className="text-black font-bold">✓</span> Достъп завинаги — без месечни такси</li>
                <li className="flex items-center gap-2"><span className="text-black font-bold">✓</span> Всички бъдещи модули</li>
                <li className="flex items-center gap-2"><span className="text-black font-bold">✓</span> Значка „Основател" в общността</li>
                <li className="flex items-center gap-2"><span className="text-black font-bold">✓</span> Приоритет за платени Vekto проекти</li>
              </ul>

              <form action={createCheckout.bind(null, "lifetime")} className="mt-auto">
                <button type="submit" className="w-full text-center bg-black text-[#c8ff00] font-black px-6 py-4 rounded-full hover:bg-black/90 transition-colors text-base shadow-xl">
                  Вземи доживотен достъп — €349
                </button>
              </form>
              <p className="text-black/50 text-xs text-center mt-3">Плащаш веднъж · Достъп завинаги · Без абонамент</p>
            </div>

            {/* Monthly — secondary */}
            <div className="md:col-span-2 order-2 rounded-3xl p-6 sm:p-8 bg-[#0d0d0d] border border-white/10 flex flex-col">
              <p className="text-white/40 text-xs mb-3 uppercase tracking-[0.2em] font-semibold">Месечен · абонамент</p>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl sm:text-6xl font-black leading-none">€59</span>
                <span className="text-white/30 text-lg">/мес</span>
              </div>
              <p className="text-white/40 text-sm mb-2">Отмяна по всяко време</p>
              <p className="text-white/30 text-xs mb-6">Структурирана прогресия месец по месец</p>

              <ul className="space-y-2.5 text-sm text-white/60 mb-6">
                <li className="flex items-center gap-2"><span className="text-[#c8ff00]">✓</span> Пълно обучение</li>
                <li className="flex items-center gap-2"><span className="text-[#c8ff00]">✓</span> Общност + Weekly Q&A</li>
                <li className="flex items-center gap-2"><span className="text-[#c8ff00]">✓</span> Реални задачи от Vekto</li>
                <li className="flex items-center gap-2"><span className="text-[#c8ff00]">✓</span> Ревю на работата ти</li>
                <li className="flex items-center gap-2"><span className="text-[#c8ff00]">✓</span> Pipeline към наемане</li>
              </ul>

              <form action={createCheckout.bind(null, "monthly")} className="mt-auto">
                <button type="submit" className="w-full text-center border border-white/20 text-white/70 font-semibold px-6 py-3 rounded-full hover:border-white/40 hover:text-white transition-colors text-sm">
                  Започни месечно
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-white/30 text-xs mt-8">
            Всички цени с ДДС включен · Сигурно плащане през Stripe · Пълни фактури
          </p>
        </div>
      </section>

      {/* FAQ — compact без карти */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0a0a0a] border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-12">
            <div className="md:w-48 flex-shrink-0">
              <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-3 block">FAQ</span>
              <h2 className="text-2xl md:text-3xl font-black">Имаш въпроси?</h2>
            </div>
            <div className="flex-1 space-y-2">
              {faq.map((q) => (
                <FaqItem key={q.q} q={q.q} a={q.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#c8ff00]/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#c8ff00] animate-pulse" />
            <span className="text-white/50 text-xs tracking-wide">ДОЖИВОТЕН ДОСТЪП €349 — ОФЕРТАТА ИЗТИЧА НА 1 ЮНИ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-5">
            Времето е сега.
          </h2>
          <p className="text-white/50 text-base md:text-lg mb-8 max-w-sm md:max-w-md mx-auto">
            Влез докато цената е най-ниска. След 1 юни — абонаментът расте, доживотният достъп изчезва.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-[#c8ff00] text-black font-black px-8 sm:px-10 md:px-14 py-3.5 sm:py-4 md:py-5 rounded-full text-base sm:text-lg md:text-xl hover:bg-[#d4ff1a] transition-all hover:scale-105 shadow-[0_0_80px_rgba(200,255,0,0.3)]"
          >
            Присъедини се сега
          </Link>
          <p className="text-white/25 text-sm mt-5">Без скрити такси · Отмяна по всяко време</p>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#080808]/95 backdrop-blur-sm border-t border-white/10 flex items-center justify-between gap-4 md:hidden">
        <div>
          <p className="text-white font-semibold text-sm">Доживотен достъп — €349</p>
          <p className="text-white/40 text-xs">Офертата изтича на 1 юни</p>
        </div>
        <Link href="/sign-up" className="bg-[#c8ff00] text-black font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#d4ff1a] transition-colors flex-shrink-0">
          Присъедини се
        </Link>
      </div>

      {/* Desktop sticky CTA */}
      <StickyBar />

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-sm">
          <span>© 2025 Vekto Academy</span>
          <Link href="https://vektoagency.com" className="hover:text-white transition-colors">
            vektoagency.com
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Countdown({ target }: { target: Date }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {[
        { value: time.days, label: "дни" },
        { value: time.hours, label: "часа" },
        { value: time.minutes, label: "мин" },
        { value: time.seconds, label: "сек" },
      ].map((t) => (
        <div key={t.label} className="text-center">
          <div className="text-2xl sm:text-3xl font-black text-[#c8ff00] tabular-nums w-12 sm:w-16">{String(t.value).padStart(2, "0")}</div>
          <div className="text-white/30 text-[10px] sm:text-xs">{t.label}</div>
        </div>
      ))}
    </div>
  );
}

function StickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 items-center gap-6 bg-[#111] border border-white/15 rounded-full px-6 py-3 shadow-2xl backdrop-blur-sm">
      <p className="text-white/60 text-sm">Доживотен достъп — €349 (до 1 юни)</p>
      <Link href="/sign-up" className="bg-[#c8ff00] text-black font-bold px-6 py-2 rounded-full text-sm hover:bg-[#d4ff1a] transition-colors">
        Присъедини се сега
      </Link>
    </div>
  );
}

const plans = [
  {
    id: "monthly",
    label: "Месечно",
    price: "€59",
    sub: "/мес",
    bgn: "Месечен абонамент",
    badge: null,
    note: "Отмяна по всяко време",
    cta: "Започни месечно — €59/мес",
  },
  {
    id: "lifetime",
    label: "Доживотен",
    price: "€349",
    sub: "",
    bgn: "Еднократно плащане",
    badge: "ДО 1 ЮНИ",
    note: "Спестяваш €359 vs годишно",
    cta: "Вземи доживотен достъп — €349",
  },
];

function PricingToggle() {
  const [selected, setSelected] = useState("lifetime");
  const plan = plans.find((p) => p.id === selected)!;

  return (
    <div className="flex flex-col items-center gap-4 mb-10 relative z-10 w-full max-w-md">
      {/* Segmented selector */}
      <div className="w-full p-1 rounded-2xl bg-white/[0.04] border border-white/10 grid grid-cols-2 gap-1">
        {plans.map((p) => {
          const isActive = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`relative rounded-xl py-3 px-3 text-left transition-all ${
                isActive
                  ? "bg-[#c8ff00] text-black shadow-[0_0_24px_rgba(200,255,0,0.25)]"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white/80"
              }`}
            >
              <div className="flex items-baseline justify-between gap-1">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? "text-black/70" : "text-white/40"}`}>
                  {p.label}
                </span>
                {p.badge && isActive && (
                  <span className="text-[9px] font-bold bg-black text-[#c8ff00] px-1.5 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl font-black leading-none ${isActive ? "text-black" : "text-white/80"}`}>{p.price}</span>
                <span className={`text-xs ${isActive ? "text-black/60" : "text-white/30"}`}>{p.sub}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active plan meta */}
      <div className="flex items-center justify-between w-full text-[11px] px-1">
        <span className="text-white/40">{plan.bgn}</span>
        <span className="text-[#c8ff00]/70 font-semibold">{plan.note}</span>
      </div>

      {/* CTA */}
      <Link
        href="/sign-up"
        className="w-full text-center bg-[#c8ff00] text-black font-bold px-8 py-4 rounded-full text-base hover:bg-[#d4ff1a] hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(200,255,0,0.2)]"
      >
        {plan.cta}
      </Link>
      <p className="text-white/25 text-xs">ДДС включен · Без скрити такси · Сигурно плащане</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl overflow-hidden border transition-colors duration-200 ${
        open ? "border-[#c8ff00]/30 bg-[#c8ff00]/5" : "border-white/10 bg-transparent hover:border-white/20"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
      >
        <span className={`font-medium text-base transition-colors ${open ? "text-white" : "text-white/80"}`}>{q}</span>
        <span
          className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[#c8ff00] flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "200px" : "0px" }}
      >
        <div className="px-6 pb-5 text-white/50 text-sm leading-relaxed border-t border-white/10 pt-4">
          {a}
        </div>
      </div>
    </div>
  );
}

const testimonials = [
  {
    name: "Мартин Г.",
    role: "Freelance creator → Vekto team",
    photo: "", // добави /images/martin.jpg
    text: "За 3 седмици направих първото си AI видео за клиент. Без Academy нямаше да знам откъде да започна.",
  },
  {
    name: "Ивана К.",
    role: "Social media → Vekto team",
    photo: "", // добави /images/ivana.jpg
    text: "Обучението е различно от всичко което съм гледала. Реални примери, реални инструменти, реален feedback.",
  },
  {
    name: "Стефан Д.",
    role: "Видео оператор → Vekto team",
    photo: "", // добави /images/stefan.jpg
    text: "Минах от традиционно видео към AI за месец. Вече получавам проекти от Vekto. Инвестицията се върна 4 пъти.",
  },
];

const clients = [
  { name: "ISOSPORT", logo: "/logo-isosport.png", circular: false },
  { name: "MEN'S CARE", logo: "/logo-menscare.png", circular: true },
  { name: "KRISTA G", logo: "/logo-krista-g-2022.png", circular: false },
  { name: "GIFTO", logo: "/logo-gifto2.png", circular: false },
  { name: "ADVENTURES BG", logo: "/logo-adventuresbg.png", circular: false },
];

const features = [
  {
    icon: "🎬",
    title: "Видео обучение",
    desc: "Структурирани модули директно в платформата — гледаш, учиш и практикуваш без да излизаш навсякъде.",
  },
  {
    icon: "💬",
    title: "Общност & чат",
    desc: "Real-time чат с всички членове в платформата. Задаваш въпрос — получаваш отговор в минути.",
  },
  {
    icon: "📅",
    title: "Weekly Q&A",
    desc: "Всяка седмица live сесия с екипа на Vekto — директно в платформата, без Zoom линкове.",
  },
  {
    icon: "💼",
    title: "Работа",
    desc: "Реални платени проекти от Vekto Agency — получаваш brief директно в профила си.",
  },
  {
    icon: "🛠️",
    title: "Templates & Assets",
    desc: "Промпти, workflow шаблони и asset пакети от реални проекти — свалими с един клик.",
  },
  {
    icon: "🔄",
    title: "Постоянни ъпдейти",
    desc: "Платформата расте с теб — нови уроци и ресурси всяка седмица, автоматично в акаунта ти.",
  },
];

const faq = [
  {
    q: "Трябва ли ми опит с AI или видео?",
    a: "Не. Обучението е структурирано от нулата. Единственото което трябва е желание да учиш и компютър.",
  },
  {
    q: "Как реално мога да стана част от Vekto екипа?",
    a: "Завършваш модулите, предаваш тестов проект и ако качеството е на ниво — влизаш в пула за платени проекти. Нямаме гаранция, но активните членове получават реални задачи от нашите клиенти.",
  },
  {
    q: "Защо има структура по месеци — не е ли по-добре да имам всичко веднага?",
    a: "Структурираната прогресия работи по-добре от информационен хаос. Основите първо, после состезателна практика в Арена, после реални задачи и портфолио. Ако искаш всичко отворено от ден 1 — вземи Доживотен достъп и работи по свой темп.",
  },
  {
    q: "Какво точно има в първия месец?",
    a: "Фундаменталните модули: AI инструменти, prompting, workflow-и, първи практически задания и достъп до общността с Weekly Q&A. Достатъчно за да завършиш реални проекти и да влезеш в Арена с увереност.",
  },
  {
    q: "Какво е Арена и как работи?",
    a: "Арена е мястото за седмични challenges — реални задачи със срокове, където получаваш ревю от Vekto екипа и се сравняваш с други членове. Изграждаш рефлекс, портфолио и репутация преди да те свържем с платени клиенти.",
  },
  {
    q: "Какво точно включва обучението?",
    a: "Видео модули за AI инструменти, workflow-и, prompting и производство на съдържание. Всичко е базирано на реални проекти на Vekto — не теория.",
  },
  {
    q: "Колко време трябва да отделям?",
    a: "Няма минимум. Колкото повече отделяш, толкова по-добър ставаш и толкова по-голям шанс имаш да получиш реална работа от нас.",
  },
  {
    q: "Мога ли да отменя абонамента?",
    a: "Да, по всяко време. При месечния план спираш преди следващото плащане. При доживотния достъп — достъпът остава завинаги без допълнителни такси.",
  },
  {
    q: "Офертата за доживотен достъп завинаги ли важи?",
    a: "Не. €349 е стартова цена валидна само до 1 юни 2026. След това цената се вдига, а еднократната оферта изчезва.",
  },
  {
    q: "Защо €349 изглежда евтино в сравнение с €708/год?",
    a: "€708 е реалната годишна цена на месечния план (€59 × 12). Доживотният достъп за €349 е под половин година месечни плащания — после е чиста печалба. €349 = €1.15 на ден първата година, по-малко от едно кафе.",
  },
  {
    q: "На какъв език е обучението?",
    a: "Български. Всички модули, чатът и Q&A сесиите са на български.",
  },
];
