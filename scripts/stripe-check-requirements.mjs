import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
  const account = await stripe.accounts.retrieve();
  console.log("Charges enabled:", account.charges_enabled);
  console.log("Payouts enabled:", account.payouts_enabled);
  console.log("Details submitted:", account.details_submitted);

  console.log("\n── Requirements ──");
  const req = account.requirements || {};
  console.log("Currently due:", req.currently_due);
  console.log("Eventually due:", req.eventually_due);
  console.log("Past due:", req.past_due);
  console.log("Pending verification:", req.pending_verification);
  console.log("Disabled reason:", req.disabled_reason);
  if (req.current_deadline) console.log("Deadline:", new Date(req.current_deadline * 1000).toISOString());

  console.log("\n── Future requirements ──");
  const fr = account.future_requirements || {};
  console.log("Currently due:", fr.currently_due);
  console.log("Disabled reason:", fr.disabled_reason);
}

run().catch((e) => { console.error(e); process.exit(1); });
