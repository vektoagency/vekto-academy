"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  StreamChat,
  Channel as StreamChannel,
  FormatMessageResponse,
  Event,
} from "stream-chat";
import {
  Chat,
  Channel,
  MessageInput,
  useChannelStateContext,
  useChatContext,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);

const CHANNELS = [
  { id: "general",   name: "chat",           emoji: "💬" },
  { id: "intro",     name: "introduce",      emoji: "👋" },
  { id: "projects",  name: "show-your-work", emoji: "🎬" },
  { id: "tools",     name: "tools",          emoji: "🛠"  },
  { id: "questions", name: "questions",      emoji: "❓" },
  { id: "work",      name: "work",           emoji: "💼" },
];

const PINNED: Record<string, string> = {
  general:   "Добре дошли! Тук може да говорите за всичко — видео, AI, бизнес, живот.",
  intro:     "Радваме се че си тук! Кажи ни малко за себе си — кой си, откъде си, какво правиш.",
  projects:  "Качи каквото си направил — дори да не е перфектно. Feedback-ът тук е приятелски.",
  tools:     "Кой инструмент ползваш? Sora, Kling, Runway, HeyGen — сподели опита си.",
  questions: "Никой въпрос не е глупав. Питай смело — екипът на Vekto чете тук редовно.",
  work:      "Имаш проект или търсиш партньор? Само реални възможности — без спам.",
};

const ADMIN_CLERK_ID = process.env.NEXT_PUBLIC_ADMIN_CLERK_ID ?? "";
type ActiveView = { type: "channel"; id: string } | { type: "dm" };

// Global admin state — set during connect
let _isAdmin = false;

// ── Helpers ────────────────────────────────────────────
function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(date: Date | string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Днес";
  if (d.toDateString() === yesterday.toDateString()) return "Вчера";
  return d.toLocaleDateString("bg-BG", { day: "numeric", month: "long" });
}
function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// Render message text with @mentions highlighted
function renderMessageText(
  text: string,
  mentionedUsers: { id: string; name?: string }[] | undefined,
  currentUserId: string | undefined
): React.ReactNode {
  if (!mentionedUsers?.length) return text;
  const names = mentionedUsers
    .map((u) => u.name)
    .filter((n): n is string => !!n)
    .sort((a, b) => b.length - a.length);
  if (!names.length) return text;
  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`@(${escaped.join("|")})`, "g");
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    const matchedName = match[1];
    const mentioned = mentionedUsers.find((u) => u.name === matchedName);
    const isMe = mentioned?.id === currentUserId;
    parts.push(
      <span
        key={match.index}
        className={`font-bold px-1 py-0.5 rounded ${isMe ? "bg-[#c8ff00]/20 text-[#c8ff00]" : "text-[#c8ff00]/80 bg-[#c8ff00]/8"}`}
      >
        @{matchedName}
      </span>
    );
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

