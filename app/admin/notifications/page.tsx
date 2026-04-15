"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  created_at: string;
};

const TYPES = [
  { value: "system", label: "Системно", icon: "📢" },
  { value: "module", label: "Модул", icon: "🎬" },
  { value: "challenge", label: "Предизвикателство", icon: "⚡" },
  { value: "arena", label: "Арена", icon: "🏆" },
  { value: "mention", label: "Споменаване", icon: "💬" },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Send form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("system");
  const [link, setLink] = useState("");
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [specificIds, setSpecificIds] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then(({ data }) => setNotifications(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSending(true);
    setSuccess("");

    const payload = {
      userIds: target === "all" ? "all" : specificIds.split(",").map((s) => s.trim()).filter(Boolean),
      title: title.trim(),
      body: body.trim(),
      type,
      link: link.trim() || undefined,
    };

    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess(`Изпратено до ${data.sent} потребител(и)`);
      setTitle("");
      setBody("");
      setLink("");
      // Refresh list
      const refreshed = await fetch("/api/admin/notifications").then((r) => r.json());
      setNotifications(refreshed.data ?? []);
    }

    setSending(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white/90">Известия</h1>
        <p className="text-sm text-white/30 mt-1">Изпращай нотификации към потребители</p>
      </div>

      {/* Send form */}
      <form onSubmit={handleSend} className="bg-[#111] border border-white/6 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white/60">Ново известие</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Заглавие</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Нов модул е наличен!"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Тип</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8ff00]/30"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Съобщение</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Описание на нотификацията..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Линк (опционално)</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/dashboard/course/3"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Получатели</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTarget("all")}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  target === "all"
                    ? "bg-[#c8ff00]/15 text-[#c8ff00] border border-[#c8ff00]/20"
                    : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
                }`}
              >
                Всички активни
              </button>
              <button
                type="button"
                onClick={() => setTarget("specific")}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  target === "specific"
                    ? "bg-[#c8ff00]/15 text-[#c8ff00] border border-[#c8ff00]/20"
                    : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
                }`}
              >
                Конкретни
              </button>
            </div>
          </div>
        </div>

        {target === "specific" && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">User IDs (разделени с запетая)</label>
            <input
              type="text"
              value={specificIds}
              onChange={(e) => setSpecificIds(e.target.value)}
              placeholder="user_2abc123, user_2def456"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8ff00]/30"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={sending || !title.trim() || !body.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#c8ff00] text-black text-sm font-bold hover:bg-[#d4ff33] transition-colors disabled:opacity-40"
          >
            {sending ? "Изпращане..." : "Изпрати"}
          </button>
          {success && <span className="text-sm text-emerald-400">{success}</span>}
        </div>
      </form>

      {/* Recent notifications */}
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6">
          <h2 className="text-sm font-bold text-white/60">Последни известия</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-white/20 text-sm">Няма изпратени известия</div>
        ) : (
          <div className="divide-y divide-white/4">
            {notifications.map((n) => (
              <div key={n.id} className="px-6 py-3 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  n.read ? "bg-white/5" : "bg-[#c8ff00]/10"
                }`}>
                  {TYPES.find((t) => t.value === n.type)?.icon ?? "📌"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/60 truncate">{n.title}</p>
                  <p className="text-[11px] text-white/30 truncate">{n.body}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-white/20">
                    {new Date(n.created_at).toLocaleDateString("bg-BG")}
                  </p>
                  <p className="text-[10px] text-white/15 font-mono">{n.user_id?.slice(0, 12)}...</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
