import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitRegistryPurchase } from './actions';

const { findByID, create, count } = vi.hoisted(() => ({
  findByID: vi.fn(),
  create: vi.fn(),
  count: vi.fn(),
}));

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('payload', () => ({
  getPayload: async () => ({ findByID, create }),
}));
vi.mock('./queries', () => ({ countRegistryPurchases: count }));

const initial = { errors: {}, success: false };

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const fields = {
    registryItem: '1',
    quantity: '1',
    purchasedAt: 'online',
    purchaserName: 'A Guest',
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe('submitRegistryPurchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('REGISTRY_OPEN', 'true');
    findByID.mockResolvedValue({ id: 1, quantityRequested: 2 });
    count.mockResolvedValue(new Map([[1, 1]]));
  });

  it.each([undefined, '', 'false', '1'])(
    'rejects everything when REGISTRY_OPEN is %s',
    async (value) => {
      vi.stubEnv('REGISTRY_OPEN', value as string);
      const result = await submitRegistryPurchase(initial, form());
      expect(result.success).toBe(false);
      expect(create).not.toHaveBeenCalled();
    },
  );

  it('records a purchase within the remaining quantity', async () => {
    const result = await submitRegistryPurchase(initial, form());
    expect(result.success).toBe(true);
    expect(create).toHaveBeenCalledOnce();
  });

  it('rejects more than the remaining quantity', async () => {
    const result = await submitRegistryPurchase(
      initial,
      form({ quantity: '2' }),
    );
    expect(result.success).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it.each(['0', '-1', '1.5', 'many'])(
    'rejects a quantity of %s',
    async (quantity) => {
      const result = await submitRegistryPurchase(initial, form({ quantity }));
      expect(result.success).toBe(false);
      expect(create).not.toHaveBeenCalled();
    },
  );

  it('rejects an item that does not exist', async () => {
    findByID.mockResolvedValue(null);
    const result = await submitRegistryPurchase(initial, form());
    expect(result.success).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it('accepts a blank optional email and rejects an invalid one', async () => {
    const blank = await submitRegistryPurchase(
      initial,
      form({ purchaserEmail: '' }),
    );
    expect(blank.success).toBe(true);

    const invalid = await submitRegistryPurchase(
      initial,
      form({ purchaserEmail: 'nope' }),
    );
    expect(invalid.success).toBe(false);
  });

  it('stores only known fields', async () => {
    await submitRegistryPurchase(initial, form({ $ACTION_ID_abc: 'x' }));
    expect(create.mock.calls[0][0].data).not.toHaveProperty('$ACTION_ID_abc');
  });
});
