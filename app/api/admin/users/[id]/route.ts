import { NextResponse } from "next/server";
import { requireAdmin, supabase, logAdminAction } from "../../helpers";

// PATCH — update user role or membership
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { id } = await params;
  const body = await req.json();

  // Update role in Clerk
  if (body.role !== undefined) {
    await adminCheck.client!.users.updateUserMetadata(id, {
      publicMetadata: { role: body.role || undefined },
    });
    await logAdminAction(adminCheck.userId!, adminCheck.email!, body.role === "admin" ? "user.make_admin" : "user.remove_admin", id);
  }

  // Update plan/status in Supabase
  if (body.plan !== undefined || body.status !== undefined) {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.plan !== undefined) update.plan = body.plan;
    if (body.status !== undefined) update.status = body.status;

    await supabase.from("members").upsert(
      { user_id: id, ...update },
      { onConflict: "user_id" }
    );

    if (body.status === "cancelled") {
      await logAdminAction(adminCheck.userId!, adminCheck.email!, "user.cancel", id);
    } else if (body.plan) {
      await logAdminAction(adminCheck.userId!, adminCheck.email!, "user.grant_access", id, { plan: body.plan });
    }
  }

  return NextResponse.json({ ok: true });
}
