import { auth, clerkClient } from "@clerk/nextjs/server";
import { StreamChat } from "stream-chat";
import { NextResponse } from "next/server";

const serverClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_SECRET!
);

const PUBLIC_CHANNELS = [
  "general",
  "intro",
  "projects",
  "tools",
  "questions",
  "work",
];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as Record<string, string>)?.role;
  const isAdmin = role === "admin";

  // Upsert user in Stream with correct role
  await serverClient.upsertUser({
    id: userId,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Потребител",
    image: user.imageUrl,
    role: isAdmin ? "admin" : "user",
  });

  // Ensure user is a member of every public channel so @mention autocomplete
  // can surface them. Runs idempotently on each token fetch.
  await Promise.all(
    PUBLIC_CHANNELS.map(async (id) => {
      const channel = serverClient.channel("messaging", `vekto-${id}`, {
        created_by_id: userId,
      });
      try {
        await channel.create();
      } catch { /* already exists */ }
      try {
        await channel.addMembers([userId]);
      } catch { /* already a member */ }
    })
  );

  const token = serverClient.createToken(userId);
  return NextResponse.json({ token, isAdmin });
}
