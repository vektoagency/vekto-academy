import { NextResponse } from "next/server";
import { requireAdmin } from "../helpers";

type SentryIssue = {
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
  metadata?: { value?: string; type?: string };
};

export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const token = process.env.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT ?? "vekto-academy";

  if (!token || !org) {
    return NextResponse.json({
      configured: false,
      issues: [],
    });
  }

  try {
    const url = `https://sentry.io/api/0/projects/${org}/${project}/issues/?query=is:unresolved&limit=25&statsPeriod=14d`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({
        configured: true,
        error: `Sentry API: ${res.status}`,
        issues: [],
      });
    }

    const issues = (await res.json()) as SentryIssue[];
    return NextResponse.json({
      configured: true,
      issues: issues.map((i) => ({
        id: i.id,
        shortId: i.shortId,
        title: i.title,
        culprit: i.culprit,
        level: i.level,
        status: i.status,
        count: Number(i.count),
        userCount: i.userCount,
        firstSeen: i.firstSeen,
        lastSeen: i.lastSeen,
        permalink: i.permalink,
        value: i.metadata?.value ?? null,
        type: i.metadata?.type ?? null,
      })),
    });
  } catch (e) {
    return NextResponse.json({
      configured: true,
      error: e instanceof Error ? e.message : "Unknown error",
      issues: [],
    });
  }
}
