import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const { intentCreate, recordCreate } = vi.hoisted(() => ({
  intentCreate: vi.fn(),
  recordCreate: vi.fn(),
}));

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ create: recordCreate }),
}));
vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({ paymentIntents: { create: intentCreate } }),
}));

const metadata = {
  type: 'honeymoon_fund',
  name: 'A Guest',
  email: 'guest@example.test',
};

function post(body: unknown) {
  return POST(
    new Request('http://test/api', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }) as NextRequest,
  );
}

describe('POST /api/create-payment-intent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('REGISTRY_OPEN', 'true');
    intentCreate.mockResolvedValue({ id: 'pi_1', client_secret: 'secret' });
  });

  it('rejects everything when the registry is closed', async () => {
    vi.stubEnv('REGISTRY_OPEN', undefined as unknown as string);
    const response = await post({ amount: 5000, metadata });
    expect(response.status).toBe(403);
    expect(intentCreate).not.toHaveBeenCalled();
  });

  it('creates a payment and a pending record for a valid amount', async () => {
    const response = await post({ amount: 5000, metadata });
    expect(response.status).toBe(200);
    expect(intentCreate.mock.calls[0][0].amount).toBe(5000);
    expect(recordCreate.mock.calls[0][0].data).toMatchObject({
      amount: 50,
      status: 'pending',
      stripePaymentIntentId: 'pi_1',
    });
  });

  it.each([99, 1_000_001, 100.5, '5000', null, undefined])(
    'rejects an amount of %s',
    async (amount) => {
      const response = await post({ amount, metadata });
      expect(response.status).toBe(400);
      expect(intentCreate).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['a different type', { ...metadata, type: 'other' }],
    ['a missing name', { ...metadata, name: '' }],
    ['an invalid email', { ...metadata, email: 'nope' }],
    [
      'a message Stripe would refuse',
      { ...metadata, message: 'x'.repeat(501) },
    ],
    ['no metadata', undefined],
  ])('rejects %s', async (_name, value) => {
    const response = await post({ amount: 5000, metadata: value });
    expect(response.status).toBe(400);
    expect(intentCreate).not.toHaveBeenCalled();
  });

  it('rejects a body that is not JSON', async () => {
    expect((await post('not json')).status).toBe(400);
  });
});
