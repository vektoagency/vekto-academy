"use client";

import { useEffect, useState } from "react";

type ModLog = {
  id: number;
  admin_email: string;
  action: string;
  target_user_id: string;
  target_user_name: string | null;
  message_id: string | null;
  reason: string | null;
  created_at: string;
};

const actionLabel: Record<string, { label: string; color: string }> = {
  ban: { label: "BAN", color: "bg-red-500/20 text-red-400" },
  mute: { label: "MUTE", color: "bg-orange-500/20 text-orange-400" },
  delete_message: { label: "DELETE MSG", color: "bg-white/10 text-white/50" },
  unban: { label: "UNBAN", color: "bg-emerald-500/20 text-emerald-400" },
  unmute: { label: "UNMUTE", color: "bg-blue-500/20 text-blue-400" },
};

export default function AdminModeration() {
  const [logs, setLogs] = useState<ModLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/moderation")
      .then((r) => r.json())
      .then(({ logs }) => setLogs(logs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.action === filter);

  const bannedUsers = logs
    .filter((l) => l.action === "ban")
    .reduce((acc, l) => {
      if (!acc.some((u) => u.target_user_id === l.target_user_id)) {
        acc.push(l);
      }
      return acc;
    }, [] as ModLog[]);

  const mutedUsers = logs
    .filter((l) => l.action === "mute")
    .reduce((acc, l) => {
      if (!acc.some((u) => u.target_user_id === l.target_user_id)) {
        acc.push(l);
      }
      return acc;
    }, [] as ModLog[]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white/90">Чат модерация</h1>
        <p className="text-sm text-white/30 mt-1">Лог на действията и списък с наказани потребители</p>
      </div>

      {/* Banned / Muted cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <h2 className="text-sm font-bold text-white/60">Банвани ({bannedUsers.length})</h2>
          </div>
          {bannedUsers.length === 0 ? (
            <p className="text-xs text-white/20">Няма банвани потребители</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bannedUsers.map((u) => (
                <div key={u.target_user_id} className="flex items-center justify-between bg-red-500/5 border border-red-500/10 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm text-white/70">{u.target_user_name ?? u.target_user_id}</p>
                    <p className="text-[10px] text-white/25">
                      от {u.admin_email} · {new Date(u.created_at).toLocaleDateString("bg-BG")}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">BAN</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#111] border border-white/6 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <h2 className="text-sm font-bold text-white/60">Заглушени ({mutedUsers.length})</h2>
          </div>
          {mutedUsers.length === 0 ? (
            <p className="text-xs text-white/20">Няма заглушени потребители</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {mutedUsers.map((u) => (
                <div key={u.target_user_id} className="flex items-center justify-between bg-orange-500/5 border border-orange-500/10 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm text-white/70">{u.target_user_name ?? u.target_user_id}</p>
                    <p className="text-[10px] text-white/25">
                      от {u.admin_email} · {new Date(u.created_at).toLocaleDateString("bg-BG")}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400">MUTE</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {["all", "ban", "mute", "delete_message"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f ? "bg-[#c8ff00]/10 text-[#c8ff00]" : "bg-white/5 text-white/30 hover:text-white/60"
            }`}
          >
            {f === "all" ? "Всички" : actionLabel[f]?.label ?? f}
          </button>
        ))}
        <span className="text-xs text-white/20 ml-2">{filtered.length} записа</span>
      </div>

      {/* Log table */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/6">
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Дата</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Админ</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Действие</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Потребител</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Причина</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => {
              const a = actionLabel[log.action] ?? { label: log.action, color: "bg-white/10 text-white/30" };
              return (
                <tr key={log.id} className="border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-white/40 text-xs">
                    {new Date(log.created_at).toLocaleString("bg-BG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3 text-white/50 text-xs">{log.admin_email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${a.color}`}>{a.label}</span>
                  </td>
                  <td className="px-5 py-3 text-white/60">{log.target_user_name ?? log.target_user_id}</td>
                  <td className="px-5 py-3 text-white/30 text-xs">{log.reason ?? "—"}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-white/20 text-sm">Няма записи за модерация</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
