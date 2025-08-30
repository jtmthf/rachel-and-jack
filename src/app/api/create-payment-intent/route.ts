import configPromise from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, metadata } = await request.json();

    if (amount < 100) {
      // Minimum $1 in cents
      return NextResponse.json(
        { error: 'Amount must be at least $1' },
        { status: 400 },
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });

    // Optionally store in database
    if (metadata.type === 'honeymoon_fund') {
      const payload = await getPayload({ config: configPromise });
      await payload.create({
        collection: 'honeymoon-contributions',
        data: {
          amount: amount / 100,
          name: metadata.name,
          email: metadata.email,
          message: metadata.message,
          stripePaymentIntentId: paymentIntent.id,
          status: 'pending',
        },
      });
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 },
    );
  }
}
