"use server";

import Stripe from "stripe";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  lifetime: process.env.STRIPE_PRICE_LIFETIME!,
};

export async function createCheckout(plan: "monthly" | "lifetime") {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress;

  const priceId = PRICES[plan];
  const baseUrl = process.env.NEXT_PUBLIC_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: plan === "lifetime" ? "payment" : "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?success=1`,
    cancel_url: `${baseUrl}/#pricing`,
    customer_email: email,
    metadata: { userId, plan },
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}
