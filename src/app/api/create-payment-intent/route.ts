import { isRegistryOpen } from '@/lib/registry-status';
import { getStripe } from '@/lib/stripe';
import configPromise from '@payload-config';
import { type Static, Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

const ajv = addFormats(new Ajv(), ['email']);

// Stripe limits each metadata value to 500 characters.
const ContributionInput = Type.Object({
  amount: Type.Integer({ minimum: 100, maximum: 1_000_000 }),
  metadata: Type.Object({
    type: Type.Literal('honeymoon_fund'),
    name: Type.String({ minLength: 1, maxLength: 200 }),
    email: Type.String({ format: 'email', maxLength: 254 }),
    message: Type.Optional(Type.String({ maxLength: 500 })),
  }),
});

const validate =
  ajv.compile<Static<typeof ContributionInput>>(ContributionInput);

export async function POST(request: NextRequest) {
  if (!isRegistryOpen()) {
    return NextResponse.json(
      { error: 'The Honeymoon Fund is closed.' },
      { status: 403 },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!validate(body)) {
    return NextResponse.json(
      { error: 'Please enter an amount from $1 to $10,000 and your details.' },
      { status: 400 },
    );
  }

  const { amount, metadata } = body;

  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });

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

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 },
    );
  }
}
