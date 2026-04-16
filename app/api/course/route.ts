import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data: modules, error: mErr } = await supabase
    .from("course_modules")
    .select("*")
    .order("sort_order", { ascending: true });

  if (mErr) return Response.json({ error: mErr.message }, { status: 500 });

  const { data: lessons, error: lErr } = await supabase
    .from("course_lessons")
    .select("*")
    .order("sort_order", { ascending: true });

  if (lErr) return Response.json({ error: lErr.message }, { status: 500 });

  const course = (modules ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    emoji: m.emoji,
    lessons: (lessons ?? [])
      .filter((l) => l.module_id === m.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        bunnyId: l.bunny_id,
      })),
  }));

  return Response.json({ data: course });
}
