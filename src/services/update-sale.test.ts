import { describe, expect, it } from 'vitest';
import type { Sale } from '../domain/models';
import { updateSaleAmount } from './update-sale';

const sale: Sale = {
  id: 'sale-id',
  amount: 10_000,
  soldAt: '2026-09-01T10:00:00.000Z',
  createdAt: '2026-09-01T10:00:00.000Z'
};

describe('updateSaleAmount', () => {
  it('changes only the sale amount', () => {
    expect(updateSaleAmount(sale, 15_000)).toEqual({ ...sale, amount: 15_000 });
  });

  it.each([0, -1, 12.5, Number.NaN])('rejects invalid amounts: %s', (amount) => {
    expect(() => updateSaleAmount(sale, amount)).toThrow(RangeError);
  });
});
