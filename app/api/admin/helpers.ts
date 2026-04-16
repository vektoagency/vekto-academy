import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function requireAdmin() {
  const session = await auth();
  if (!session.userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const client = await clerkClient();
  const user = await client.users.getUser(session.userId);
  const role = (user.publicMetadata as Record<string, string>)?.role;

  if (role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { userId: session.userId, client, email: user.emailAddresses[0]?.emailAddress ?? session.userId };
}

export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  target: string | null = null,
  details: Record<string, unknown> | null = null
) {
  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    admin_email: adminEmail,
    action,
    target,
    details,
  });
}
