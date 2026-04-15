"use client";

import { useState } from "react";
import Link from "next/link";

const RULES = [
  {
    title: "Кой може да участва",
    icon: "👤",
    rules: [
      "Активен абонамент за Vekto Academy",
      "Поне един започнат модул от курса",
      "Един проект на участник на challenge",
      "Членовете на Vekto Team не участват",
    ],
  },
  {
    title: "Предаване",
    icon: "📤",
    rules: [
      "Линк към видео (YouTube unlisted, Drive, Dropbox)",
      "Линкът трябва да е активен 30+ дни",
      "Предаването е окончателно — без редакция",
      "Закъснели проекти не се разглеждат",
    ],
  },
  {
    title: "Избор на победител",
    icon: "🏆",
    rules: [
      "Избира се от екипа на Vekto Agency",
      "Критерии: качество, следване на brief-а, креативност",
      "Решението е окончателно",
      "Обявява се в Community до 48ч след края",
    ],
  },
  {
    title: "Плащане",
    icon: "💸",
    rules: [
      "Банков път или PayPal до 7 работни дни",
      "Победителят трябва да отговори до 48ч",
      "При неотговаряне — избира се следващият",
      "Проектът може да се използва от Vekto публично",
    ],
  },
];

export default function ArenaRules() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="border border-white/6 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 bg-[#0d0d0d] border-b border-white/6 flex items-center gap-2">
        <span className="text-xs">📋</span>
        <p className="text-xs font-black uppercase tracking-widest text-white/40">Правила</p>
      </div>
      <div className="divide-y divide-white/4">
        {RULES.map((group, i) => (
          <div key={group.title}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{group.icon}</span>
                <p className="text-xs font-bold text-white/60">{group.title}</p>
              </div>
              <svg
                className={`w-3.5 h-3.5 text-white/20 transition-transform duration-200 flex-shrink-0 ${open === i ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open === i && (
              <div className="px-5 pb-3.5 space-y-1.5">
                {group.rules.map((rule, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-white/15 text-xs mt-0.5 flex-shrink-0">·</span>
                    <p className="text-white/35 text-xs leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="px-5 py-3 bg-[#0d0d0d] border-t border-white/6 text-center">
        <p className="text-white/15 text-[10px]">
          Участието = приемане на правилата · Въпроси в{" "}
          <Link href="/dashboard?tab=community" className="text-[#c8ff00]/40 hover:text-[#c8ff00] transition-colors">
            Community
          </Link>
        </p>
      </div>
    </div>
  );
}
