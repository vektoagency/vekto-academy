import { NextResponse } from "next/server";
import { requireAdmin } from "../../helpers";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { id } = await ctx.params;
  const token = process.env.SENTRY_AUTH_TOKEN;
  const region = process.env.SENTRY_REGION ?? "us";
  const host = region === "de" ? "de.sentry.io" : "sentry.io";

  if (!token) {
    return NextResponse.json({ configured: false });
  }

  try {
    const [issueRes, eventRes] = await Promise.all([
      fetch(`https://${host}/api/0/issues/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`https://${host}/api/0/issues/${id}/events/latest/`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    if (!issueRes.ok) {
      return NextResponse.json({ error: `Sentry: ${issueRes.status}` }, { status: issueRes.status });
    }

    const issue = await issueRes.json();
    const event = eventRes.ok ? await eventRes.json() : null;

    return NextResponse.json({ configured: true, issue, event });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Mark issue as resolved
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { id } = await ctx.params;
  const { action } = await req.json();
  const token = process.env.SENTRY_AUTH_TOKEN;
  const region = process.env.SENTRY_REGION ?? "us";
  const host = region === "de" ? "de.sentry.io" : "sentry.io";

  if (!token) return NextResponse.json({ error: "Sentry not configured" }, { status: 400 });

  const status = action === "resolve" ? "resolved" : action === "ignore" ? "ignored" : null;
  if (!status) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const res = await fetch(`https://${host}/api/0/issues/${id}/`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) return NextResponse.json({ error: `Sentry: ${res.status}` }, { status: res.status });
  return NextResponse.json({ ok: true });
}
