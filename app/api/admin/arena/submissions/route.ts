import { NextResponse } from "next/server";
import { requireAdmin, supabase, logAdminAction } from "../../helpers";

// GET ?challenge_id= — list submissions for a challenge
export async function GET(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { searchParams } = new URL(req.url);
  const challengeId = searchParams.get("challenge_id");
  if (!challengeId) {
    return NextResponse.json({ error: "challenge_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("arena_submissions")
    .select("id, challenge_id, user_id, bunny_video_id, notes, status, feedback, created_at, reviewed_at")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — mark submission as winner / update status / set feedback
export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { submission_id, action, feedback } = await req.json();
  if (!submission_id) {
    return NextResponse.json({ error: "submission_id required" }, { status: 400 });
  }

  const { data: sub } = await supabase
    .from("arena_submissions")
    .select("id, challenge_id, user_id")
    .eq("id", submission_id)
    .single();
  if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  if (action === "winner") {
    const { error: updErr } = await supabase
      .from("arena_submissions")
      .update({ status: "winner", reviewed_at: new Date().toISOString(), feedback: feedback ?? null })
      .eq("id", submission_id);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    const { error: chErr } = await supabase
      .from("challenges")
      .update({ winner_submission_id: submission_id })
      .eq("id", sub.challenge_id);
    if (chErr) return NextResponse.json({ error: chErr.message }, { status: 500 });

    await logAdminAction(adminCheck.userId!, adminCheck.email!, "arena.winner", `submission ${submission_id}`, {
      challenge_id: sub.challenge_id,
      user_id: sub.user_id,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "reviewed" || action === "rejected") {
    const { error } = await supabase
      .from("arena_submissions")
      .update({ status: action, reviewed_at: new Date().toISOString(), feedback: feedback ?? null })
      .eq("id", submission_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logAdminAction(adminCheck.userId!, adminCheck.email!, `arena.${action}`, `submission ${submission_id}`);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
