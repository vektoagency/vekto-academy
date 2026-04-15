import { auth } from "@clerk/nextjs/server";
import { StreamChat } from "stream-chat";
import { NextResponse } from "next/server";

const serverClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_SECRET!
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = serverClient.createToken(userId);
  return NextResponse.json({ token });
}
