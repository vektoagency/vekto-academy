import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { userId } = await auth();

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, title, description, deadline, prize, status, winner_submission_id")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!challenge) {
    return NextResponse.json({ challenge: null, submission: null });
  }

  let submission = null;
  if (userId) {
    const { data } = await supabase
      .from("arena_submissions")
      .select("id, bunny_video_id, notes, status, feedback, created_at")
      .eq("challenge_id", challenge.id)
      .eq("user_id", userId)
      .maybeSingle();
    submission = data;
  }

  return NextResponse.json({ challenge, submission });
}
