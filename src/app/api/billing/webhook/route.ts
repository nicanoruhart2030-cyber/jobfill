import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook → flip profile.plan to 'pro' on successful checkout,
 * back to 'free' on subscription cancel.
 *
 * Required env:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }

  const stripe = new Stripe(secret, { apiVersion: '2026-04-22.dahlia' });

  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (userId) {
        await supabase
          .from('profiles')
          .update({ plan: 'pro' })
          .eq('user_id', userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
      // Look up profile by email via Stripe customer
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted && customer.email) {
        await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('email', customer.email);
      }
      break;
    }

    default:
      // Ignore unrelated events
      break;
  }

  return NextResponse.json({ received: true });
}
