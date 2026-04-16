"use client";

import { useEffect, useState } from "react";

type AuditLog = {
  id: number;
  admin_id: string;
  admin_email: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

const actionStyles: Record<string, { label: string; color: string }> = {
  "module.create": { label: "Нов модул", color: "bg-emerald-500/20 text-emerald-400" },
  "module.update": { label: "Редакция модул", color: "bg-blue-500/20 text-blue-400" },
  "module.delete": { label: "Изтрит модул", color: "bg-red-500/20 text-red-400" },
  "module.reorder": { label: "Пренареждане", color: "bg-purple-500/20 text-purple-400" },
  "arena.create": { label: "Ново предизвикателство", color: "bg-emerald-500/20 text-emerald-400" },
  "arena.update": { label: "Редакция арена", color: "bg-blue-500/20 text-blue-400" },
  "arena.delete": { label: "Изтрита арена", color: "bg-red-500/20 text-red-400" },
  "user.make_admin": { label: "Направен admin", color: "bg-[#c8ff00]/20 text-[#c8ff00]" },
  "user.remove_admin": { label: "Премахнат admin", color: "bg-orange-500/20 text-orange-400" },
  "user.grant_access": { label: "Даден достъп", color: "bg-emerald-500/20 text-emerald-400" },
  "user.cancel": { label: "Отписан", color: "bg-red-500/20 text-red-400" },
  "notification.send": { label: "Нотификация", color: "bg-blue-500/20 text-blue-400" },
  "chat.ban": { label: "Чат BAN", color: "bg-red-500/20 text-red-400" },
  "chat.mute": { label: "Чат MUTE", color: "bg-orange-500/20 text-orange-400" },
  "chat.delete_message": { label: "Изтрито съобщение", color: "bg-white/10 text-white/40" },
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((r) => r.json())
      .then(({ logs }) => setLogs(logs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? logs.filter(
        (l) =>
          l.action.toLowerCase().includes(search.toLowerCase()) ||
          (l.admin_email ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (l.target ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white/90">Лог на действията</h1>
          <p className="text-sm text-white/30 mt-1">Кой какво е направил в админ панела</p>
        </div>
        <input
          type="text"
          placeholder="Търси по действие, админ, цел..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white/80 placeholder-white/20 w-full sm:w-72 focus:outline-none focus:border-[#c8ff00]/30"
        />
      </div>

      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead>
            <tr className="border-b border-white/6">
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Дата</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Админ</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Действие</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Цел</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/30">Детайли</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => {
              const style = actionStyles[log.action] ?? { label: log.action, color: "bg-white/10 text-white/30" };
              return (
                <tr key={log.id} className="border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-white/40 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("bg-BG", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3 text-white/50 text-xs">{log.admin_email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${style.color}`}>
                      {style.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/60 text-xs max-w-[200px] truncate">{log.target ?? "—"}</td>
                  <td className="px-5 py-3 text-white/25 text-xs max-w-[200px] truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-white/20 text-sm">
                  {search ? "Няма резултати" : "Няма записи"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
