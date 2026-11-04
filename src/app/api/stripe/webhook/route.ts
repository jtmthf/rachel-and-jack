import { getStripe } from '@/lib/stripe';
import configPromise from '@payload-config';
import { getPayload, type Where } from 'payload';
import type Stripe from 'stripe';

/**
 * Records the outcome of a Honeymoon Contribution. A non-2xx response makes
 * Stripe retry, so a failed database write is not lost. This stays active while
 * the registry is closed, so payments already in progress are still recorded.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return new Response('Webhook is not configured', { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (
    event.type !== 'payment_intent.succeeded' &&
    event.type !== 'payment_intent.payment_failed'
  ) {
    return new Response(null, { status: 200 });
  }

  const paymentIntent = event.data.object;

  if (paymentIntent.metadata.type !== 'honeymoon_fund') {
    return new Response(null, { status: 200 });
  }

  const succeeded = event.type === 'payment_intent.succeeded';
  const where: Where = {
    stripePaymentIntentId: { equals: paymentIntent.id },
  };

  // Stripe may deliver events out of order. A failure never overrides a payment.
  if (!succeeded) {
    where.status = { not_equals: 'completed' };
  }

  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.update({
      collection: 'honeymoon-contributions',
      where,
      data: { status: succeeded ? 'completed' : 'failed' },
    });

    if (result.errors.length > 0) {
      throw new Error(`Could not update ${paymentIntent.id}`);
    }
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return new Response('Could not record event', { status: 500 });
  }

  return new Response(null, { status: 200 });
}
