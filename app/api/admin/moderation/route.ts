import { NextResponse } from "next/server";
import { requireAdmin, supabase, logAdminAction } from "../helpers";

// GET — moderation log + banned/muted list
export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { data: logs } = await supabase
    .from("chat_moderation_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({ logs: logs ?? [] });
}

// POST — log a moderation action (called from chat component)
export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { action, target_user_id, target_user_name, message_id, reason } = await req.json();

  if (!action || !target_user_id) {
    return NextResponse.json({ error: "action and target_user_id required" }, { status: 400 });
  }

  await supabase.from("chat_moderation_logs").insert({
    admin_id: adminCheck.userId,
    admin_email: adminCheck.email,
    action,
    target_user_id,
    target_user_name: target_user_name ?? null,
    message_id: message_id ?? null,
    reason: reason ?? null,
  });

  await logAdminAction(adminCheck.userId!, adminCheck.email!, `chat.${action}`, target_user_name ?? target_user_id, { message_id, reason });

  return NextResponse.json({ ok: true });
}
