import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { sendEmail, templates } from "../../../lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Status model ────────────────────────────────────────────────
// active       — paid & current (full access)
// past_due     — payment failed, Stripe retrying (keeps access ~3 weeks)
// cancelled    — subscription ended or manually cancelled (no access)
// ─────────────────────────────────────────────────────────────────

async function updateByCustomer(customerId: string, patch: Record<string, unknown>) {
  await supabase
    .from("members")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", customerId);
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e) {
    console.error("Webhook signature verification failed:", (e as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Initial purchase (checkout completes) ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) break;

        await supabase.from("members").upsert(
          {
            user_id: userId,
            plan,
            status: "active",
            stripe_customer_id: (session.customer as string) ?? null,
            stripe_subscription_id: (session.subscription as string) ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      // ── Recurring payment succeeded (monthly renewal) ──
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        // Skip first invoice (handled by checkout.session.completed)
        if (invoice.billing_reason === "subscription_create") break;
        if (customerId) {
          await updateByCustomer(customerId, { status: "active" });
        }
        break;
      }

      // ── Recurring payment failed (card declined, expired, etc.) ──
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (!customerId) break;

        await updateByCustomer(customerId, { status: "past_due" });

        // Send our own Bulgarian email (Stripe also sends English auto-emails)
        // Throttle: only email on attempt 1 (urgent), 4 (reminder), 8 (final)
        // to avoid spamming customer across Stripe's 8 Smart Retries over 7 days.
        const email = invoice.customer_email;
        const attempt = invoice.attempt_count ?? 1;
        const shouldEmail = attempt === 1 || attempt === 4 || attempt >= 8;

        if (email && shouldEmail) {
          // Approximate days left based on Stripe Smart Retries ML-optimized timing
          const daysLeft = attempt === 1 ? 7 : attempt === 4 ? 3 : 0;
          const phase = attempt === 1 ? "initial" : attempt === 4 ? "reminder" : "final";
          const subjectMap = {
            initial: "⚠ Плащането не премина — обнови карта",
            reminder: `Напомняне: остават ${daysLeft} дни преди прекратяване`,
            final: "Последен опит — абонаментът се прекратява днес",
          };
          await sendEmail(
            email,
            subjectMap[phase],
            templates.paymentFailed(phase === "initial" ? 1 : phase === "reminder" ? 2 : 3, daysLeft)
          );
        }
        break;
      }

      // ── Subscription updated (status change, cancel scheduled, plan change) ──
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        if (!customerId) break;

        // Map Stripe status → our status
        let status: string;
        if (sub.status === "active" || sub.status === "trialing") status = "active";
        else if (sub.status === "past_due") status = "past_due";
        else if (sub.status === "canceled" || sub.status === "unpaid" || sub.status === "incomplete_expired") status = "cancelled";
        else status = "past_due";

        await updateByCustomer(customerId, { status });
        break;
      }

      // ── Subscription ended (fully cancelled, all retries exhausted, or period ended after cancel) ──
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        if (!customerId) break;

        await updateByCustomer(customerId, { status: "cancelled" });

        // Notify user that subscription is fully cancelled
        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer && !customer.deleted && customer.email) {
            await sendEmail(
              customer.email,
              "Абонаментът ти е прекратен",
              templates.subscriptionCancelled()
            );
          }
        } catch (e) {
          console.error("Failed to send cancellation email:", e);
        }
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error(`Webhook handler error for ${event.type}:`, e);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
