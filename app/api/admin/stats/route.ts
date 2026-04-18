import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin, supabase } from "../helpers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  // Live Clerk user IDs — used to skip orphaned Supabase rows
  const clerkUsers = await adminCheck.client!.users.getUserList({ limit: 500 });
  const liveUserIds = new Set(clerkUsers.data.map((u) => u.id));

  // Members stats (ignore rows whose Clerk user has been deleted)
  const { data: allMembers } = await supabase.from("members").select("*");
  const members = (allMembers ?? []).filter((m) => liveUserIds.has(m.user_id));
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === "active").length;
  const cancelledMembers = members.filter((m) => m.status === "cancelled").length;

  const planCounts: Record<string, number> = {};
  for (const m of members) {
    if (m.plan) planCounts[m.plan] = (planCounts[m.plan] || 0) + 1;
  }

  // Progress stats
  const { count: totalLessonsCompleted } = await supabase
    .from("module_progress")
    .select("*", { count: "exact", head: true })
    .eq("completed", true);

  // Stripe revenue (last 30 days)
  let mrr = 0;
  let recentCharges: { amount: number; currency: string; date: number; email: string | null }[] = [];

  try {
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 86400;

    // Active subscriptions for MRR
    const subs = await stripe.subscriptions.list({ status: "active", limit: 100 });
    for (const sub of subs.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        if (price.recurring?.interval === "month") {
          mrr += (price.unit_amount ?? 0) / 100;
        } else if (price.recurring?.interval === "year") {
          mrr += (price.unit_amount ?? 0) / 100 / 12;
        }
      }
    }

    // Recent charges
    const charges = await stripe.charges.list({
      limit: 10,
      created: { gte: thirtyDaysAgo },
    });
    recentCharges = charges.data
      .filter((c) => c.status === "succeeded")
      .map((c) => ({
        amount: c.amount / 100,
        currency: c.currency,
        date: c.created,
        email: c.billing_details?.email ?? null,
      }));
  } catch {
    // Stripe may not be configured yet
  }

  // Activity windows
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const thirtyDaysAgoIso = new Date(Date.now() - 30 * 86400000).toISOString();

  // WAU — distinct users with progress update in last 7d
  const { data: recentProgress } = await supabase
    .from("module_progress")
    .select("user_id")
    .gte("updated_at", sevenDaysAgo);
  const wau = new Set((recentProgress ?? []).map((r) => r.user_id)).size;

  // Lessons completed this week
  const { count: lessonsThisWeek } = await supabase
    .from("module_progress")
    .select("*", { count: "exact", head: true })
    .eq("completed", true)
    .gte("updated_at", sevenDaysAgo);

  // New members this week / this month
  const { count: newMembersWeek } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo);
  const { count: newMembersMonth } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgoIso);

  // Arena activity
  const { count: totalSubmissions } = await supabase
    .from("arena_submissions")
    .select("*", { count: "exact", head: true });
  const { count: submissionsThisWeek } = await supabase
    .from("arena_submissions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo);

  // Jobs pipeline pending review
  const { count: jobsPending } = await supabase
    .from("job_profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted");

  return NextResponse.json({
    totalMembers,
    activeMembers,
    cancelledMembers,
    planCounts,
    totalLessonsCompleted: totalLessonsCompleted ?? 0,
    mrr: Math.round(mrr * 100) / 100,
    recentCharges,
    // extended
    wau,
    lessonsThisWeek: lessonsThisWeek ?? 0,
    newMembersWeek: newMembersWeek ?? 0,
    newMembersMonth: newMembersMonth ?? 0,
    totalSubmissions: totalSubmissions ?? 0,
    submissionsThisWeek: submissionsThisWeek ?? 0,
    jobsPending: jobsPending ?? 0,
  });
}
