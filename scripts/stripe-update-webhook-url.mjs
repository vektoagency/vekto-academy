import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
  const correctUrl = "https://vektoacademy.com/api/stripe/webhook";
  const list = await stripe.webhookEndpoints.list({ limit: 100 });

  console.log("Current webhooks:");
  for (const ep of list.data) {
    console.log(`  ${ep.id} → ${ep.url} (${ep.status})`);
  }

  // Find ours — either the correct URL or old /api/webhook
  const target = list.data.find((ep) =>
    ep.url === correctUrl || ep.url === "https://vektoacademy.com/api/webhook"
  );

  if (!target) {
    console.log("No matching webhook found.");
    return;
  }

  if (target.url === correctUrl) {
    console.log(`\n✓ Already correct: ${target.id} → ${target.url}`);
    return;
  }

  console.log(`\n→ Updating ${target.id}: ${target.url} → ${correctUrl}`);
  await stripe.webhookEndpoints.update(target.id, { url: correctUrl });
  console.log("  ✓ updated");
}

run().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
