"use client";

import { useEffect, useState } from "react";

type Row = {
  num: number;
  id: number;
  title: string;
  prize: string;
  winner: string;
  entries: number;
};

export default function ArenaScoreboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/arena/scoreboard")
      .then((r) => r.json())
      .then((d) => setRows(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="border border-white/6 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 bg-[#0d0d0d] border-b border-white/6 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-white/40">🏆 Scoreboard</p>
        <span className="text-white/15 text-[10px]">{rows.length} завършени</span>
      </div>
      <div className="divide-y divide-white/4">
        {loading ? (
          <div className="px-4 py-8 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-white/20 text-xs">Още няма приключили задачи.</p>
        ) : (
          rows.map((c) => (
            <div key={c.id} className="px-4 py-3 flex items-center gap-3">
              <p className="text-white/10 font-black text-base w-5 flex-shrink-0">#{c.num}</p>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{c.title}</p>
                <p className="text-white/25 text-[10px]">🥇 {c.winner} · {c.entries} предадени</p>
              </div>
              <span className="text-[#c8ff00] text-sm font-black flex-shrink-0">{c.prize}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
