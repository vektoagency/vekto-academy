import { NextResponse } from "next/server";
import { requireAdmin, supabase } from "../helpers";

export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { client } = adminCheck;

  // Get all Clerk users
  const clerkUsers = await client!.users.getUserList({ limit: 100, orderBy: "-created_at" });

  // Get all members from Supabase
  const { data: members } = await supabase.from("members").select("*");

  // Get progress counts per user
  const { data: progress } = await supabase
    .from("module_progress")
    .select("user_id, completed");

  const progressMap: Record<string, number> = {};
  if (progress) {
    for (const p of progress) {
      if (p.completed) {
        progressMap[p.user_id] = (progressMap[p.user_id] || 0) + 1;
      }
    }
  }

  const membersMap: Record<string, Record<string, unknown>> = {};
  if (members) {
    for (const m of members) {
      membersMap[m.user_id] = m;
    }
  }

  const users = clerkUsers.data.map((u) => {
    const member = membersMap[u.id];
    return {
      id: u.id,
      email: u.emailAddresses[0]?.emailAddress ?? "",
      firstName: u.firstName,
      lastName: u.lastName,
      imageUrl: u.imageUrl,
      createdAt: u.createdAt,
      role: (u.publicMetadata as Record<string, string>)?.role ?? "user",
      plan: (member as Record<string, string>)?.plan ?? null,
      status: (member as Record<string, string>)?.status ?? null,
      completedLessons: progressMap[u.id] ?? 0,
    };
  });

  return NextResponse.json({ users });
}
