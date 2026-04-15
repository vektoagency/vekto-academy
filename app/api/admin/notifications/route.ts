import { NextResponse } from "next/server";
import { requireAdmin, supabase } from "../helpers";

// GET — all notifications (latest 50)
export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — send notification to user(s)
export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { userIds, title, body, type, link } = await req.json();

  if (!title || !body) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  // userIds can be an array of user IDs, or "all" to send to all members
  let targetIds: string[] = [];

  if (userIds === "all") {
    const { data: members } = await supabase.from("members").select("user_id").eq("status", "active");
    targetIds = members?.map((m) => m.user_id) ?? [];
  } else if (Array.isArray(userIds) && userIds.length > 0) {
    targetIds = userIds;
  } else {
    return NextResponse.json({ error: "userIds required (array or 'all')" }, { status: 400 });
  }

  const rows = targetIds.map((uid) => ({
    user_id: uid,
    type: type || "system",
    title,
    body,
    link: link || null,
    read: false,
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, sent: targetIds.length });
}
