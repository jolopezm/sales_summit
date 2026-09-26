import { describe, expect, it, vi } from 'vitest';
import { createSale } from './create-sale';

describe('createSale', () => {
  it('creates a normalized sale with a UUID', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'sale-id' });
    const sale = createSale(12_500, '2026-09-11T10:00:00-03:00');

    expect(sale).toMatchObject({
      id: 'sale-id',
      amount: 12_500,
      soldAt: '2026-09-11T13:00:00.000Z'
    });
    vi.unstubAllGlobals();
  });

  it.each([0, -1, 10.5, Number.NaN])('rejects invalid money amount %s', (amount) => {
    expect(() => createSale(amount)).toThrow(RangeError);
  });

  it('rejects invalid sale dates', () => {
    expect(() => createSale(1_000, 'invalid')).toThrow(RangeError);
  });

  it('stores the retail commission rate applied to the sale', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'retail-sale' });

    expect(createSale(10_000, '2026-09-11T10:00:00Z', 0.012)).toMatchObject({
      id: 'retail-sale',
      retailCommissionRate: 0.012
    });
    vi.unstubAllGlobals();
  });

  it.each([0, -0.1, 1.1, Number.NaN])('rejects invalid retail rates: %s', (rate) => {
    expect(() => createSale(1_000, undefined, rate)).toThrow(RangeError);
  });
});
