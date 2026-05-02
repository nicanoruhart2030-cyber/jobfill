import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ensureProfileForClerkUser } from "@/lib/profile/ensure";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_PRO_MONTHLY) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 400 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const internalUserId = await ensureProfileForClerkUser();
  if (!internalUserId) {
    return NextResponse.json({ error: "Profile not ready." }, { status: 500 });
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;
  if (!email) {
    return NextResponse.json({ error: "No email on account." }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
  });

  const admin = getSupabaseAdmin();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", internalUserId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "Could not load profile." }, { status: 500 });
  }

  const stripeCustomerId =
    profile && typeof profile === "object" && "stripe_customer_id" in profile
      ? (profile as { stripe_customer_id: string | null }).stripe_customer_id
      : null;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...(stripeCustomerId
      ? { customer: stripeCustomerId }
      : { customer_email: email }),
    line_items: [{ price: process.env.STRIPE_PRICE_PRO_MONTHLY, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?upgrade=cancelled`,
    metadata: {
      user_id: internalUserId,
      plan: "pro",
    },
  });

  return NextResponse.json({ url: session.url });
}
