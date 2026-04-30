import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_PRO_MONTHLY) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
  });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: process.env.STRIPE_PRICE_PRO_MONTHLY, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?upgrade=cancelled`,
    metadata: {
      user_id: user.id,
      plan: "pro",
    },
  });

  return NextResponse.json({ url: session.url });
}
