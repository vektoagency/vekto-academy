import { NextResponse } from "next/server";
import { requireAdmin, supabase, logAdminAction } from "../helpers";

export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { data, error } = await supabase
    .from("job_profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const client = adminCheck.client!;
  const userIds = Array.from(new Set((data ?? []).map((p) => p.user_id)));
  const users = await Promise.all(
    userIds.map(async (uid) => {
      try {
        const u = await client.users.getUser(uid);
        const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
        const email = u.emailAddresses[0]?.emailAddress ?? "";
        return [uid, { name: name || email || uid, email }] as const;
      } catch {
        return [uid, { name: uid, email: "" }] as const;
      }
    })
  );
  const userMap = Object.fromEntries(users);

  const enriched = (data ?? []).map((p) => ({
    ...p,
    user_name: userMap[p.user_id]?.name ?? p.user_id,
    user_email: userMap[p.user_id]?.email ?? "",
  }));

  return NextResponse.json({ data: enriched });
}

export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { user_id, action } = await req.json();
  if (!user_id || !action) {
    return NextResponse.json({ error: "user_id and action required" }, { status: 400 });
  }

  const allowed = ["reviewed", "accepted", "rejected", "draft"];
  if (!allowed.includes(action)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const { error } = await supabase
    .from("job_profiles")
    .update({ status: action, updated_at: new Date().toISOString() })
    .eq("user_id", user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(adminCheck.userId!, adminCheck.email!, `jobs.${action}`, user_id);
  return NextResponse.json({ ok: true });
}
