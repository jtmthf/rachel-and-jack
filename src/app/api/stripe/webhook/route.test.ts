import Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const { update } = vi.hoisted(() => ({ update: vi.fn() }));

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({ getPayload: async () => ({ update }) }));

const secret = 'whsec_test';
const stripe = new Stripe('sk_test_dummy');

function delivery(
  type: string,
  metadata: Record<string, string> = { type: 'honeymoon_fund' },
  signingSecret = secret,
) {
  const payload = JSON.stringify({
    id: 'evt_1',
    object: 'event',
    type,
    data: { object: { id: 'pi_1', object: 'payment_intent', metadata } },
  });
  return POST(
    new Request('http://test/api', {
      method: 'POST',
      body: payload,
      headers: {
        'stripe-signature': stripe.webhooks.generateTestHeaderString({
          payload,
          secret: signingSecret,
        }),
      },
    }),
  );
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', secret);
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_dummy');
    vi.stubEnv('REGISTRY_OPEN', undefined as unknown as string);
    update.mockResolvedValue({ docs: [{ id: 1 }], errors: [] });
  });

  it('marks a paid contribution completed, even with the registry closed', async () => {
    const response = await delivery('payment_intent.succeeded');
    expect(response.status).toBe(200);
    expect(update.mock.calls[0][0]).toMatchObject({
      where: { stripePaymentIntentId: { equals: 'pi_1' } },
      data: { status: 'completed' },
    });
  });

  it('marks a failed contribution failed, but never one already completed', async () => {
    await delivery('payment_intent.payment_failed');
    expect(update.mock.calls[0][0]).toMatchObject({
      where: { status: { not_equals: 'completed' } },
      data: { status: 'failed' },
    });
  });

  it('rejects an invalid signature', async () => {
    const response = await delivery(
      'payment_intent.succeeded',
      undefined,
      'whsec_wrong',
    );
    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects a missing signature', async () => {
    const response = await POST(
      new Request('http://test/api', { method: 'POST', body: '{}' }),
    );
    expect(response.status).toBe(400);
  });

  it('asks Stripe to retry when the write fails', async () => {
    update.mockRejectedValue(new Error('database down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await delivery('payment_intent.succeeded')).status).toBe(500);
  });

  it('ignores other events and other payments', async () => {
    expect((await delivery('charge.refunded')).status).toBe(200);
    expect(
      (await delivery('payment_intent.succeeded', { type: 'other' })).status,
    ).toBe(200);
    expect(update).not.toHaveBeenCalled();
  });

  it('is unavailable when not configured', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    expect((await delivery('payment_intent.succeeded')).status).toBe(503);
  });
});
