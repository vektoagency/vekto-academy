import { NextResponse } from "next/server";
import { requireAdmin, supabase, logAdminAction } from "../helpers";

// GET — full course structure for admin
export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { data: modules } = await supabase
    .from("course_modules")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("*")
    .order("sort_order", { ascending: true });

  return NextResponse.json({ modules: modules ?? [], lessons: lessons ?? [] });
}

// PATCH — update a lesson (bunny_id, title, duration)
export async function PATCH(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { id, bunny_id, title, duration } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, string> = {};
  if (bunny_id !== undefined) updates.bunny_id = bunny_id;
  if (title !== undefined) updates.title = title;
  if (duration !== undefined) updates.duration = duration;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("course_lessons")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(adminCheck.userId!, adminCheck.email!, "course.lesson.update", id, updates);
  return NextResponse.json({ ok: true });
}

// POST — add a new lesson
export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { id, module_id, title, duration, bunny_id, sort_order } = await req.json();
  if (!id || module_id === undefined || !title) {
    return NextResponse.json({ error: "id, module_id, title required" }, { status: 400 });
  }

  const { error } = await supabase.from("course_lessons").insert({
    id,
    module_id,
    title,
    duration: duration ?? "0:00",
    bunny_id: bunny_id ?? "",
    sort_order: sort_order ?? 0,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(adminCheck.userId!, adminCheck.email!, "course.lesson.create", id, { title, module_id });
  return NextResponse.json({ ok: true });
}

// DELETE — remove a lesson
export async function DELETE(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("course_lessons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction(adminCheck.userId!, adminCheck.email!, "course.lesson.delete", id);
  return NextResponse.json({ ok: true });
}
