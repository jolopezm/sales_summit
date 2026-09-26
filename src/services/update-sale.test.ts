import { describe, expect, it } from 'vitest';
import type { Sale } from '../domain/models';
import { updateSale } from './update-sale';

const sale: Sale = {
  id: 'sale-id',
  amount: 10_000,
  soldAt: '2026-09-01T10:00:00.000Z',
  createdAt: '2026-09-01T10:00:00.000Z'
};

describe('updateSale', () => {
  it('changes only the sale amount', () => {
    expect(updateSale(sale, 15_000)).toEqual({ ...sale, amount: 15_000 });
  });

  it('adds and removes the retail commission rate', () => {
    const retailSale = updateSale(sale, sale.amount, 0.012);

    expect(retailSale.retailCommissionRate).toBe(0.012);
    expect(updateSale(retailSale, sale.amount)).toEqual(sale);
  });

  it.each([0, -1, 12.5, Number.NaN])('rejects invalid amounts: %s', (amount) => {
    expect(() => updateSale(sale, amount)).toThrow(RangeError);
  });

  it.each([0, -0.1, 1.1, Number.NaN])('rejects invalid retail rates: %s', (rate) => {
    expect(() => updateSale(sale, sale.amount, rate)).toThrow(RangeError);
  });
});
