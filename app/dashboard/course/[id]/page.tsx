"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Course Structure ────────────────────────────────────
type Lesson = {
  id: string;
  title: string;
  duration: string;
  bunnyId: string;
};
type Module = {
  id: number;
  title: string;
  emoji: string;
  lessons: Lesson[];
};

const COURSE: Module[] = [
  {
    id: 0,
    title: "Старт",
    emoji: "🚀",
    lessons: [
      { id: "0-1", title: "Как се ползва платформата", duration: "3:00", bunnyId: "" },
      { id: "0-2", title: "Добре дошли в курса", duration: "5:12", bunnyId: "dbc5a2c0-7b9e-48d4-a916-bfa313e9c9a8" },
    ],
  },
  {
    id: 1,
    title: "Майндсет",
    emoji: "🧠",
    lessons: [
      { id: "1-1", title: "Мисли като маркетолог, виждай като режисьор", duration: "13:00", bunnyId: "" },
      { id: "1-2", title: "Пускай. Учи. Повтаряй.", duration: "12:00", bunnyId: "" },
    ],
  },
  {
    id: 2,
    title: "Психология и стратегия",
    emoji: "🎯",
    lessons: [
      { id: "2-1", title: "Hook / Body / CTA анатомия", duration: "11:00", bunnyId: "" },
      { id: "2-2", title: "Голямата рамка — най-добрата рамка за платена реклама в момента", duration: "11:00", bunnyId: "" },
      { id: "2-3", title: "TOF MOF BOF", duration: "11:00", bunnyId: "" },
      { id: "2-4", title: "Матрицата на ъглите — как генерираш 10 ъгъла за всеки продукт", duration: "11:00", bunnyId: "" },
      { id: "2-5", title: "Органик vs Платено — различна логика, различни метрики", duration: "11:00", bunnyId: "" },
    ],
  },
  {
    id: 3,
    title: "Инструментите",
    emoji: "🛠",
    lessons: [
      { id: "3-1", title: "Промптинг основи", duration: "14:00", bunnyId: "" },
      { id: "3-2", title: "Инструментите — регистрация и setup", duration: "10:00", bunnyId: "" },
      { id: "3-3", title: "Генериране на изображения", duration: "18:00", bunnyId: "" },
      { id: "3-4", title: "От снимка към видео", duration: "15:00", bunnyId: "" },
      { id: "3-5", title: "Глас и аудио", duration: "12:00", bunnyId: "" },
      { id: "3-6", title: "HeyGen — аватари и дигитален близнак", duration: "16:00", bunnyId: "" },
      { id: "3-7", title: "CapCut — workflow от А до Я", duration: "20:00", bunnyId: "" },
    ],
  },
  {
    id: 4,
    title: "The Playbooks ⭐",
    emoji: "📖",
    lessons: [
      { id: "4-1", title: "AI UGC реклами — Онлайн магазини · TOF и BOF · Higgsfield · Arcads", duration: "25:00", bunnyId: "" },
      { id: "4-2", title: "Faceless viral TikTok / Reels — без да се показваш · TOF · Kie.ai · CapCut", duration: "25:00", bunnyId: "" },
      { id: "4-3", title: "Говорещи глави / VSL — Коучове и услуги · MOF и BOF · HeyGen · Higgsfield", duration: "25:00", bunnyId: "" },
      { id: "4-4", title: "Кинематографски / Brand Film — Луксозни брандове и имоти · Higgsfield Cinema · Kie.ai Veo 3.1", duration: "25:00", bunnyId: "" },
      { id: "4-5", title: "Органично съдържание", duration: "20:00", bunnyId: "" },
    ],
  },
  {
    id: 5,
    title: "Монтаж за задържане на внимание",
    emoji: "✂️",
    lessons: [
      { id: "5-1", title: "Retention editing — смяна на кадър на всеки 3 секунди", duration: "12:00", bunnyId: "" },
      { id: "5-2", title: "Субтитри които продават — Hormozi стил с 1 клик", duration: "11:00", bunnyId: "" },
      { id: "5-3", title: "Sound design — swoosh · pop · riser ефекти", duration: "12:00", bunnyId: "" },
    ],
  },
  {
    id: 6,
    title: "Машината за клиенти (бонус)",
    emoji: "💰",
    lessons: [
      { id: "6-1", title: "Как намираш клиенти — фитнеси · зъболекари · локален бизнес", duration: "13:00", bunnyId: "" },
      { id: "6-2", title: "Офертата — пакет от ъгли, не просто видеа", duration: "12:00", bunnyId: "" },
    ],
  },
];

