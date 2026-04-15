import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin, supabase } from "../helpers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  // Members stats
  const { data: members } = await supabase.from("members").select("*");
  const totalMembers = members?.length ?? 0;
  const activeMembers = members?.filter((m) => m.status === "active").length ?? 0;
  const cancelledMembers = members?.filter((m) => m.status === "cancelled").length ?? 0;

  const planCounts: Record<string, number> = {};
  for (const m of members ?? []) {
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

  return NextResponse.json({
    totalMembers,
    activeMembers,
    cancelledMembers,
    planCounts,
    totalLessonsCompleted: totalLessonsCompleted ?? 0,
    mrr: Math.round(mrr * 100) / 100,
    recentCharges,
  });
}
