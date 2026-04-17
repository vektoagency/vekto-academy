"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createCheckout } from "./actions/checkout";

type BriefTier = "premium" | "standard" | "quick";
type Brief = {
  id: string;
  tier: BriefTier;
  client: string;
  title: string;
  budget: number;
  deadline: string;
  format: string;
  brief: string;
};

const arenaBriefs: Brief[] = [
  // Premium — 5 × €50 = €250
  { id: "01", tier: "premium", client: "Tech SaaS", title: "Product Launch — AI Tool", budget: 50, deadline: "4 дни", format: "16:9", brief: "UGC видео представящо нов AI продукт. Benefit-driven, 20-30 секунди, 3 варианта за A/B тест." },
  { id: "02", tier: "premium", client: "Fashion Brand", title: "Summer Hero Campaign", budget: 50, deadline: "5 дни", format: "9:16 + 1:1", brief: "Hero видео за летен лукс-дроп. Cinematic feel, slow-mo moments, professional color grade." },
  { id: "03", tier: "premium", client: "B2B Startup", title: "Explainer — SaaS Platform", budget: 50, deadline: "6 дни", format: "16:9", brief: "45-60 сек explainer с английски voiceover. Ясен скрипт, професионален feel, product shots." },
  { id: "04", tier: "premium", client: "Crypto Project", title: "Token Launch Teaser", budget: 50, deadline: "3 дни", format: "16:9 + 9:16", brief: "Teaser за token launch. High-energy edit, modern VFX, countdown elements, 15-30 сек." },
  { id: "05", tier: "premium", client: "E-commerce", title: "Black Friday Hero", budget: 50, deadline: "5 дни", format: "9:16", brief: "Кампания за Black Friday sale. Product-centric, динамични cuts, ясен price reveal." },

  // Standard — 10 × €20 = €200
  { id: "06", tier: "standard", client: "F&B", title: "Restaurant Quick Promo", budget: 20, deadline: "3 дни", format: "9:16", brief: "Food shots, апетитни ъгли, music-driven. 15-20 сек TikTok-ready." },
  { id: "07", tier: "standard", client: "Beauty Brand", title: "Skincare UGC", budget: 20, deadline: "4 дни", format: "9:16", brief: "UGC-style преди/след, close-up texture shots. Authentic feel, не pro-commercial." },
  { id: "08", tier: "standard", client: "Fitness Studio", title: "Gym Reel Highlight", budget: 20, deadline: "3 дни", format: "9:16", brief: "Highlight reel от тренировки. Energetic cuts, beat-synced, 20 сек." },
  { id: "09", tier: "standard", client: "Travel Agency", title: "Destination Teaser", budget: 20, deadline: "5 дни", format: "16:9", brief: "30 сек teaser за дестинация. Breathtaking visuals, music-led, subtle brand integration." },
  { id: "10", tier: "standard", client: "Real Estate", title: "Property Tour Cut", budget: 20, deadline: "4 дни", format: "16:9", brief: "Tour montage на имот. Smooth transitions, lifestyle shots, 45 сек." },
  { id: "11", tier: "standard", client: "Music Label", title: "Artist Promo Clip", budget: 20, deadline: "3 дни", format: "9:16", brief: "Promo clip за нов сингъл. Snippet + artist shots, beat-synced, 15 сек." },
  { id: "12", tier: "standard", client: "Fashion", title: "Outfit Transition", budget: 20, deadline: "2 дни", format: "9:16", brief: "Outfit transition видео — 3-4 looks, smooth match-cuts, trending audio." },
  { id: "13", tier: "standard", client: "Auto Dealer", title: "Car Review Edit", budget: 20, deadline: "4 дни", format: "16:9", brief: "Review edit от съществуващи footage. Ясни feature callouts, 60 сек." },
  { id: "14", tier: "standard", client: "Gaming", title: "Trailer Highlight", budget: 20, deadline: "3 дни", format: "16:9", brief: "Gameplay highlight trailer. Epic music, quick cuts, logo reveal." },
  { id: "15", tier: "standard", client: "EdTech", title: "Course Promo", budget: 20, deadline: "4 дни", format: "9:16", brief: "Promo за онлайн курс. Benefit hooks, student testimonial feel, CTA endcard." },

  // Quick — 5 × €10 = €50
  { id: "16", tier: "quick", client: "Local Biz", title: "Event Recap", budget: 10, deadline: "2 дни", format: "9:16", brief: "15 сек recap от събитие. Highlights only, caption overlays." },
  { id: "17", tier: "quick", client: "Influencer", title: "Story Cut", budget: 10, deadline: "1 ден", format: "9:16", brief: "Story montage от raw footage. Minimal cuts, vibe-driven." },
  { id: "18", tier: "quick", client: "Podcast", title: "Clip Highlight", budget: 10, deadline: "2 дни", format: "16:9 + 9:16", brief: "30 сек клип от подкаст епизод. Captions, branded frame." },
  { id: "19", tier: "quick", client: "Local Ad", title: "Ad Remix", budget: 10, deadline: "1 ден", format: "1:1", brief: "Ремикс на стар реклама. Свежи cuts, нова музика, 15 сек." },
  { id: "20", tier: "quick", client: "Creator", title: "Trend Flip", budget: 10, deadline: "1 ден", format: "9:16", brief: "Trend video с flip на концепта. Trending audio, sharp hook." },
];