const ALL_LESSONS: Lesson[] = COURSE.flatMap((m) => m.lessons);

function getLessonModule(lessonId: string): Module | undefined {
  return COURSE.find((m) => m.lessons.some((l) => l.id === lessonId));
}

// ── Helpers ─────────────────────────────────────────────
function totalMinutes(lessons: Lesson[]): number {
  return lessons.reduce((acc, l) => {
    const parts = l.duration.split(":").map(Number);
    return acc + (parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1]);
  }, 0);
}
function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}ч ${m}м` : `${m} мин`;
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useUser();
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [search, setSearch] = useState("");
  const notesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoCompleteRef = useRef(false);

  const lesson = ALL_LESSONS.find((l) => l.id === lessonId) ?? null;
  const lessonModule = lesson ? getLessonModule(lesson.id) : null;

  useEffect(() => {
    params.then(() => {
      // id param is not used for lesson navigation — overview by default
    });
  }, [params]);

  // Load progress ONCE on mount via API (uses service role key — bypasses RLS)
  useEffect(() => {
    if (!user) return;
    fetch("/api/progress")
      .then(r => r.json())
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, boolean> = {};
        data.forEach((p: { module_id: string; completed: boolean }) => { map[p.module_id] = p.completed; });
        setProgress(map);
      });
  }, [user?.id]);

  // Load notes when lesson changes
  useEffect(() => {
    if (!user || !lessonId) return;
    autoCompleteRef.current = false;
    supabase.from("module_notes").select("content")
      .eq("user_id", user.id).eq("module_id", lessonId).single()
      .then(({ data: note, error }) => {
        if (error && error.code !== "PGRST116") console.error("Notes load error:", error);
        setNotes(note?.content ?? "");
      });
  }, [user?.id, lessonId]);

  const markComplete = useCallback(async () => {
    if (!user || !lessonId) return;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      const json = await res.json();
      if (!res.ok) { console.error("markComplete error:", JSON.stringify(json)); return; }
      setProgress((prev) => ({ ...prev, [lessonId]: true }));
      const idx = ALL_LESSONS.findIndex((l) => l.id === lessonId);
      const next = ALL_LESSONS[idx + 1];
      if (next) {
        setTimeout(() => {
          setLessonId(next.id);
          const mod = getLessonModule(next.id);
          if (mod) setExpandedModules((e) => ({ ...e, [mod.id]: true }));
        }, 800);
      }
    } catch (err) {
      console.error("markComplete failed:", err);
    }
  }, [user, lessonId]);

  // Bunny postMessage — auto-complete at 90%
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== "object") return;
      const { event, currentTime, duration } = e.data;
      if (event === "timeupdate" && duration && currentTime && lessonId) {
        const pct = currentTime / duration;
        if (pct >= 0.9 && !autoCompleteRef.current && !progress[lessonId]) {
          autoCompleteRef.current = true;
          markComplete();
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [lessonId, progress, markComplete]);

  // Auto-save notes
  function handleNotesChange(val: string) {
    setNotes(val);
    setNotesSaved(false);
    if (notesTimeout.current) clearTimeout(notesTimeout.current);
    notesTimeout.current = setTimeout(async () => {
      if (!user || !lessonId) return;
      await supabase.from("module_notes").upsert(
        { user_id: user.id, module_id: lessonId, content: val, updated_at: new Date().toISOString() },
        { onConflict: "user_id,module_id" }
      );
      setNotesSaved(true);
    }, 1000);
  }

  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalLessons = ALL_LESSONS.length;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  const lessonIndex = lesson ? ALL_LESSONS.findIndex((l) => l.id === lesson.id) : -1;
  const prevLesson = lessonIndex > 0 ? ALL_LESSONS[lessonIndex - 1] : null;
  const nextLesson = lessonIndex >= 0 && lessonIndex < ALL_LESSONS.length - 1 ? ALL_LESSONS[lessonIndex + 1] : null;
  const firstIncomplete = ALL_LESSONS.find((l) => !progress[l.id]) ?? ALL_LESSONS[0];

  function goToLesson(l: Lesson) {
    setLessonId(l.id);
    autoCompleteRef.current = false;
    const mod = getLessonModule(l.id);
    if (mod) setExpandedModules((e) => ({ ...e, [mod.id]: true }));
  }

  return (
    <div className="flex h-dvh bg-[#080808] text-white overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className={`flex-shrink-0 flex flex-col bg-[#0a0a0a] border-r border-white/8 transition-all duration-300 hidden md:flex ${sidebarOpen ? "w-72" : "w-0 overflow-hidden border-0"}`}>
        <div className="px-5 h-14 flex items-center justify-between border-b border-white/8 flex-shrink-0">
          {lessonId
            ? <button onClick={() => setLessonId(null)} className="text-white/40 hover:text-white text-sm transition-colors">← Преглед</button>
            : <Link href="/dashboard?tab=course" className="text-white/40 hover:text-white text-sm transition-colors">← Назад</Link>
          }
          <span className="text-white/30 text-xs">{completedCount}/{totalLessons}</span>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/30 text-xs">Прогрес</span>
            <span className="text-[#c8ff00] text-xs font-bold">{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-[#c8ff00] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2 bg-white/4 border border-white/6 rounded-lg px-3 py-2 focus-within:border-[#c8ff00]/20 transition-colors">
            <svg className="w-3.5 h-3.5 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Търси урок..."
              className="bg-transparent text-xs text-white/60 placeholder:text-white/20 outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Module/lesson tree */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* Search results */}
          {search && (
            <div className="px-2 pb-2">
              {ALL_LESSONS.filter(l => l.title.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                <p className="text-white/20 text-xs px-3 py-4 text-center">Няма резултати</p>
              ) : (
                ALL_LESSONS.filter(l => l.title.toLowerCase().includes(search.toLowerCase())).map(l => {
                  const done = progress[l.id];
                  const active = l.id === lessonId;
                  return (
                    <button
                      key={l.id}
                      onClick={() => goToLesson(l)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all mb-0.5 ${active ? "bg-[#c8ff00]/8 text-white" : "hover:bg-white/5 text-white/50"}`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${done ? "bg-[#c8ff00] text-black" : "bg-white/8 text-white/30"}`}>
                        {done ? "✓" : "▶"}
                      </div>
                      <p className="text-xs truncate flex-1">{l.title}</p>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {!search && COURSE.map((mod) => {
            const modDone = mod.lessons.every((l) => progress[l.id]);
            const modProgress = mod.lessons.filter((l) => progress[l.id]).length;
            const isExpanded = expandedModules[mod.id];
            const hasActive = mod.lessons.some((l) => l.id === lessonId);

            return (
              <div key={mod.id}>
                {/* Module header */}
                <button
                  onClick={() => setExpandedModules((e) => ({ ...e, [mod.id]: !e[mod.id] }))}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all ${hasActive ? "bg-white/4" : "hover:bg-white/3"}`}
                >
                  <span className="text-sm flex-shrink-0">{mod.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${modDone ? "text-white/50" : "text-white/80"}`}>{mod.id}. {mod.title}</p>
                    <p className="text-white/20 text-[10px]">{modProgress}/{mod.lessons.length} урока</p>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-white/20 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {/* Lessons */}
                {isExpanded && (
                  <div className="pb-1">
                    {mod.lessons.map((l, i) => {
                      const done = progress[l.id];
                      const active = l.id === lessonId;
                      return (
                        <button
                          key={l.id}
                          onClick={() => goToLesson(l)}
                          className={`w-full flex items-center gap-3 pl-9 pr-4 py-2 text-left transition-all ${active ? "bg-[#c8ff00]/8 border-r-2 border-[#c8ff00]" : "hover:bg-white/3"}`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${done ? "bg-[#c8ff00] text-black" : active ? "bg-[#c8ff00]/20 text-[#c8ff00]" : "bg-white/8 text-white/30"}`}>
                            {done ? "✓" : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs truncate leading-snug ${active ? "text-white font-semibold" : done ? "text-white/45" : "text-white/50"}`}>{l.title}</p>
                            <p className="text-white/20 text-[10px]">{l.duration}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] flex flex-col bg-[#0a0a0a] border-r border-white/8 h-full overflow-hidden">
            <div className="px-5 h-14 flex items-center justify-between border-b border-white/8 flex-shrink-0">
              {lessonId
                ? <button onClick={() => { setLessonId(null); setMobileSidebarOpen(false); }} className="text-white/40 hover:text-white text-sm transition-colors">← Преглед</button>
                : <Link href="/dashboard?tab=course" className="text-white/40 hover:text-white text-sm transition-colors">← Назад</Link>
              }
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-5 py-3 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/30 text-xs">Прогрес</span>
                <span className="text-[#c8ff00] text-xs font-bold">{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-[#c8ff00] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {COURSE.map((mod) => {
                const modDone = mod.lessons.every((l) => progress[l.id]);
                const modProgress = mod.lessons.filter((l) => progress[l.id]).length;
                const isExpanded = expandedModules[mod.id];
                const hasActive = mod.lessons.some((l) => l.id === lessonId);
                return (
                  <div key={mod.id}>
                    <button
                      onClick={() => setExpandedModules((e) => ({ ...e, [mod.id]: !e[mod.id] }))}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all ${hasActive ? "bg-white/4" : "hover:bg-white/3"}`}
                    >
                      <span className="text-sm flex-shrink-0">{mod.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${modDone ? "text-white/50" : "text-white/80"}`}>{mod.id}. {mod.title}</p>
                        <p className="text-white/20 text-[10px]">{modProgress}/{mod.lessons.length} урока</p>
                      </div>
                      <svg className={`w-3.5 h-3.5 text-white/20 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isExpanded && (
                      <div className="pb-1">
                        {mod.lessons.map((l, i) => {
                          const done = progress[l.id];
                          const active = l.id === lessonId;
                          return (
                            <button
                              key={l.id}
                              onClick={() => { goToLesson(l); setMobileSidebarOpen(false); }}
                              className={`w-full flex items-center gap-3 pl-9 pr-4 py-2 text-left transition-all ${active ? "bg-[#c8ff00]/8 border-r-2 border-[#c8ff00]" : "hover:bg-white/3"}`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${done ? "bg-[#c8ff00] text-black" : active ? "bg-[#c8ff00]/20 text-[#c8ff00]" : "bg-white/8 text-white/30"}`}>
                                {done ? "✓" : i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs truncate leading-snug ${active ? "text-white font-semibold" : done ? "text-white/45" : "text-white/50"}`}>{l.title}</p>
                                <p className="text-white/20 text-[10px]">{l.duration}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 border-b border-white/8 px-4 flex items-center justify-between flex-shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                if (window.innerWidth < 768) setMobileSidebarOpen(true);
                else setSidebarOpen(!sidebarOpen);
              }}
              className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <p className="font-semibold text-sm truncate text-white/60">
              {lesson ? lesson.title : "Обучение"}
            </p>
          </div>

          {lesson && (
            <button
              onClick={markComplete}
              disabled={progress[lesson.id]}
              className={`flex items-center gap-2 text-sm font-bold px-4 py-1.5 rounded-full transition-all ${progress[lesson.id] ? "bg-[#c8ff00]/10 text-[#c8ff00] cursor-default" : "bg-[#c8ff00] text-black hover:bg-[#d4ff1a]"}`}
            >
              {progress[lesson.id] ? "✓ Завършен" : "Завърши"}
            </button>
          )}
        </header>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto">

          {/* ── OVERVIEW ── */}
          {!lesson && (
            <div className="w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10 max-w-6xl mx-auto">

              {/* Hero */}
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 bg-[#c8ff00]/10 border border-[#c8ff00]/20 rounded-full px-3 py-1 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00]" />
                  <span className="text-[#c8ff00] text-xs font-semibold">Vekto Academy</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black leading-tight">Обучение</h1>
                <p className="text-white/30 text-xs sm:text-sm tracking-wide">Нагласа → Стратегия → Инструменти → Правиш → Продаваш</p>
                <p className="text-white/45 text-sm sm:text-base leading-relaxed">
                  Научи се да правиш AI видео реклами от нулата — от психология и стратегия, през инструменти и playbooks, до реални клиенти. Всичко, което ползваме в агенцията, в едно практично обучение.
                </p>
                <div className="flex flex-wrap items-center gap-5 text-sm text-white/30">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {formatDuration(totalMinutes(ALL_LESSONS))} обучение
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                    {COURSE.length} модула · {totalLessons} урока
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Доживотен достъп
                  </span>
                </div>

                <button
                  onClick={() => goToLesson(firstIncomplete)}
                  className="mt-2 self-start flex items-center gap-2.5 bg-[#c8ff00] text-black font-black px-6 py-3 rounded-xl hover:bg-[#d4ff1a] transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  {completedCount > 0 ? "Продължи от там, където спря" : "Започни обучението"}
                </button>
              </div>

              {/* Next lesson + Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Next lesson card — spans 2 cols */}
                <button
                  onClick={() => goToLesson(firstIncomplete)}
                  className="sm:col-span-2 flex items-center gap-5 bg-white/3 border border-white/6 rounded-2xl p-5 hover:bg-white/5 transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#c8ff00] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">
                      {completedCount > 0 ? "Продължи" : "Започни от"}
                    </p>
                    <p className="text-white/90 text-sm font-bold truncate">{firstIncomplete.title}</p>
                    <p className="text-white/25 text-xs mt-0.5">
                      {(() => { const mod = getLessonModule(firstIncomplete.id); return mod ? `${mod.emoji} ${mod.title}` : ""; })()} · {firstIncomplete.duration}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-white/10 group-hover:text-[#c8ff00] transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Stats column */}
                <div className="flex flex-col gap-3">
                  <div className="flex-1 bg-white/3 border border-white/6 rounded-2xl p-4 flex flex-col justify-center">
                    <p className="text-[#c8ff00] text-2xl font-black">{progressPct}%</p>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Прогрес</p>
                  </div>
                  <div className="flex-1 bg-white/3 border border-white/6 rounded-2xl p-4 flex flex-col justify-center">
                    <p className="text-white/80 text-2xl font-black">{completedCount}<span className="text-white/20 text-sm font-normal">/{totalLessons}</span></p>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Завършени</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {completedCount > 0 && (
                <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                  <div className="h-full bg-[#c8ff00] rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
                </div>
              )}

            </div>
          )}

          {/* ── LESSON VIEW ── */}
          {lesson && (
            <>
              {/* Video */}
              <div className="aspect-video bg-[#0d0d0d] relative flex items-center justify-center border-b border-white/8">
                {lesson.bunnyId ? (
                  <iframe
                    ref={iframeRef}
                    src={`https://iframe.mediadelivery.net/embed/636246/${lesson.bunnyId}?autoplay=false&responsive=true&preload=true`}
                    className="w-full h-full"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center px-6">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <p className="text-white/30 text-sm">Видеото се качва скоро</p>
                  </div>
                )}
              </div>

              {/* Below video */}
              <div className="w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">

                {/* Breadcrumb + title */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-xs text-white/25">
                    <button onClick={() => setLessonId(null)} className="hover:text-white/60 transition-colors">Обучение</button>
                    <span>›</span>
                    <span>{lessonModule?.title}</span>
                  </div>
                  <h1 className="text-2xl font-black">{lesson.title}</h1>
                  <p className="text-white/40 text-sm mt-1">{lessonModule?.title} · {lesson.duration}</p>
                </div>

                {/* Prev / Next */}
                <div className="flex items-center gap-3">
                  {prevLesson ? (
                    <button
                      onClick={() => goToLesson(prevLesson)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 text-sm text-white/60 hover:text-white transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                      <span className="hidden sm:inline truncate max-w-[160px]">{prevLesson.title}</span>
                      <span className="sm:hidden">Предишно</span>
                    </button>
                  ) : <div />}

                  {nextLesson ? (
                    <button
                      onClick={() => goToLesson(nextLesson)}
                      className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8ff00] text-black font-bold text-sm hover:bg-[#d4ff1a] transition-all"
                    >
                      <span className="hidden sm:inline truncate max-w-[160px]">{nextLesson.title}</span>
                      <span className="sm:hidden">Следващо</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ) : (
                    <div className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8ff00]/10 text-[#c8ff00] font-bold text-sm border border-[#c8ff00]/20">
                      ✓ Обучението е завършено
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-black text-base">Моите бележки</p>
                    {notesSaved && <span className="text-[#c8ff00] text-xs animate-[fadeIn_0.3s_ease]">Запазено ✓</span>}
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Пиши бележки тук — запазват се автоматично..."
                    rows={8}
                    className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-[#c8ff00]/30 transition-colors leading-relaxed"
                  />
                </div>
              </div>
            </>
          )}

        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="md:hidden flex-shrink-0 border-t border-white/8 bg-[#0a0a0a] flex items-center">
          <Link href="/dashboard" className="flex-1 flex flex-col items-center gap-1 py-3 text-white/25 hover:text-white/60 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[9px] font-semibold">Начало</span>
          </Link>
          <button onClick={() => setLessonId(null)} className="flex-1 flex flex-col items-center gap-1 py-3 text-[#c8ff00] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-[9px] font-semibold">Обучение</span>
          </button>
          <Link href="/dashboard?tab=community" className="flex-1 flex flex-col items-center gap-1 py-3 text-white/25 hover:text-white/60 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-[9px] font-semibold">Общност</span>
          </Link>
          <Link href="/dashboard?tab=arena" className="flex-1 flex flex-col items-center gap-1 py-3 text-white/25 hover:text-white/60 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <span className="text-[9px] font-semibold">Арена</span>
          </Link>
        </nav>

      </div>
    </div>
  );
}
