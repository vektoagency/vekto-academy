"use client";

import { useState, useEffect, useRef } from "react";

type Notification = {
  id: string;
  type: "module" | "challenge" | "system" | "arena" | "mention";
  title: string;
  body: string;
  read: boolean;
  link?: string;
  created_at: string;
};

const ICON_MAP: Record<string, string> = {
  module: "🎬",
  challenge: "⚡",
  system: "📢",
  arena: "🏆",
  mention: "💬",
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "сега";
  if (mins < 60) return `${mins} мин`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}ч`;
  const days = Math.floor(hours / 24);
  return `${days}д`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications
  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) setNotifications(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Mark all as read when opening
  async function handleOpen() {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: "all" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  function handleNotificationClick(n: Notification) {
    if (n.link) window.location.href = n.link;
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className={`relative p-2 rounded-lg transition-all ${
          open
            ? "bg-white/10 text-white"
            : "text-white/30 hover:text-white/70 hover:bg-white/5"
        }`}
      >
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-[#c8ff00] text-black text-[9px] font-black rounded-full px-1 leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-white/40">Известия</p>
            {notifications.length > 0 && (
              <span className="text-[10px] text-white/20">{notifications.length}</span>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <svg className="w-8 h-8 text-white/10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-white/20 text-xs">Няма нови известия</p>
              </div>
            )}

            {!loading && notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-white/4 last:border-0 ${
                  n.read
                    ? "hover:bg-white/3"
                    : "bg-[#c8ff00]/[0.03] hover:bg-[#c8ff00]/[0.06]"
                }`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
                  n.read ? "bg-white/5" : "bg-[#c8ff00]/10"
                }`}>
                  {ICON_MAP[n.type] ?? "📌"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold truncate ${n.read ? "text-white/50" : "text-white/90"}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00] flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-[11px] leading-snug mt-0.5 truncate ${n.read ? "text-white/25" : "text-white/45"}`}>
                    {n.body}
                  </p>
                  <p className="text-white/15 text-[10px] mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
