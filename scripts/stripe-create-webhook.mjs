import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
  const url = "https://vektoacademy.com/api/stripe/webhook";
  const enabled_events = [
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
  ];

  console.log("→ Checking existing webhooks...");
  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  for (const ep of existing.data) {
    if (ep.url === url) {
      console.log(`  ⚠ Found existing webhook for ${url} (${ep.id}) — deleting to recreate fresh`);
      await stripe.webhookEndpoints.del(ep.id);
    }
  }

  console.log(`→ Creating webhook → ${url}`);
  const ep = await stripe.webhookEndpoints.create({
    url,
    enabled_events,
    description: "Vekto Academy production webhook",
  });

  console.log(`  ✓ created ${ep.id}`);
  console.log(`\n=== RESULT ===`);
  console.log(`STRIPE_WEBHOOK_SECRET=${ep.secret}`);
}

run().catch((e) => {
  console.error("✗ ERROR:", e.message);
  process.exit(1);
});
