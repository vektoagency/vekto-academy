import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUNNY_API_KEY = process.env.BUNNY_API_KEY!;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Membership check
  const { data: member } = await supabase
    .from("members")
    .select("status")
    .eq("user_id", userId)
    .single();
  if (member?.status !== "active") {
    return NextResponse.json({ error: "Active plan required" }, { status: 403 });
  }

  const { challenge_id, filename } = await req.json();
  if (!challenge_id) {
    return NextResponse.json({ error: "challenge_id required" }, { status: 400 });
  }

  // Challenge must be active
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

  // Create video shell in Bunny
  const safeName = String(filename ?? "submission").slice(0, 80).replace(/[^\w.\- ]/g, "_");
  const title = `Arena #${challenge_id} · ${userId.slice(-6)} · ${safeName}`;

  const createRes = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
    method: "POST",
    headers: {
      AccessKey: BUNNY_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    return NextResponse.json({ error: "Bunny create failed", details: text }, { status: 502 });
  }

  const created = (await createRes.json()) as { guid: string };
  const videoId = created.guid;

  // Sign for TUS upload — expires in 1 hour
  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const signature = crypto
    .createHash("sha256")
    .update(`${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expirationTime}${videoId}`)
    .digest("hex");

  return NextResponse.json({
    videoId,
    libraryId: BUNNY_LIBRARY_ID,
    expirationTime,
    signature,
    title,
  });
}
