import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STREAM_SECRET = process.env.STREAM_SECRET!;

// Short channel id → human label for notification title
const CHANNEL_LABELS: Record<string, string> = {
  general: "chat",
  intro: "introduce",
  projects: "show-your-work",
  tools: "tools",
  questions: "questions",
  work: "work",
};

function verify(body: string, signature: string | null): boolean {
  if (!signature || !STREAM_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", STREAM_SECRET)
    .update(body)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

type StreamUser = { id: string; name?: string };
type StreamMessage = {
  id: string;
  text?: string;
  user?: StreamUser;
  mentioned_users?: StreamUser[];
};

export async function POST(req: Request) {
  const body = await req.text();
  const h = await headers();
  const sig = h.get("x-signature");

  if (!verify(body, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    type: string;
    cid?: string;
    channel_id?: string;
    channel_type?: string;
    message?: StreamMessage;
  };

  if (event.type !== "message.new") {
    return NextResponse.json({ received: true });
  }

  const msg = event.message;
  if (!msg?.mentioned_users?.length) {
    return NextResponse.json({ received: true });
  }

  const senderId = msg.user?.id;
  const senderName = msg.user?.name ?? "Някой";
  const channelId = event.channel_id ?? "";
  const shortId = channelId.startsWith("vekto-")
    ? channelId.slice("vekto-".length)
    : null;
  const label = shortId ? CHANNEL_LABELS[shortId] ?? shortId : "Vekto Team";
  const link = shortId
    ? `/dashboard?tab=community&ch=${shortId}`
    : `/dashboard?tab=community&dm=1`;

  const preview = (msg.text ?? "").slice(0, 140);

  const rows = msg.mentioned_users
    .filter((u) => u.id && u.id !== senderId)
    .map((u) => ({
      user_id: u.id,
      type: "mention" as const,
      title: `${senderName} те спомена в #${label}`,
      body: preview || "Имаш ново съобщение",
      link,
      read: false,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ received: true });
  }

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, inserted: rows.length });
}
