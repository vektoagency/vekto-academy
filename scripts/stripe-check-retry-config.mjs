import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
  console.log("→ Fetching account settings...");
  const account = await stripe.accounts.retrieve();

  console.log("\nAccount settings keys:", Object.keys(account.settings ?? {}));
  const settings = account.settings;
  console.log("\nFull settings object:");
  console.log(JSON.stringify(settings, null, 2));
}

run().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