const tierMeta: Record<BriefTier, { label: string; color: string; dot: string }> = {
  premium: { label: "Premium", color: "text-[#c8ff00]", dot: "bg-[#c8ff00]" },
  standard: { label: "Standard", color: "text-white", dot: "bg-white/70" },
  quick: { label: "Quick", color: "text-white/60", dot: "bg-white/30" },
};

const navLinks = [
  { href: "#about", label: "За нас" },
  { href: "#curriculum", label: "Програма" },
  { href: "#community", label: "Общност" },
  { href: "#arena", label: "Арена" },
  { href: "#jobs", label: "Работа" },
  { href: "#pricing", label: "Цени" },
  { href: "#faq", label: "FAQ" },
];

const curriculumModules = [
  {
    n: "00",
    emoji: "🚀",
    title: "Старт",
    subtitle: "Онбординг и setup",
    lessons: 5,
    duration: "45 мин",
    topics: [
      "Добре дошъл — какво те очаква в Academy",
      "Как работи платформата и общността",
      "Setup на работна среда и инструменти",
      "Community правила и как да получаваш помощ",
      "Първи стъпки към Арена",
    ],
  },
  {
    n: "01",
    emoji: "🧠",
    title: "Майндсет",
    subtitle: "Мислене като AI creator",
    lessons: 8,
    duration: "2 часа",
    topics: [
      "Защо AI видео е различно от традиционното",
      "От идея до финален клип — mental model",
      "Как да мислиш като creative director",
      "Workflow принципи на Vekto",
      "Ограничения на AI и как да ги преодолееш",
      "Creative iteration — кога да спреш",
      "Референции и вдъхновение",
      "Критическа оценка на своя работа",
    ],
  },
  {
    n: "02",
    emoji: "🎯",
    title: "Стратегия",
    subtitle: "Планиране и концепция",
    lessons: 10,
    duration: "3 часа",
    topics: [
      "Разчитане на brief — какво иска клиентът",
      "Conceptual planning и proposals",
      "Moodboards и visual references",
      "Storytelling с AI ограничения",
      "Структура на short-form видео",
      "Hook-ове и first 3 seconds",
      "Sound-first vs visual-first подход",
      "Timeline и production planning",
      "Budget estimation",
      "Client-ready презентация",
    ],
  },
  {
    n: "03",
    emoji: "🛠️",
    title: "Инструменти",
    subtitle: "AI stack — от A до Я",
    lessons: 12,
    duration: "4 часа",
    topics: [
      "Runway Gen-3 & Gen-4 — advanced workflows",
      "Kling AI — motion и camera control",
      "Higgsfield DoP — cinematic shots",
      "Hedra — lip sync и talking avatars",
      "Arcads — UGC AI actors",
      "Midjourney & Flux — image generation",
      "ElevenLabs & Suno — voice и music",
      "Topaz — upscaling и frame interpolation",
      "Промптинг — advanced techniques",
      "Character consistency между shots",
      "Style transfer и look-dev",
      "VFX plates и compositing",
    ],
  },
  {
    n: "04",
    emoji: "⭐",
    title: "Playbooks",
    subtitle: "Готови workflow-и за 10+ формата",
    lessons: 12,
    duration: "5 часа",
    topics: [
      "UGC ad workflow — от brief до final",
      "Product launch hero — premium feel",
      "Explainer video pipeline",
      "Fashion & beauty — cinematic aesthetics",
      "Music video workflow",
      "Restaurant / F&B promo",
      "Real estate property tour",
      "SaaS demo video",
      "Social media ads — формат-специфично",
      "Podcast & interview clips",
      "Trailer & teaser structure",
      "Personal brand content",
    ],
  },
  {
    n: "05",
    emoji: "✂️",
    title: "Монтаж",
    subtitle: "Post-production на AI content",
    lessons: 12,
    duration: "4 часа",
    topics: [
      "Premiere Pro / DaVinci Resolve basics",
      "Color grading за AI content",
      "Работа с нестандартни framerate-и",
      "Sound design и music integration",
      "Pacing, rhythm и emotional beats",
      "Motion graphics и typography",
      "Transitions и cuts",
      "Compositing с AI generations",
      "Audio cleanup и ducking",
      "Stabilization и interpolation",
      "Export settings за всеки формат",
      "Deliverables structure",
    ],
  },
  {
    n: "06",
    emoji: "💼",
    title: "Клиенти",
    subtitle: "Бизнес страната на работата",
    lessons: 10,
    duration: "3 часа",
    topics: [
      "Как да намериш първи клиент",
      "Pricing — оценка на работата си",
      "Pitch и proposals на английски",
      "Contracts и deposits",
      "Brief management и expectations",
      "Revisions — колко, кога, защо",
      "Delivery workflow",
      "Long-term client relationships",
      "Portfolio и reputation building",
      "Scaling — от freelance до агенция",
    ],
  },
];

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#080808]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/vekto-logo.png" alt="Vekto Academy" className="h-10 sm:h-28 w-auto" />

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
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/sign-in" className="text-sm text-white/40 hover:text-white transition-colors hidden md:block">Влез</Link>
          <Link href="/sign-up" className="text-xs sm:text-sm bg-[#c8ff00] text-black font-bold px-4 sm:px-5 py-2 rounded-full hover:bg-[#d4ff1a] transition-colors">
            Започни
          </Link>
          {/* Hamburger — 44px tap target */}
          <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-1.5 p-2 -mr-2" aria-label="Меню">
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
        <div className="p-3 sm:p-4 h-52 sm:h-64 grid grid-cols-5 gap-2 sm:gap-3 overflow-hidden">
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
        <div className="p-3 sm:p-4 h-52 sm:h-64 grid grid-cols-5 gap-2 sm:gap-3 overflow-hidden">
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
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {platformTabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActive(i)}
              className={`px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${active === i ? "bg-[#c8ff00] text-black" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"}`}
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

