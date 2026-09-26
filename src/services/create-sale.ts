import type { Sale } from '../domain/models';
import { isMoneyAmount } from '../domain/sale-calculations';

export function createSale(
  amount: number,
  soldAt = new Date().toISOString(),
  retailCommissionRate?: number,
): Sale {
  if (!isMoneyAmount(amount) || amount === 0) {
    throw new RangeError('Sale amount must be a positive integer');
  }

  const soldDate = new Date(soldAt);
  if (Number.isNaN(soldDate.getTime())) throw new RangeError('Sale date must be valid');
  if (
    retailCommissionRate !== undefined &&
    !(retailCommissionRate > 0 && retailCommissionRate <= 1)
  ) {
    throw new RangeError('Retail commission rate must be between 0 and 1');
  }

  return {
    id: crypto.randomUUID(),
    amount,
    ...(retailCommissionRate === undefined ? {} : { retailCommissionRate }),
    soldAt: soldDate.toISOString(),
    createdAt: new Date().toISOString()
  };
}
