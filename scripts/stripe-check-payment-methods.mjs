import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
  const account = await stripe.accounts.retrieve();
  console.log("Account:", account.id, "| country:", account.country, "| default currency:", account.default_currency);
  console.log("\nCapabilities:");
  const caps = account.capabilities || {};
  for (const [k, v] of Object.entries(caps)) {
    console.log(`  ${k}: ${v}`);
  }

  console.log("\n→ Trying a test checkout session with price_1TNaS4PI3HVGptlI9MJXF9bC (monthly)...");
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: "price_1TNaS4PI3HVGptlI9MJXF9bC", quantity: 1 }],
      success_url: "https://vektoacademy.com/success",
      cancel_url: "https://vektoacademy.com/cancel",
      customer_email: "test@example.com",
    });
    console.log("  ✓ Session created:", session.id);
    console.log("  Payment method types:", session.payment_method_types);
  } catch (e) {
    console.log("  ✗", e.message);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