function CommunitySection() {
  const benefits = [
    { icon: "💬", title: "Real-time чат", desc: "Без Discord, без Telegram. Каналите са вградени в платформата — задаваш въпрос, получаваш отговор в минути." },
    { icon: "📅", title: "Weekly Q&A на живо", desc: "Всяка седмица live сесия с Vekto екипа. Донасяш проект — получаваш директна обратна връзка." },
    { icon: "👥", title: "Peer review", desc: "Качваш проект преди submit — получаваш feedback от други creators. По-добри шансове в Арена." },
    { icon: "🎯", title: "Директен достъп до Vekto", desc: "Екипът участва в разговорите активно. Не си сам пред AI инструмент — имаш хора зад гърба си." },
  ];

  return (
    <section id="community" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#080808] border-b border-white/10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-3 block">Общност</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
              Не си сам.<br />
              <span className="text-[#c8ff00]">Общност, която гради.</span>
            </h2>
            <p className="text-white/50 text-sm sm:text-base max-w-sm">
              Разлика от YouTube видеа: тук питаш в chat и получаваш отговор. Vekto екипът е вътре всеки ден.
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[
            { v: "24/7", l: "Real-time chat" },
            { v: "52", l: "Q&A сесии/год" },
            { v: "< 30 мин", l: "Средно време за отговор" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-white/10 bg-[#0e0e0e] p-3 sm:p-5">
              <p className="text-[#c8ff00] font-black text-xl sm:text-3xl leading-none">{s.v}</p>
              <p className="text-white/40 text-[10px] sm:text-xs mt-1.5 sm:mt-2 uppercase tracking-widest leading-snug">{s.l}</p>
            </div>
          ))}
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-8">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-7 hover:border-[#c8ff00]/25 hover:bg-[#c8ff00]/[0.02] transition-colors">
              <div className="text-2xl sm:text-3xl mb-3">{b.icon}</div>
              <h3 className="font-black text-base sm:text-lg mb-2">{b.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center">
          <Link href="#pricing" className="bg-[#c8ff00] text-black font-black px-7 py-3.5 rounded-full text-sm text-center hover:bg-[#d4ff1a] transition-colors">
            Влез в общността →
          </Link>
          <p className="text-white/40 text-xs text-center">Отключено от ден 1 — месечен или Доживотен достъп</p>
        </div>
      </div>
    </section>
  );
}

function JobPipelineSection() {
  const stages = [
    {
      n: "01",
      label: "Shortlist",
      title: "Попадаш в радара",
      entry: "3+ Premium победи в Арена",
      pay: "€50-150/мес",
      desc: "Vekto преглежда твоя профил и те добавя в shortlist-а за реални клиентски проекти извън Арена.",
    },
    {
      n: "02",
      label: "Freelance",
      title: "Първи клиентски brief-ове",
      entry: "Одобрение от shortlist",
      pay: "€200-800/brief",
      desc: "Директно се включваш в реални Vekto проекти — работиш по brief-ове от истински клиенти със стандартни агенционни бюджети.",
    },
    {
      n: "03",
      label: "Contractor",
      title: "Постоянен приход",
      entry: "3+ успешни brief-а",
      pay: "€1k-3k/мес",
      desc: "Vekto те задържа като regular contractor. Получаваш постоянен поток от задачи, предвидим приход.",
    },
    {
      n: "04",
      label: "Team",
      title: "Част от Vekto",
      entry: "Top 5% + fit с екипа",
      pay: "Заплата + бонуси",
      desc: "Влизаш постоянно в екипа на Vekto. Full-time или strategic partner — работиш с реални brand-ове в production.",
      highlight: true,
    },
  ];

  return (
    <section id="jobs" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#c8ff00]/3 rounded-full blur-[140px]" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 sm:mb-16">
          <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-3 block">Работа · Pipeline</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-5">
            От Академия до<br />
            <span className="text-[#c8ff00]">Vekto екип.</span>
          </h2>
          <p className="text-white/50 text-sm sm:text-base max-w-xl leading-relaxed">
            Реалният път, по който creators в общността минават — от първи Premium победи до постоянна работа с Vekto.
          </p>
        </div>

        {/* 4-stage pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 mb-10 relative">
          {stages.map((s, i) => (
            <div key={s.n} className="relative">
              <div className={`rounded-2xl p-5 sm:p-6 h-full flex flex-col ${s.highlight ? "bg-[#c8ff00]/[0.06] border-2 border-[#c8ff00]/40 shadow-[0_0_40px_rgba(200,255,0,0.08)]" : "bg-[#0d0d0d] border border-white/10"}`}>
                {s.highlight && (
                  <span className="absolute -top-3 left-5 bg-[#c8ff00] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Целта</span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border ${s.highlight ? "bg-[#c8ff00] text-black border-[#c8ff00]" : "bg-white/5 text-[#c8ff00] border-white/10"}`}>
                    {s.n}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${s.highlight ? "text-[#c8ff00]" : "text-white/40"}`}>
                    {s.label}
                  </span>
                </div>
                <h3 className="font-black text-lg mb-3 leading-tight">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5 flex-1">{s.desc}</p>
                <div className="space-y-2.5 pt-4 border-t border-white/10 mt-auto">
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Условие</p>
                    <p className="text-white/70 text-xs font-semibold">{s.entry}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Приход</p>
                    <p className={`text-sm font-black ${s.highlight ? "text-[#c8ff00]" : "text-white"}`}>{s.pay}</p>
                  </div>
                </div>
              </div>
              {/* Arrow connector — desktop only */}
              {i < stages.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10 items-center justify-center w-6 h-6 rounded-full bg-[#080808] border border-white/10 text-[#c8ff00] text-xs">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reality check note */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-6 mb-8 flex items-start gap-4">
          <span className="w-10 h-10 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/30 flex items-center justify-center text-[#c8ff00] text-lg flex-shrink-0">!</span>
          <div>
            <p className="font-black text-sm mb-1">Без гаранции — но пътят е ясен</p>
            <p className="text-white/50 text-sm leading-relaxed">
              Не обещаваме работа на всеки. Но който се доказва в Арена — Vekto го вижда. Премеждаването между етапите зависи от качеството на работата ти, не от време прекарано в платформата.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center">
          <Link href="#pricing" className="bg-[#c8ff00] text-black font-black px-8 py-4 rounded-full text-sm sm:text-base text-center hover:bg-[#d4ff1a] transition-colors shadow-[0_0_40px_rgba(200,255,0,0.2)]">
            Започни пътя си →
          </Link>
          <p className="text-white/40 text-xs sm:text-sm text-center">Стартираш с обучението. Етап 01 е на 2-3 месеца разстояние.</p>
        </div>
      </div>
    </section>
  );
}

function CurriculumSection() {
  const [open, setOpen] = useState<number | null>(0);

  const totalLessons = curriculumModules.reduce((s, m) => s + m.lessons, 0);

  return (
    <section id="curriculum" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0a0a0a] border-y border-white/10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-3 block">Учебна програма</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
              {curriculumModules.length} модула.<br />
              <span className="text-white/40">{totalLessons} урока. 22 часа.</span>
            </h2>
            <p className="text-white/50 text-sm sm:text-base max-w-sm">
              Структурирано съдържание от реална практика. Всичко, което научаваш, е тествано на реални клиенти на Vekto — без теория.
            </p>
          </div>
        </div>

        {/* Module accordion */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden">
          {curriculumModules.map((m, i) => {
            const isOpen = open === i;
            return (
              <div key={m.n} className={`${i > 0 ? "border-t border-white/10" : ""} ${isOpen ? "bg-[#c8ff00]/[0.03]" : ""} transition-colors`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3 sm:gap-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border transition-colors ${isOpen ? "bg-[#c8ff00] text-black border-[#c8ff00]" : "bg-white/5 text-white/40 border-white/10"}`}>
                      {m.n}
                    </span>
                    <span className="text-xl sm:text-2xl">{m.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm sm:text-lg truncate">{m.title}</p>
                    <p className="text-white/40 text-[11px] sm:text-sm truncate">{m.subtitle}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-xs text-white/40 flex-shrink-0">
                    <span><span className="text-white/80 font-bold">{m.lessons}</span> урока</span>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="text-white/80 font-bold">{m.duration}</span>
                  </div>
                  <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 text-lg ${isOpen ? "border-[#c8ff00] text-[#c8ff00] rotate-45" : "border-white/20 text-white/40"}`}>
                    +
                  </span>
                </button>

                {/* Content */}
                <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "800px" : "0px" }}>
                  <div className="px-4 sm:px-6 pb-5 sm:pb-8 pl-[72px] sm:pl-[104px]">
                    <div className="flex md:hidden gap-3 text-[11px] text-white/40 mb-4">
                      <span><span className="text-white/80 font-bold">{m.lessons}</span> урока</span>
                      <span>·</span>
                      <span className="text-white/80 font-bold">{m.duration}</span>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 sm:gap-y-2.5">
                      {m.topics.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-[13px] sm:text-sm text-white/70">
                          <span className="text-[#c8ff00] mt-0.5 flex-shrink-0">✓</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { v: `${totalLessons}`, l: "урока" },
            { v: "22", l: "часа" },
            { v: `${curriculumModules.length}`, l: "модула" },
            { v: "∞", l: "достъп" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-white/10 p-3 sm:p-4 bg-[#0a0a0a]">
              <p className="text-[#c8ff00] font-black text-xl sm:text-2xl leading-none">{s.v}</p>
              <p className="text-white/40 text-[10px] sm:text-xs mt-1.5 uppercase tracking-widest">{s.l}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-white/40 text-xs sm:text-sm mt-6 max-w-2xl mx-auto">
          Нови уроци всяка седмица. Когато излезе нов AI инструмент, го добавяме. <span className="text-white">С Доживотен достъп получаваш всички бъдещи модули без допълнително плащане.</span>
        </p>
      </div>
    </section>
  );
}

function ArenaSection() {
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState<"all" | BriefTier>("all");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visibleBriefs = filter === "all" ? arenaBriefs : arenaBriefs.filter((b) => b.tier === filter);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % arenaBriefs.length);
    }, 2500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function handleClick(index: number) {
    setActive(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  const b = arenaBriefs[active];
  const totalPool = arenaBriefs.reduce((s, x) => s + x.budget, 0);
  const tierCounts = {
    all: arenaBriefs.length,
    premium: arenaBriefs.filter((x) => x.tier === "premium").length,
    standard: arenaBriefs.filter((x) => x.tier === "standard").length,
    quick: arenaBriefs.filter((x) => x.tier === "quick").length,
  };

  return (
    <section id="arena" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#c8ff00]/3 rounded-full blur-[140px]" />
      </div>
      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-4 block">Арена · Уникалното</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6 sm:mb-8">
            Плащаш да учиш.<br />
            <span className="text-[#c8ff00]">Ние ти плащаме.</span>
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-10">
            <div className="flex items-baseline gap-2 sm:gap-3 leading-none">
              <span className="text-white/20 text-sm sm:text-base font-semibold">+</span>
              <span className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight drop-shadow-[0_0_40px_rgba(200,255,0,0.15)]">€500</span>
              <span className="text-white/40 text-xs sm:text-sm uppercase tracking-widest font-semibold">/мес</span>
            </div>
            <p className="text-white/50 text-sm sm:text-base max-w-md leading-relaxed sm:pb-2">
              <span className="text-white font-semibold">20 реални платени задачи всеки месец.</span> Предаваш видео, получаваш ревю от Vekto, най-добрите печелят.
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[
            { v: "20", l: "задачи/месец" },
            { v: "€500", l: "пул/месец" },
            { v: "∞", l: "опити/участник" },
          ].map((stat) => (
            <div key={stat.l} className="rounded-xl border border-white/10 bg-[#0e0e0e] p-3 sm:p-5">
              <p className="text-[#c8ff00] font-black text-2xl sm:text-3xl leading-none">{stat.v}</p>
              <p className="text-white/40 text-[10px] sm:text-xs mt-1.5 sm:mt-2 uppercase tracking-widest">{stat.l}</p>
            </div>
          ))}
        </div>

        {/* Месечен Drop */}
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0e0e0e] overflow-hidden">

          {/* Header bar */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#111] border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00] animate-pulse flex-shrink-0" />
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/80 truncate">
                Месечен Drop · {tierCounts.all} задачи
              </p>
            </div>
            <p className="text-[10px] sm:text-xs text-white/30 flex-shrink-0">
              Общо: <span className="text-[#c8ff00] font-bold">€{totalPool}</span>
            </p>
          </div>

          {/* Tier filter */}
          <div className="flex gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 overflow-x-auto">
            {([
              { id: "all", label: "Всички", count: tierCounts.all, color: "bg-[#c8ff00]/15 text-[#c8ff00]" },
              { id: "premium", label: "Premium €50", count: tierCounts.premium, color: "bg-[#c8ff00]/10 text-[#c8ff00]" },
              { id: "standard", label: "Standard €20", count: tierCounts.standard, color: "bg-white/10 text-white" },
              { id: "quick", label: "Quick €10", count: tierCounts.quick, color: "bg-white/5 text-white/70" },
            ] as const).map((t) => {
              const isSel = filter === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`flex-shrink-0 rounded-full px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border ${isSel ? `${t.color} border-current` : "bg-white/[0.02] text-white/40 border-white/10 hover:text-white/70"}`}
                >
                  {t.label} <span className="opacity-50 ml-1">· {t.count}</span>
                </button>
              );
            })}
          </div>

          {/* 20 brief grid */}
          <div className="p-3 sm:p-5 border-b border-white/10">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-1.5 sm:gap-2">
              {arenaBriefs.map((brief, i) => {
                const isActive = active === i;
                const visible = filter === "all" || brief.tier === filter;
                const tm = tierMeta[brief.tier];
                return (
                  <button
                    key={brief.id}
                    onClick={() => handleClick(i)}
                    className={`relative aspect-square rounded-lg border transition-all duration-300 flex flex-col items-center justify-center gap-0.5 ${
                      isActive
                        ? "border-[#c8ff00] bg-[#c8ff00]/10 scale-105 shadow-[0_0_20px_rgba(200,255,0,0.25)] z-10"
                        : visible
                          ? "border-white/10 bg-[#0a0a0a] hover:border-white/25 hover:bg-white/[0.03]"
                          : "border-white/5 bg-[#0a0a0a]/50 opacity-25"
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full ${tm.dot} absolute top-1.5 right-1.5`} />
                    <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest ${isActive ? "text-[#c8ff00]" : "text-white/25"}`}>
                      #{brief.id}
                    </span>
                    <span className={`font-black text-[11px] sm:text-sm leading-none ${isActive ? "text-white" : "text-white/60"}`}>
                      €{brief.budget}
                    </span>
                  </button>
                );
              })}
            </div>
            {visibleBriefs.length < arenaBriefs.length && (
              <p className="text-white/30 text-[10px] sm:text-xs mt-3 text-center">
                Показани {visibleBriefs.length} от {arenaBriefs.length}
              </p>
            )}
          </div>

          {/* Active brief detail */}
          <div className="p-5 sm:p-8 md:p-10" key={active}>
            <div className="flex items-center gap-2 mb-3 animate-[fadeIn_0.3s_ease] flex-wrap">
              <span className="text-[#c8ff00]/70 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Brief #{b.id}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${tierMeta[b.tier].color}`}>
                {tierMeta[b.tier].label}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-white/30 text-[10px] sm:text-xs uppercase tracking-wider">{b.client}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 animate-[fadeIn_0.3s_ease] tracking-tight leading-tight">{b.title}</h3>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-2xl mb-6 animate-[fadeIn_0.35s_ease]">{b.brief}</p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 animate-[fadeIn_0.4s_ease]">
              {[
                { l: "Награда", v: `€${b.budget}`, accent: true },
                { l: "Deadline", v: b.deadline },
                { l: "Формат", v: b.format },
              ].map((m) => (
                <div key={m.l} className={`rounded-lg border p-2.5 sm:p-3 ${m.accent ? "border-[#c8ff00]/30 bg-[#c8ff00]/5" : "border-white/10 bg-[#0a0a0a]"}`}>
                  <p className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-widest mb-1">{m.l}</p>
                  <p className={`font-black text-sm sm:text-base ${m.accent ? "text-[#c8ff00]" : "text-white"}`}>{m.v}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center animate-[fadeIn_0.45s_ease]">
              <Link href="/sign-up" className="bg-[#c8ff00] text-black font-black px-6 py-3 rounded-full text-sm text-center hover:bg-[#d4ff1a] transition-colors">
                Участвай в Арена →
              </Link>
              <p className="text-white/40 text-xs text-center sm:text-left">Отключваш с активен план · Неограничени опити</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#c8ff00]/30 bg-[#c8ff00]/[0.06] p-5 flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-[#c8ff00] text-black font-black text-xs flex items-center justify-center flex-shrink-0">02</span>
            <div>
              <p className="text-[#c8ff00] text-[10px] font-bold uppercase tracking-widest mb-1">Арена стартира от месец 2</p>
              <p className="text-white/60 text-sm leading-relaxed">Месец 1 изграждаш основите. От месец 2 имаш достъп до всички €500 в Арена. С Доживотен достъп — отворено от ден 1.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-[#c8ff00] font-black text-sm flex items-center justify-center flex-shrink-0">€</span>
            <div>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">Плащания директно от Vekto</p>
              <p className="text-white/50 text-sm leading-relaxed">Наградите се превеждат след одобрение на проекта. Най-добрите участници получават дългосрочни Vekto задачи и стават част от екипа.</p>
            </div>
          </div>
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

      {/* Hero — compact, fits above fold */}
      <section className="relative flex flex-col items-center text-center px-4 sm:px-5 pt-16 sm:pt-24 pb-8 sm:pb-12">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c8ff00]/4 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#c8ff00]/6 rounded-full blur-[80px]" />
        </div>

        {/* Promo banner — Lifetime offer */}
        <div className="hero-reveal inline-flex items-center gap-1.5 sm:gap-3 bg-[#c8ff00] text-black rounded-full px-3 sm:px-4 py-1.5 mb-4 sm:mb-5 relative z-10 shadow-[0_0_30px_rgba(200,255,0,0.25)] max-w-full" style={{ animationDelay: "0ms" }}>
          <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <span>⚡</span>
            <span>Доживотен за €349</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-black/30" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">До 1 юни</span>
        </div>

        {/* Headline — compact, animated */}
        <h1 className="font-display relative z-10 mb-4 flex flex-col items-center font-extrabold tracking-[-0.03em] leading-[0.95] max-w-full">
          {/* Line 1 */}
          <span
            className="hero-reveal block text-[2rem] sm:text-5xl md:text-[4.5rem] text-white"
            style={{ animationDelay: "100ms" }}
          >
            От <span className="italic font-light text-white/70">AI видео</span>
          </span>

          {/* Animated connector arrow */}
          <svg
            className="hero-arrow my-1 sm:my-2 w-5 h-5 sm:w-8 sm:h-8 text-[#c8ff00] drop-shadow-[0_0_16px_rgba(200,255,0,0.5)]"
            viewBox="0 0 40 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animationDelay: "500ms" }}
          >
            <path d="M20 5 L20 50 M8 38 L20 50 L32 38" style={{ animationDelay: "500ms" }} />
          </svg>

          {/* Line 2 — with sheen */}
          <span
            className="hero-reveal block text-[2rem] sm:text-5xl md:text-[4.5rem] drop-shadow-[0_0_60px_rgba(200,255,0,0.3)]"
            style={{ animationDelay: "750ms" }}
          >
            <span className="hero-sheen">първия ти клиент.</span>
          </span>
        </h1>

        <p className="hero-reveal text-white/50 text-[13px] sm:text-base max-w-xl mb-5 sm:mb-6 relative z-10 leading-relaxed text-center" style={{ animationDelay: "950ms" }}>
          3 месеца структурирано обучение. Работиш по реални задачи с възнаграждение. Наемаме най-добрите.
        </p>

        {/* CTA with plan toggle */}
        <div className="hero-reveal w-full flex justify-center" style={{ animationDelay: "1100ms" }}>
          <PricingToggle />
        </div>

        {/* Social proof */}
        <div className="hero-reveal flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-white/30 relative z-10" style={{ animationDelay: "1300ms" }}>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00]" />
            <span>Early access отворен</span>
          </div>
          <span className="text-white/10 hidden sm:block">|</span>
          <div className="flex items-center gap-1">
            <span className="text-[#c8ff00]">★★★★★</span>
            <span>4.9 рейтинг</span>
          </div>
          <span className="text-white/10 hidden sm:block">|</span>
          <div className="flex items-center gap-1">
            <span className="text-[#c8ff00]">✓</span>
            <span>Реална агенция зад обучението</span>
          </div>
        </div>
      </section>

      {/* Hero video — separate section below hero */}
      <section className="relative px-4 sm:px-5 pb-12 sm:pb-20">
        <div className="relative w-full max-w-4xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
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


      {/* Instructor — moved up: trust anchor right after client logos */}
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

      {/* Path — 3-month journey preview */}
      <section id="path" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0a0a0a] border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#c8ff00] text-sm font-semibold uppercase tracking-widest mb-3 block">Твоят път</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-4">3 месеца до първия клиент</h2>
            <p className="text-white/50 text-sm sm:text-base max-w-2xl mx-auto">Структурирана прогресия — всеки етап надгражда предишния и те води към реална работа.</p>
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
              <p className="text-white/60 text-sm mb-5">Влизаш в месечните brief-ове. Печелиш първите си пари докато учиш и изграждаш портфолио.</p>
              <ul className="space-y-2 text-sm text-white/70 mt-auto">
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>20 платени brief-а/мес</li>
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
              <h3 className="text-xl font-black mb-2">Shortlist + Vekto</h3>
              <p className="text-white/70 text-sm mb-5">Изграждаш професионално портфолио и влизаш в shortlist за реални клиентски задачи от Vekto.</p>
              <ul className="space-y-2 text-sm text-white/80 mt-auto">
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Професионално портфолио</li>
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Freelance brief-ове €200-800</li>
                <li className="flex items-start gap-2"><span className="text-[#c8ff00] mt-0.5">✓</span>Pipeline към Vekto екип</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-white/40 text-xs sm:text-sm mt-10 max-w-2xl mx-auto">
            С <span className="text-[#c8ff00] font-semibold">Доживотен достъп</span> получаваш цялата структура отворена от ден 1 — можеш да прескачаш напред, да се връщаш и да работиш по свой темп.
          </p>
        </div>
      </section>

      {/* Curriculum — Месец 1: обучението */}
      <CurriculumSection />

      {/* Community — support veднага след обучението */}
      <CommunitySection />

      {/* Arena — Месец 2: плащат ти докато учиш */}
      <ArenaSection />

      {/* Job Pipeline — Месец 3+: shortlist → Vekto екип */}
      <JobPipelineSection />

      {/* Platform preview — tour of the product */}
      <PlatformPreview />

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
                {p.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-black text-[#c8ff00]"
                      : "bg-[#c8ff00]/15 text-[#c8ff00] border border-[#c8ff00]/30"
                  }`}>
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
      <form action={createCheckout.bind(null, selected as "monthly" | "lifetime")} className="w-full">
        <button
          type="submit"
          className="w-full text-center bg-[#c8ff00] text-black font-bold px-8 py-4 rounded-full text-base hover:bg-[#d4ff1a] hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(200,255,0,0.2)]"
        >
          {plan.cta}
        </button>
      </form>
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
        style={{ maxHeight: open ? "500px" : "0px" }}
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

const faq = [
  {
    q: "Трябва ли ми опит с AI или видео?",
    a: "Не. Обучението е структурирано от нулата — AI инструменти, prompting, workflow-и. Единственото, което трябва, е желание да учиш и компютър.",
  },
  {
    q: "Как работи Арена и кога се отключва?",
    a: "Арена стартира от месец 2, след като завършиш основите. Всеки месец имаш 20 реални платени задачи с общ пул €500 — 5 Premium по €50, 10 Standard по €20, 5 Quick по €10. Предаваш видео, получаваш ревю от Vekto, най-добрите печелят. С Доживотен достъп — Арена е отворена от ден 1.",
  },
  {
    q: "Наистина ли се плаща за задачите в Арена?",
    a: "Да. Наградите се превеждат директно от Vekto след одобрение на проекта. Задачите са реални brief-ове от клиенти на агенцията — не симулация. Ако за даден brief няма качествен submit, наградата се прехвърля в следващия месец.",
  },
  {
    q: "Как мога да стана част от Vekto екипа?",
    a: "Трите месеца те водят натам: завършваш обучението, доказваш се в Арена, изграждаш портфолио. Най-активните и най-качествените участници получават дългосрочни Vekto задачи и постоянна работа в агенцията.",
  },
  {
    q: "Защо има структура по месеци — не е ли по-добре всичко веднага?",
    a: "Месец 1 — Основи. Месец 2 — Арена. Месец 3 — Портфолио + Vekto задачи. Структурираната прогресия работи по-добре от хаос. Ако искаш всичко отворено от ден 1 — вземи Доживотен достъп и работи по свой темп.",
  },
  {
    q: "Какво точно има в първия месец?",
    a: "Фундаментални модули: AI инструменти, prompting, workflow-и, практически задания и общност с Weekly Q&A. Достатъчно да завършиш първи реални проекти и да влезеш в Арена с увереност.",
  },
  {
    q: "Колко време трябва да отделям?",
    a: "Няма минимум. Колкото повече отделяш, толкова по-добри резултати имаш в Арена и по-голям шанс за дългосрочни Vekto задачи. Успяващите членове влагат 5-10 часа седмично.",
  },
  {
    q: "Мога ли да отменя абонамента?",
    a: "Да, по всяко време. При месечния план спираш преди следващото плащане. При Доживотен достъп — достъпът остава завинаги без допълнителни такси.",
  },
  {
    q: "€349 за Доживотен достъп завинаги ли е тази цена?",
    a: "Не. €349 е стартова цена валидна само до 1 юни 2026. След това цената се вдига, а еднократната оферта изчезва окончателно.",
  },
  {
    q: "Защо €349 е по-добра сделка от €59/мес?",
    a: "€59 × 12 = €708 на година — €349 е под половин година. Плюс Арена работи в твоя полза: 7 Premium победи (7 × €50 = €350) и инвестицията се връща напълно. И това е преди Vekto да започне да ти възлага дългосрочни задачи.",
  },
  {
    q: "На какъв език е обучението?",
    a: "Български. Всички модули, чатът и Q&A сесиите са на български. Brief-овете в Арена могат да са на английски — клиентите са международни.",
  },
];
