import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, getAdminEmails, templates } from "@/app/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const isAdmin = (clerkUser.publicMetadata as Record<string, string>)?.role === "admin";

  if (!isAdmin) {
    const { data: member } = await supabase
      .from("members")
      .select("status")
      .eq("user_id", userId)
      .single();
    if (member?.status !== "active") {
      return NextResponse.json({ error: "Active plan required" }, { status: 403 });
    }
  }

  const { challenge_id, bunny_video_id, notes } = await req.json();
  if (!challenge_id || !bunny_video_id) {
    return NextResponse.json({ error: "challenge_id and bunny_video_id required" }, { status: 400 });
  }

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, title, status")
    .eq("id", challenge_id)
    .single();
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }
  if (challenge.status !== "active") {
    return NextResponse.json({ error: "Challenge not accepting submissions" }, { status: 400 });
  }

  const safeNotes = String(notes ?? "").slice(0, 1000);

  const { data: existing } = await supabase
    .from("arena_submissions")
    .select("id")
    .eq("challenge_id", challenge_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await supabase
      .from("arena_submissions")
      .update({
        bunny_video_id,
        notes: safeNotes,
        status: "submitted",
        created_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ submission: updated });
  }

  const { data: created, error } = await supabase
    .from("arena_submissions")
    .insert({
      challenge_id,
      user_id: userId,
      bunny_video_id,
      notes: safeNotes,
      status: "submitted",
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify admins of new submission (best-effort, don't block)
  const admins = await getAdminEmails();
  if (admins.length) {
    const client = await clerkClient();
    const u = await client.users.getUser(userId).catch(() => null);
    const userName = u
      ? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.emailAddresses[0]?.emailAddress || userId
      : userId;
    await sendEmail(admins, `Ново предаване в Арена — ${challenge.title}`, templates.newSubmission(challenge.title, userName, safeNotes));
  }

  return NextResponse.json({ submission: created });
}
