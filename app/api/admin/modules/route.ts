import { NextResponse } from "next/server";
import { requireAdmin, supabase, logAdminAction } from "../helpers";

// GET — all modules
export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .order("order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — create or update module
export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const body = await req.json();
  const { id, title, description, video_url, duration, order, available } = body;

  if (id) {
    const { error } = await supabase
      .from("modules")
      .update({ title, description, video_url, duration, order, available, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAdminAction(adminCheck.userId!, adminCheck.email!, "module.update", title, { id });
  } else {
    const { error } = await supabase
      .from("modules")
      .insert({ title, description, video_url, duration, order, available: available ?? false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAdminAction(adminCheck.userId!, adminCheck.email!, "module.create", title);
  }

  return NextResponse.json({ ok: true });
}

// PATCH — reorder modules
export async function PATCH(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { order } = await req.json() as { order: { id: number; order: number }[] };
  if (!order?.length) return NextResponse.json({ error: "order required" }, { status: 400 });

  for (const item of order) {
    await supabase.from("modules").update({ order: item.order }).eq("id", item.id);
  }

  await logAdminAction(adminCheck.userId!, adminCheck.email!, "module.reorder", null, { count: order.length });
  return NextResponse.json({ ok: true });
}

// DELETE — remove module
export async function DELETE(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data: mod } = await supabase.from("modules").select("title").eq("id", id).single();
  const { error } = await supabase.from("modules").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(adminCheck.userId!, adminCheck.email!, "module.delete", mod?.title ?? `#${id}`);
  return NextResponse.json({ ok: true });
}
