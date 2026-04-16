import { NextResponse } from "next/server";
import { requireAdmin, supabase, logAdminAction } from "../helpers";

// GET — all challenges
export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — create or update challenge
export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const body = await req.json();
  const { id, title, description, deadline, prize, status } = body;

  if (id) {
    const { error } = await supabase
      .from("challenges")
      .update({ title, description, deadline, prize, status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAdminAction(adminCheck.userId!, adminCheck.email!, "arena.update", title, { id });
  } else {
    const { error } = await supabase
      .from("challenges")
      .insert({ title, description, deadline, prize, status: status ?? "active" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAdminAction(adminCheck.userId!, adminCheck.email!, "arena.create", title);
  }

  return NextResponse.json({ ok: true });
}

// DELETE
export async function DELETE(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data: ch } = await supabase.from("challenges").select("title").eq("id", id).single();
  const { error } = await supabase.from("challenges").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(adminCheck.userId!, adminCheck.email!, "arena.delete", ch?.title ?? `#${id}`);
  return NextResponse.json({ ok: true });
}
