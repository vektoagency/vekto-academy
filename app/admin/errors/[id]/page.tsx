"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Frame = {
  filename?: string;
  function?: string;
  lineNo?: number;
  colNo?: number;
  inApp?: boolean;
  context?: [number, string][];
};

type Exception = {
  type?: string;
  value?: string;
  stacktrace?: { frames?: Frame[] };
};

type Breadcrumb = {
  timestamp?: number;
  category?: string;
  message?: string;
  level?: string;
  type?: string;
  data?: Record<string, unknown>;
};

type SentryEvent = {
  id?: string;
  dateCreated?: string;
  title?: string;
  message?: string;
  platform?: string;
  user?: {
    id?: string;
    email?: string;
    username?: string;
    ip_address?: string;
  } | null;
  contexts?: {
    browser?: { name?: string; version?: string };
    os?: { name?: string; version?: string };
    device?: { family?: string; model?: string };
    runtime?: { name?: string; version?: string };
  };
  request?: {
    url?: string;
    method?: string;
    headers?: [string, string][];
  };
  tags?: [string, string][];
  entries?: Array<{ type: string; data: unknown }>;
};

type Issue = {
  id: string;
  shortId: string;
  title: string;
  culprit: string;
  level: string;
  status: string;
  count: string;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  permalink: string;
};

type DetailResp = {
  configured: boolean;
  issue: Issue;
  event: SentryEvent | null;
};

const levelColor: Record<string, string> = {
  fatal: "text-red-500 bg-red-500/10 border-red-500/30",
  error: "text-red-400 bg-red-500/5 border-red-500/20",
  warning: "text-amber-400 bg-amber-500/5 border-amber-500/20",
  info: "text-blue-400 bg-blue-500/5 border-blue-500/20",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("bg-BG");
}

