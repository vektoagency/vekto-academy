import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: challenges } = await supabase
    .from("challenges")
    .select("id, title, prize, status, winner_submission_id, created_at")
    .in("status", ["ended"])
    .not("winner_submission_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!challenges || challenges.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const { data: counts } = await supabase
    .from("arena_submissions")
    .select("challenge_id")
    .in("challenge_id", challenges.map((c) => c.id));

  const countMap = new Map<number, number>();
  (counts ?? []).forEach((r) => {
    countMap.set(r.challenge_id, (countMap.get(r.challenge_id) ?? 0) + 1);
  });

  const winnerIds = challenges
    .map((c) => c.winner_submission_id)
    .filter((x): x is number => !!x);
  const { data: winners } = await supabase
    .from("arena_submissions")
    .select("id, user_id")
    .in("id", winnerIds);

  const client = await clerkClient();
  const userIds = Array.from(new Set((winners ?? []).map((w) => w.user_id)));
  const userMap: Record<string, string> = {};
  await Promise.all(
    userIds.map(async (uid) => {
      try {
        const u = await client.users.getUser(uid);
        const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
        userMap[uid] = name || u.emailAddresses[0]?.emailAddress || uid;
      } catch {
        userMap[uid] = uid;
      }
    })
  );

  const winnerMap = new Map<number, string>();
  (winners ?? []).forEach((w) => winnerMap.set(w.id, userMap[w.user_id] ?? w.user_id));

  const data = challenges.map((c, i) => ({
    num: i + 1,
    id: c.id,
    title: c.title,
    prize: c.prize ?? "—",
    winner: c.winner_submission_id ? winnerMap.get(c.winner_submission_id) ?? "—" : "—",
    entries: countMap.get(c.id) ?? 0,
  }));

  return NextResponse.json({ data });
}
