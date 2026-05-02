import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function customerIdFromStripe(
  ref: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;
  if ('deleted' in ref && ref.deleted) return null;
  return ref.id;
}

/**
 * Stripe webhook — sync plan + store Stripe customer id.
 *
 * Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        if (!userId) break;

        const customerId = customerIdFromStripe(session.customer);
        const patch: { plan: string; stripe_customer_id?: string } = { plan: 'pro' };
        if (customerId) patch.stripe_customer_id = customerId;

        const { error } = await supabase.from('profiles').update(patch).eq('user_id', userId);
        if (error) {
          console.error('[stripe webhook] checkout.session.completed update failed');
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = customerIdFromStripe(sub.customer);
        if (!customerId) break;

        const pro = sub.status === 'active' || sub.status === 'trialing';
        const { error } = await supabase
          .from('profiles')
          .update({ plan: pro ? 'pro' : 'free' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('[stripe webhook] subscription.updated update failed');
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = customerIdFromStripe(sub.customer);
        if (!customerId) break;

        const { error } = await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('[stripe webhook] subscription.deleted update failed');
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        break;
      }

      default:
        break;
    }
  } catch {
    console.error('[stripe webhook] handler error');
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
