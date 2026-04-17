import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("job_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const specialty = String(body.specialty ?? "").slice(0, 120).trim();
  const bio = String(body.bio ?? "").slice(0, 1000).trim();
  const portfolio_url = String(body.portfolio_url ?? "").slice(0, 500).trim();
  const social_url = String(body.social_url ?? "").slice(0, 500).trim();
  const submit = Boolean(body.submit);

  const status = submit ? "submitted" : "draft";

  const { error } = await supabase.from("job_profiles").upsert(
    {
      user_id: userId,
      specialty,
      bio,
      portfolio_url,
      social_url,
      status,
      submitted_at: submit ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status });
}
