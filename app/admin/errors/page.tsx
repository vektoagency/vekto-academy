"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "../PageHeader";

type Issue = {
  id: string;
  shortId: string;
  title: string;
  culprit: string;
  level: string;
  status: string;
  count: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  permalink: string;
  value: string | null;
  type: string | null;
};

type ErrorsResp = {
  configured: boolean;
  issues: Issue[];
  error?: string;
};

const levelColor: Record<string, string> = {
  fatal: "text-red-500 bg-red-500/10 border-red-500/30",
  error: "text-red-400 bg-red-500/5 border-red-500/20",
  warning: "text-amber-400 bg-amber-500/5 border-amber-500/20",
  info: "text-blue-400 bg-blue-500/5 border-blue-500/20",
  debug: "text-white/40 bg-white/5 border-white/10",
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}с`;
  if (diff < 3600) return `${Math.floor(diff / 60)}м`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ч`;
  return `${Math.floor(diff / 86400)}д`;
}

export default function ErrorsPage() {
  const [data, setData] = useState<ErrorsResp | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/errors");
      setData(await r.json());
    } catch {
      setData({ configured: false, issues: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#c8ff00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.configured) {
    return (
      <div className="space-y-6">
        <PageHeader title="Грешки" subtitle="Production грешки от Sentry" icon="🚨" />
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
          <p className="text-sm font-bold text-amber-400 mb-2">⚠ Sentry не е конфигуриран</p>
          <p className="text-sm text-white/50 mb-4">
            За да видиш грешките тук, добави тези env vars в Vercel:
          </p>
          <ul className="space-y-2 text-sm text-white/60 font-mono">
            <li>
              <code className="bg-white/5 px-2 py-0.5 rounded">SENTRY_AUTH_TOKEN</code>
              <span className="text-white/30 ml-2 font-sans">— от sentry.io → Settings → Auth Tokens</span>
            </li>
            <li>
              <code className="bg-white/5 px-2 py-0.5 rounded">SENTRY_ORG</code>
              <span className="text-white/30 ml-2 font-sans">— org slug (от URL в Sentry)</span>
            </li>
            <li>
              <code className="bg-white/5 px-2 py-0.5 rounded">SENTRY_PROJECT</code>
              <span className="text-white/30 ml-2 font-sans">— project slug (default: vekto-academy)</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Грешки"
        subtitle={
          data.issues.length === 0
            ? "Няма нерешени грешки — всичко работи"
            : `${data.issues.length} нерешени грешки от последните 14 дни`
        }
        icon="🚨"
        actions={
          <button
            onClick={load}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            ↻ Обнови
          </button>
        }
      />

      {data.error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          {data.error}
        </div>
      )}

      {data.issues.length === 0 ? (
        <div className="bg-[#111] border border-white/6 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-white/60 font-semibold">Няма грешки</p>
          <p className="text-white/30 text-sm mt-1">Платформата работи без проблеми</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/admin/errors/${issue.id}`}
              className="block bg-[#111] border border-white/6 rounded-xl p-4 hover:border-white/15 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border flex-shrink-0 ${
                    levelColor[issue.level] ?? levelColor.error
                  }`}
                >
                  {issue.level}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/90 truncate">{issue.title}</p>
                  {issue.culprit && (
                    <p className="text-xs text-white/40 mt-0.5 font-mono truncate">{issue.culprit}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-white/35">
                    <span>
                      <span className="text-white/60 font-semibold">{issue.count}</span> пъти
                    </span>
                    <span>
                      <span className="text-white/60 font-semibold">{issue.userCount}</span> user
                      {issue.userCount === 1 ? "" : "и"}
                    </span>
                    <span>последно преди {timeAgo(issue.lastSeen)}</span>
                  </div>
                </div>
                <span className="text-white/20 text-xs flex-shrink-0">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
