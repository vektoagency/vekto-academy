import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const TARGET_MONTHLY = 5900; // €59.00
const TARGET_LIFETIME = 34900; // €349.00

async function run() {
  console.log("→ Listing all products...");
  const all = await stripe.products.list({ limit: 100, active: true });

  const monthly = all.data.find((p) => /месечен|monthly/i.test(p.name));
  const lifetime = all.data.find((p) => /lifetime|доживотен/i.test(p.name));
  const yearly = all.data.find((p) => /годишен|yearly/i.test(p.name));
  const generic = all.data.find(
    (p) => p.name.trim().toLowerCase() === "vekto academy"
  );

  const MONTHLY_NAME = "Месечен абонамент";
  const LIFETIME_NAME = "Доживотен достъп";

  console.log("  monthly:", monthly?.id, monthly?.name);
  console.log("  lifetime:", lifetime?.id, lifetime?.name);
  console.log("  yearly:", yearly?.id, yearly?.name);
  console.log("  generic:", generic?.id, generic?.name);

  // 1. Archive generic "Vekto Academy" (duplicate)
  if (generic) {
    console.log(`\n→ Archiving duplicate "${generic.name}" (${generic.id})...`);
    await stripe.products.update(generic.id, { active: false });
    console.log("  ✓ archived");
  }

  // 2. Archive yearly product entirely (archive product first to clear default_price lock)
  if (yearly) {
    console.log(`\n→ Archiving yearly "${yearly.name}" (${yearly.id})...`);
    await stripe.products.update(yearly.id, { active: false });
    console.log("  ✓ product archived");
    const yprices = await stripe.prices.list({ product: yearly.id, limit: 100 });
    for (const pr of yprices.data) {
      if (pr.active) {
        try {
          await stripe.prices.update(pr.id, { active: false });
          console.log(`  ✓ price ${pr.id} archived`);
        } catch (e) {
          console.log(`  ⚠ price ${pr.id} skip (${e.message})`);
        }
      }
    }
  }

  // 3. Monthly: create €59 price, archive others
  let newMonthlyPriceId = null;
  if (monthly) {
    console.log(`\n→ Monthly (${monthly.id}): creating €59/month price...`);
    const newPrice = await stripe.prices.create({
      product: monthly.id,
      unit_amount: TARGET_MONTHLY,
      currency: "eur",
      recurring: { interval: "month" },
    });
    newMonthlyPriceId = newPrice.id;
    console.log(`  ✓ created ${newPrice.id}`);

    // rename + set default
    await stripe.products.update(monthly.id, {
      name: MONTHLY_NAME,
      default_price: newPrice.id,
    });
    console.log(`  ✓ renamed to "${MONTHLY_NAME}"`);

    // archive other active prices
    const prices = await stripe.prices.list({ product: monthly.id, limit: 100 });
    for (const pr of prices.data) {
      if (pr.id !== newPrice.id && pr.active) {
        try {
          await stripe.prices.update(pr.id, { active: false });
          console.log(`  ✓ archived old price ${pr.id} (€${pr.unit_amount / 100})`);
        } catch (e) {
          console.log(`  ⚠ price ${pr.id} skip (${e.message})`);
        }
      }
    }
  }

  // 4. Lifetime: create €349 one-time price, archive others
  let newLifetimePriceId = null;
  if (lifetime) {
    console.log(`\n→ Lifetime (${lifetime.id}): creating €349 one-time price...`);
    const newPrice = await stripe.prices.create({
      product: lifetime.id,
      unit_amount: TARGET_LIFETIME,
      currency: "eur",
    });
    newLifetimePriceId = newPrice.id;
    console.log(`  ✓ created ${newPrice.id}`);

    await stripe.products.update(lifetime.id, {
      name: LIFETIME_NAME,
      default_price: newPrice.id,
    });
    console.log(`  ✓ renamed to "${LIFETIME_NAME}"`);

    const prices = await stripe.prices.list({ product: lifetime.id, limit: 100 });
    for (const pr of prices.data) {
      if (pr.id !== newPrice.id && pr.active) {
        try {
          await stripe.prices.update(pr.id, { active: false });
          console.log(`  ✓ archived old price ${pr.id} (€${pr.unit_amount / 100})`);
        } catch (e) {
          console.log(`  ⚠ price ${pr.id} skip (${e.message})`);
        }
      }
    }
  }

  console.log("\n\n=== RESULT ===");
  console.log(`STRIPE_PRICE_MONTHLY=${newMonthlyPriceId}`);
  console.log(`STRIPE_PRICE_LIFETIME=${newLifetimePriceId}`);
}

run().catch((e) => {
  console.error("✗ ERROR:", e.message);
  process.exit(1);
});
