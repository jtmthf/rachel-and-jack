import Stripe from 'stripe';

let stripe: Stripe | undefined;

/** Created on first use, so a closed registry can run without a Stripe key. */
export function getStripe() {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripe = new Stripe(secretKey, {
      // @ts-ignore
      apiVersion: '2024-11-20.acacia',
    });
  }
  return stripe;
}