// ── Avatar ─────────────────────────────────────────────
function Avatar({ user, size = 38 }: { user: { name?: string; image?: string }; size?: number }) {
  const style = { width: size, height: size, minWidth: size };
  if (user.image) {
    return <img src={user.image} alt="" style={style} className="rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <div style={{ ...style, fontSize: size * 0.35 }} className="rounded-full bg-[#c8ff00] flex items-center justify-center text-black font-black flex-shrink-0">
      <span style={{ fontSize: size * 0.32 }}>{initials(user.name ?? "?")}</span>
    </div>
  );
}

const REACTION_EMOJIS = ["👍", "❤", "🔥", "😂", "😮", "🎉"];

// ── Single Message ─────────────────────────────────────
function MessageItem({ msg, showHeader }: { msg: FormatMessageResponse; showHeader: boolean }) {
  const { client } = useChatContext();
  const { channel } = useChannelStateContext();
  const isMe = msg.user?.id === client.userID;
  const isDeleted = msg.type === "deleted";
  const mentionedUsers = (msg as unknown as { mentioned_users?: { id: string; name?: string }[] }).mentioned_users;
  const iAmMentioned = !!mentionedUsers?.some((u) => u.id === client.userID);
  const [hovered, setHovered] = useState(false);
  const [showModMenu, setShowModMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const canModerate = _isAdmin && !isMe && !isDeleted;

  const ownReactions = (msg.own_reactions ?? []) as { type: string }[];
  const hasReacted = (emoji: string) => ownReactions.some((r) => r.type === emoji);

  async function toggleReaction(emoji: string) {
    if (!msg.id) return;
    try {
      if (hasReacted(emoji)) {
        await channel.deleteReaction(msg.id, emoji);
      } else {
        await channel.sendReaction(msg.id, { type: emoji });
      }
    } catch { /* ignore */ }
    setShowReactionPicker(false);
  }

  function logModAction(action: string) {
    fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        target_user_id: msg.user?.id,
        target_user_name: msg.user?.name ?? msg.user?.id,
        message_id: msg.id,
      }),
    }).catch(() => {});
  }

  async function handleDelete() {
    if (!confirm("Изтрий това съобщение?")) return;
    try {
      await client.deleteMessage(msg.id, true);
      logModAction("delete_message");
    } catch { /* ignore */ }
    setShowModMenu(false);
  }

  async function handleBan() {
    if (!msg.user?.id) return;
    if (!confirm(`Банвай ${msg.user.name ?? msg.user.id}? Няма да може да пише повече.`)) return;
    try {
      await channel.banUser(msg.user.id, { reason: "Banned by admin" });
      logModAction("ban");
    } catch { /* ignore */ }
    setShowModMenu(false);
  }

  async function handleMute() {
    if (!msg.user?.id) return;
    try {
      await client.muteUser(msg.user.id);
      logModAction("mute");
    } catch { /* ignore */ }
    setShowModMenu(false);
  }

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-0.5 transition-colors relative ${iAmMentioned ? "bg-[#c8ff00]/[0.05] border-l-2 border-[#c8ff00] hover:bg-[#c8ff00]/[0.08]" : "hover:bg-white/[0.02]"}`}
      style={{ paddingTop: showHeader ? "12px" : "2px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowModMenu(false); }}
    >
      {/* Avatar / spacer */}
      <div className="w-10 flex-shrink-0 flex justify-center" style={{ paddingTop: showHeader ? 2 : 0 }}>
        {showHeader
          ? <Avatar user={{ name: msg.user?.name, image: msg.user?.image as string | undefined }} size={38} />
          : <span className="text-[10px] text-white/15 opacity-0 group-hover:opacity-100 transition-opacity leading-none" style={{ paddingTop: 2 }}>{formatTime(msg.created_at!)}</span>
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className={`font-bold text-sm ${isMe ? "text-[#c8ff00]" : "text-white"}`}>
              {msg.user?.name ?? "Потребител"}
            </span>
            {msg.user?.role === "admin" && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#c8ff00]/15 text-[#c8ff00] uppercase">Admin</span>
            )}
            <span className="text-white/20 text-[11px]">{formatTime(msg.created_at!)}</span>
          </div>
        )}
        {isDeleted ? (
          <p className="text-white/20 text-sm italic">Съобщението е изтрито</p>
        ) : (
          <p className="text-white/82 text-sm leading-relaxed break-words">
            {renderMessageText(msg.text ?? "", mentionedUsers, client.userID)}
          </p>
        )}
        {/* Attachments */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.attachments.map((att, i) => att.image_url ? (
              <img key={i} src={att.image_url} className="max-w-xs max-h-64 rounded-xl object-cover border border-white/8" alt="" />
            ) : att.asset_url ? (
              <a key={i} href={att.asset_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-xs text-white/60 hover:text-white transition-colors">
                📎 {att.title ?? att.fallback ?? "Файл"}
              </a>
            ) : null)}
          </div>
        )}
        {/* Reactions */}
        {msg.reaction_groups && Object.keys(msg.reaction_groups).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(msg.reaction_groups).map(([emoji, data]) => {
              const mine = hasReacted(emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors border ${mine ? "bg-[#c8ff00]/15 border-[#c8ff00]/40 text-[#c8ff00]" : "bg-white/6 border-white/8 text-white/75 hover:bg-white/10"}`}
                >
                  {emoji} <span className={mine ? "text-[#c8ff00]/80" : "text-white/50"}>{(data as { count: number }).count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover actions — reaction picker (all users) + mod menu (admins) */}
      {hovered && !isDeleted && (
        <div className="absolute right-3 top-1 flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker((o) => !o)}
              className="p-1 rounded-md bg-[#111] border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
              title="Реакция"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
              </svg>
            </button>
            {showReactionPicker && (
              <div className="absolute right-0 top-full mt-1 flex items-center gap-0.5 bg-[#111] border border-white/10 rounded-xl shadow-2xl shadow-black/60 px-1.5 py-1 z-50">
                {REACTION_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => toggleReaction(e)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-base hover:bg-white/10 transition-colors ${hasReacted(e) ? "bg-[#c8ff00]/15" : ""}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          {canModerate && (
          <div className="relative">
          <button
            onClick={() => setShowModMenu(o => !o)}
            className="p-1 rounded-md bg-[#111] border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
          {showModMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-[#111] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50">
              <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Изтрий съобщение
              </button>
              <button onClick={handleMute} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                Заглуши потребител
              </button>
              <button onClick={handleBan} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Банвай потребител
              </button>
            </div>
          )}
          </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Message List ───────────────────────────────────────
function CustomMessageList() {
  const { messages } = useChannelStateContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  if (!messages?.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-white/20">
        <span className="text-4xl">💬</span>
        <p className="text-sm">Бъди първият, който пише тук</p>
      </div>
    );
  }

  const items: React.ReactNode[] = [];
  let lastDate = "";
  let lastUserId = "";

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i] as FormatMessageResponse;
    const msgDate = formatDate(msg.created_at!);
    const showDateDivider = msgDate !== lastDate;
    const showHeader = showDateDivider || msg.user?.id !== lastUserId;

    if (showDateDivider) {
      lastDate = msgDate;
      items.push(
        <div key={`date-${i}`} className="flex items-center gap-3 px-4 py-4">
          <div className="flex-1 h-px bg-white/6" />
          <span className="text-white/25 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 bg-white/4 border border-white/6 rounded-full">{msgDate}</span>
          <div className="flex-1 h-px bg-white/6" />
        </div>
      );
    }

    lastUserId = msg.user?.id ?? "";
    items.push(<MessageItem key={msg.id} msg={msg} showHeader={showHeader} />);
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {items}
      <div ref={bottomRef} />
    </div>
  );
}

// ── Right Sidebar ──────────────────────────────────────
function ChannelSidebar({ channelId }: { channelId: string }) {
  const [search, setSearch] = useState("");
  const ch = CHANNELS.find((c) => c.id === channelId);
  const pinned = PINNED[channelId];

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/6">
        <div className="flex items-center gap-2 bg-white/4 border border-white/6 rounded-lg px-3 py-2 focus-within:border-[#c8ff00]/20 transition-colors">
          <svg className="w-3.5 h-3.5 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Търси..."
            className="bg-transparent text-xs text-white/60 placeholder:text-white/20 outline-none w-full" />
        </div>
      </div>
      <div className="p-3 border-b border-white/6">
        <p className="text-white/18 text-[10px] uppercase tracking-widest mb-2 font-semibold">За канала</p>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-lg">{ch?.emoji}</span>
          <span className="font-bold text-sm">{ch?.name}</span>
        </div>
      </div>
      {pinned && (
        <div className="p-3">
          <p className="text-white/18 text-[10px] uppercase tracking-widest mb-2 font-semibold flex items-center gap-1.5">
            <span>📌</span> Закачено
          </p>
          <div className="bg-white/3 border border-white/6 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 rounded-full bg-[#c8ff00] flex items-center justify-center text-black text-[8px] font-black">V</div>
              <span className="text-[#c8ff00] text-[10px] font-bold">Vekto Team</span>
            </div>
            <p className="text-white/45 text-xs leading-relaxed">{pinned}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inner Chat (needs Channel context) ────────────────
function ChatInner({ active, sidebarOpen, onToggle }: {
  active: ActiveView;
  sidebarOpen: boolean;
  onToggle: () => void;
}) {
  const { channel } = useChannelStateContext();
  const isChannel = active.type === "channel";
  const ch = isChannel ? CHANNELS.find(c => c.id === active.id) : null;

  return (
    <div className="flex flex-1 min-h-0">
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-white/6 px-3 sm:px-4 flex items-center justify-between flex-shrink-0 bg-[#080808]">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button onClick={() => (window as any).__setMobileSidebar?.(true)} className="md:hidden p-1.5 -ml-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {isChannel ? (
              <>
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
                </svg>
                <span className="font-bold text-sm">{ch?.name}</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-full bg-[#c8ff00] flex items-center justify-center text-black text-[9px] font-black">V</div>
                <span className="font-bold text-sm">Vekto Team</span>
              </>
            )}
          </div>
          {isChannel && (
            <button onClick={onToggle} className={`p-1.5 rounded-lg transition-all hidden md:block ${sidebarOpen ? "text-[#c8ff00] bg-[#c8ff00]/10" : "text-white/25 hover:text-white/60 hover:bg-white/5"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path strokeLinecap="round" d="M15 3v18" />
              </svg>
            </button>
          )}
        </div>

        {/* Pinned banner */}
        {isChannel && active.id === "general" && (
          <div className="flex items-center gap-3 px-4 py-2 bg-[#c8ff00]/5 border-b border-[#c8ff00]/10 flex-shrink-0">
            <span className="text-[#c8ff00]/50 text-xs flex-shrink-0">📌</span>
            <p className="text-white/50 text-xs"><span className="text-[#c8ff00] font-semibold">Vekto Team</span> — Добре дошли! Качваме нови модули всяка седмица. Q&A всяка събота 18:00ч.</p>
          </div>
        )}

        {/* Messages */}
        <CustomMessageList />

        {/* Input */}
        <div className="px-3 pb-3 pt-1 flex-shrink-0">
          <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden focus-within:border-[#c8ff00]/25 focus-within:bg-white/[0.05] transition-all duration-200">
            <MessageInput focus />
          </div>
        </div>
      </div>

      {/* Right sidebar (desktop only) */}
      {isChannel && (
        <div className={`flex-shrink-0 bg-[#0d0d0d] border-l border-white/6 overflow-y-auto transition-all duration-300 ease-in-out hidden md:block ${sidebarOpen ? "w-56 opacity-100" : "w-0 opacity-0 pointer-events-none"}`}>
          <ChannelSidebar channelId={active.id} />
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
function initialActive(): ActiveView {
  if (typeof window === "undefined") return { type: "channel", id: "general" };
  const params = new URLSearchParams(window.location.search);
  if (params.get("dm") === "1") return { type: "dm" };
  const ch = params.get("ch");
  if (ch && CHANNELS.some((c) => c.id === ch)) return { type: "channel", id: ch };
  return { type: "channel", id: "general" };
}

export default function CommunityChat() {
  const { user } = useUser();
  const [active, setActive] = useState<ActiveView>(initialActive);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [dmUnread, setDmUnread] = useState(0);

  // Expose for ChatInner hamburger button
  useEffect(() => {
    (window as any).__setMobileSidebar = setMobileSidebar;
    return () => { delete (window as any).__setMobileSidebar; };
  }, []);

  useEffect(() => {
    if (!user || connected) return;
    async function connect() {
      const res = await fetch("/api/stream-token");
      const { token, isAdmin } = await res.json();
      _isAdmin = isAdmin ?? false;
      await client.connectUser(
        { id: user!.id, name: [user!.firstName, user!.lastName].filter(Boolean).join(" ") || "Потребител", image: user!.imageUrl },
        token
      );
      setConnected(true);
    }
    connect();
    return () => { client.disconnectUser(); };
  }, [user?.id]);

  // Watch all channels in background for unread counts
  useEffect(() => {
    if (!connected || !user) return;
    let cancelled = false;

    async function watchAll() {
      // Query & watch all vekto-* channels the user is a member of
      const chans = await client.queryChannels(
        { type: "messaging", members: { $in: [user!.id] } },
        { last_message_at: -1 },
        { state: true, watch: true, limit: 30 }
      );
      if (cancelled) return;

      const map: Record<string, number> = {};
      let dm = 0;
      for (const ch of chans) {
        const id = ch.id ?? "";
        const count = ch.countUnread();
        if (id.startsWith("vekto-")) {
          map[id.slice("vekto-".length)] = count;
        } else {
          dm += count;
        }
      }
      setUnread(map);
      setDmUnread(dm);
    }
    watchAll();

    function onNewMessage(event: Event) {
      const cid = event.cid ?? "";
      const channelId = cid.split(":")[1] ?? "";
      // Don't increment if sender is current user or it's the active channel
      if (event.user?.id === user!.id) return;
      const isActiveChannel =
        active.type === "channel" && `vekto-${active.id}` === channelId;
      const isActiveDm = active.type === "dm" && !channelId.startsWith("vekto-");
      if (isActiveChannel || isActiveDm) return;

      if (channelId.startsWith("vekto-")) {
        const shortId = channelId.slice("vekto-".length);
        setUnread((prev) => ({ ...prev, [shortId]: (prev[shortId] ?? 0) + 1 }));
      } else {
        setDmUnread((d) => d + 1);
      }
    }

    client.on("message.new", onNewMessage);
    return () => {
      cancelled = true;
      client.off("message.new", onNewMessage);
    };
  }, [connected, user?.id, active.type, active.type === "channel" ? active.id : "dm"]);

  useEffect(() => {
    if (!connected || !user) return;
    setReady(false);
    async function switchChannel() {
      let ch: StreamChannel;
      if (active.type === "dm") {
        const members = [user!.id];
        if (ADMIN_CLERK_ID && ADMIN_CLERK_ID !== user!.id) members.push(ADMIN_CLERK_ID);
        ch = client.channel("messaging", undefined, { members, name: "Vekto Team" } as Record<string, unknown>);
      } else {
        ch = client.channel("messaging", `vekto-${active.id}`, {
          name: CHANNELS.find((c) => c.id === active.id)?.name ?? active.id,
          members: [user!.id],
        } as Record<string, unknown>);
      }
      await ch.watch();
      await ch.markRead();
      setChannel(ch);
      setReady(true);
      // Clear local unread for this channel
      if (active.type === "channel") {
        setUnread((prev) => ({ ...prev, [active.id]: 0 }));
      } else {
        setDmUnread(0);
      }
    }
    switchChannel();
  }, [connected, active.type, active.type === "channel" ? active.id : "dm"]);

  const isChannelView = active.type === "channel";

  return (
    <div className="flex overflow-hidden rounded-2xl border border-white/8 bg-[#080808]" style={{ height: "calc(100dvh - 112px)" }}>

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileSidebar(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute left-0 top-0 bottom-0 w-64 max-w-[85vw] bg-[#0d0d0d] border-r border-white/6 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/6 flex-shrink-0">
              <div>
                <p className="font-black text-sm leading-tight">Vekto Academy</p>
                <p className="text-white/20 text-[10px]">Community</p>
              </div>
              <button onClick={() => setMobileSidebar(false)} className="p-1 text-white/30 hover:text-white/70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2">
              <p className="text-white/18 text-[10px] uppercase tracking-widest px-2 mb-1.5 font-semibold">Channels</p>
              {CHANNELS.map((ch) => {
                const isActive = active.type === "channel" && active.id === ch.id;
                const count = unread[ch.id] ?? 0;
                return (
                  <button key={ch.id} onClick={() => { setActive({ type: "channel", id: ch.id }); setMobileSidebar(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all mb-0.5 ${isActive ? "bg-white/10 text-white" : count > 0 ? "text-white/80 hover:bg-white/5" : "text-white/30 hover:text-white/70 hover:bg-white/5"}`}>
                    <span className="text-sm">{ch.emoji}</span>
                    <span className={`truncate text-xs flex-1 ${count > 0 ? "font-bold" : "font-medium"}`}>{ch.name}</span>
                    {count > 0 && !isActive && (
                      <span className="min-w-[16px] h-4 flex items-center justify-center bg-[#c8ff00] text-black text-[9px] font-black rounded-full px-1 leading-none flex-shrink-0">{count > 9 ? "9+" : count}</span>
                    )}
                  </button>
                );
              })}
              <div className="pt-3 mt-2 border-t border-white/6">
                <p className="text-white/18 text-[10px] uppercase tracking-widest px-2 mb-1.5 font-semibold">Direct</p>
                <button onClick={() => { setActive({ type: "dm" }); setMobileSidebar(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${active.type === "dm" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/70 hover:bg-white/5"}`}>
                  <div className="w-6 h-6 rounded-full bg-[#c8ff00] flex items-center justify-center text-black text-[9px] font-black">V</div>
                  <span className="text-xs font-medium flex-1">Vekto Team</span>
                  {dmUnread > 0 && active.type !== "dm" && (
                    <span className="min-w-[16px] h-4 flex items-center justify-center bg-[#c8ff00] text-black text-[9px] font-black rounded-full px-1 leading-none flex-shrink-0">{dmUnread > 9 ? "9+" : dmUnread}</span>
                  )}
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Left sidebar (desktop only) */}
      <div className="w-52 flex-shrink-0 hidden md:flex flex-col bg-[#0d0d0d] border-r border-white/6">
        <div className="h-12 px-4 flex items-center border-b border-white/6 flex-shrink-0">
          <div>
            <p className="font-black text-sm leading-tight">Vekto Academy</p>
            <p className="text-white/20 text-[10px]">Community</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <p className="text-white/18 text-[10px] uppercase tracking-widest px-2 mb-1.5 font-semibold">Channels</p>
          {CHANNELS.map((ch) => {
            const isActive = isChannelView && active.id === ch.id;
            const count = unread[ch.id] ?? 0;
            return (
              <button key={ch.id} onClick={() => setActive({ type: "channel", id: ch.id })}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all mb-0.5 group ${isActive ? "bg-white/10 text-white" : count > 0 ? "text-white/85 hover:bg-white/5" : "text-white/30 hover:text-white/70 hover:bg-white/5"}`}>
                <span className={`text-sm leading-none flex-shrink-0 transition-opacity ${isActive || count > 0 ? "opacity-100" : "opacity-50 group-hover:opacity-100"}`}>{ch.emoji}</span>
                <span className={`truncate text-xs flex-1 ${count > 0 && !isActive ? "font-bold" : "font-medium"}`}>{ch.name}</span>
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00] flex-shrink-0" />
                ) : count > 0 ? (
                  <span className="min-w-[16px] h-4 flex items-center justify-center bg-[#c8ff00] text-black text-[9px] font-black rounded-full px-1 leading-none flex-shrink-0">{count > 9 ? "9+" : count}</span>
                ) : null}
              </button>
            );
          })}

          <div className="pt-3 mt-2 border-t border-white/6">
            <p className="text-white/18 text-[10px] uppercase tracking-widest px-2 mb-1.5 font-semibold">Direct</p>
            <button onClick={() => setActive({ type: "dm" })}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${active.type === "dm" ? "bg-white/10 text-white" : dmUnread > 0 ? "text-white/85 hover:bg-white/5" : "text-white/30 hover:text-white/70 hover:bg-white/5"}`}>
              <div className="relative flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#c8ff00] flex items-center justify-center text-black text-[9px] font-black">V</div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border border-[#0d0d0d]" />
              </div>
              <span className={`text-xs flex-1 ${dmUnread > 0 && active.type !== "dm" ? "font-bold" : "font-medium"}`}>Vekto Team</span>
              {dmUnread > 0 && active.type !== "dm" && (
                <span className="min-w-[16px] h-4 flex items-center justify-center bg-[#c8ff00] text-black text-[9px] font-black rounded-full px-1 leading-none flex-shrink-0">{dmUnread > 9 ? "9+" : dmUnread}</span>
              )}
            </button>
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-white/6 px-3 py-2.5 flex items-center gap-2.5 bg-black/20">
          <div className="relative flex-shrink-0">
            {user?.imageUrl
              ? <img src={user.imageUrl} className="w-8 h-8 rounded-full" alt="" />
              : <div className="w-8 h-8 rounded-full bg-[#c8ff00] flex items-center justify-center text-black text-xs font-black">{user?.firstName?.[0] ?? "?"}</div>
            }
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0d0d0d]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate leading-tight">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-green-400">Online</p>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {!ready || !channel ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20">
            <div className="w-7 h-7 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
            <span className="text-sm">Зареждане...</span>
          </div>
        ) : (
          <Chat client={client} theme="str-chat__theme-dark">
            <Channel channel={channel}>
              <ChatInner active={active} sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
            </Channel>
          </Chat>
        )}
      </div>
    </div>
  );
}