export default function ErrorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<DetailResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/errors/${id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  async function act(action: "resolve" | "ignore") {
    if (!confirm(action === "resolve" ? "Маркирай като решено?" : "Игнорирай грешката?")) return;
    setActing(true);
    try {
      await fetch(`/api/admin/errors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.push("/admin/errors");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.issue) {
    return (
      <div className="space-y-4">
        <Link href="/admin/errors" className="text-sm text-white/50 hover:text-white">
          ← Обратно
        </Link>
        <p className="text-red-400">Грешката не е намерена</p>
      </div>
    );
  }

  const { issue, event } = data;
  const exceptionEntry = event?.entries?.find((e) => e.type === "exception");
  const exceptions = (exceptionEntry?.data as { values?: Exception[] } | undefined)?.values ?? [];
  const breadcrumbsEntry = event?.entries?.find((e) => e.type === "breadcrumbs");
  const breadcrumbs = (breadcrumbsEntry?.data as { values?: Breadcrumb[] } | undefined)?.values ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <Link href="/admin/errors" className="text-xs text-white/50 hover:text-white inline-flex items-center gap-1 mb-3">
            ← Обратно към списъка
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${levelColor[issue.level] ?? levelColor.error}`}>
              {issue.level}
            </span>
            <span className="text-[10px] text-white/30 font-mono">{issue.shortId}</span>
          </div>
          <h1 className="text-xl font-black text-white/90 break-words">{issue.title}</h1>
          {issue.culprit && (
            <p className="text-sm text-white/40 mt-1 font-mono break-all">{issue.culprit}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => act("resolve")}
            disabled={acting}
            className="px-3 py-1.5 rounded-lg bg-[#c8ff00]/10 text-[#c8ff00] text-xs font-bold border border-[#c8ff00]/20 hover:bg-[#c8ff00]/20 disabled:opacity-40 transition-colors"
          >
            ✓ Реши
          </button>
          <button
            onClick={() => act("ignore")}
            disabled={acting}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-bold border border-white/10 hover:bg-white/10 disabled:opacity-40 transition-colors"
          >
            Игнорирай
          </button>
          <a
            href={issue.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-bold border border-white/10 hover:bg-white/10 transition-colors"
          >
            Sentry ↗
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111] border border-white/6 rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Срещания</p>
          <p className="text-lg font-black mt-1">{issue.count}</p>
        </div>
        <div className="bg-[#111] border border-white/6 rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Засегнати users</p>
          <p className="text-lg font-black mt-1">{issue.userCount}</p>
        </div>
        <div className="bg-[#111] border border-white/6 rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Първо срещане</p>
          <p className="text-xs font-bold mt-1 text-white/70">{formatDate(issue.firstSeen)}</p>
        </div>
        <div className="bg-[#111] border border-white/6 rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Последно</p>
          <p className="text-xs font-bold mt-1 text-white/70">{formatDate(issue.lastSeen)}</p>
        </div>
      </div>

      {!event ? (
        <div className="bg-[#111] border border-white/6 rounded-2xl p-6 text-center text-white/40 text-sm">
          Няма детайли за последното събитие
        </div>
      ) : (
        <>
          {/* User context */}
          {event.user && (event.user.email || event.user.id || event.user.username) && (
            <div className="bg-[#111] border border-white/6 rounded-2xl p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">👤 Потребител</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {event.user.email && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase">Email</p>
                    <p className="text-white/80 font-mono text-xs mt-0.5 break-all">{event.user.email}</p>
                  </div>
                )}
                {event.user.username && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase">Име</p>
                    <p className="text-white/80 text-xs mt-0.5">{event.user.username}</p>
                  </div>
                )}
                {event.user.id && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase">Clerk ID</p>
                    <p className="text-white/80 font-mono text-xs mt-0.5 break-all">{event.user.id}</p>
                  </div>
                )}
                {event.user.ip_address && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase">IP</p>
                    <p className="text-white/80 font-mono text-xs mt-0.5">{event.user.ip_address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Browser / URL */}
          <div className="bg-[#111] border border-white/6 rounded-2xl p-5 space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30">🌐 Контекст</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {event.request?.url && (
                <div className="sm:col-span-2">
                  <p className="text-[10px] text-white/30 uppercase">URL</p>
                  <p className="text-white/80 font-mono text-xs mt-0.5 break-all">
                    {event.request.method && <span className="text-[#c8ff00] mr-2">{event.request.method}</span>}
                    {event.request.url}
                  </p>
                </div>
              )}
              {event.contexts?.browser && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase">Браузър</p>
                  <p className="text-white/80 text-xs mt-0.5">
                    {event.contexts.browser.name} {event.contexts.browser.version}
                  </p>
                </div>
              )}
              {event.contexts?.os && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase">OS</p>
                  <p className="text-white/80 text-xs mt-0.5">
                    {event.contexts.os.name} {event.contexts.os.version}
                  </p>
                </div>
              )}
              {event.contexts?.device && (event.contexts.device.family || event.contexts.device.model) && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase">Устройство</p>
                  <p className="text-white/80 text-xs mt-0.5">
                    {event.contexts.device.family} {event.contexts.device.model}
                  </p>
                </div>
              )}
              {event.contexts?.runtime && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase">Runtime</p>
                  <p className="text-white/80 text-xs mt-0.5">
                    {event.contexts.runtime.name} {event.contexts.runtime.version}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stack trace */}
          {exceptions.length > 0 && (
            <div className="bg-[#111] border border-white/6 rounded-2xl p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">🔥 Stack trace</h2>
              {exceptions.map((exc, i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <p className="font-mono text-xs text-red-400">
                      <span className="font-bold">{exc.type}</span>: {exc.value}
                    </p>
                  </div>
                  <div className="space-y-1 mt-3">
                    {(exc.stacktrace?.frames ?? [])
                      .slice()
                      .reverse()
                      .slice(0, 15)
                      .map((f, j) => (
                        <div
                          key={j}
                          className={`font-mono text-[11px] px-3 py-1.5 rounded border ${
                            f.inApp
                              ? "bg-white/4 border-white/10 text-white/75"
                              : "bg-white/2 border-white/5 text-white/35"
                          }`}
                        >
                          <span className="text-[#c8ff00]">{f.function ?? "<anonymous>"}</span>
                          <span className="text-white/30"> at </span>
                          <span>{f.filename}</span>
                          {f.lineNo !== undefined && <span className="text-white/40">:{f.lineNo}</span>}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="bg-[#111] border border-white/6 rounded-2xl p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
                🍞 Breadcrumbs — какво е правил user-ът преди
              </h2>
              <div className="space-y-1">
                {breadcrumbs.slice(-20).map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-1.5 px-2 rounded text-xs font-mono border-l-2 border-white/10"
                  >
                    <span className="text-white/25 flex-shrink-0 w-16">
                      {b.timestamp ? new Date(b.timestamp * 1000).toLocaleTimeString("bg-BG") : ""}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold flex-shrink-0 ${
                        b.level === "error"
                          ? "bg-red-500/15 text-red-400"
                          : b.level === "warning"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {b.category ?? b.type ?? "log"}
                    </span>
                    <span className="text-white/60 break-all">{b.message ?? ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="bg-[#111] border border-white/6 rounded-2xl p-5">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">🏷 Тагове</h2>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map(([k, v], i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-white/5 border border-white/8 rounded px-2 py-1 text-[11px] font-mono"
                  >
                    <span className="text-white/40">{k}:</span>
                    <span className="text-white/80">{v}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
