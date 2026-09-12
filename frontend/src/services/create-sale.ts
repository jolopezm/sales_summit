import type { Sale } from '../domain/models';
import { isMoneyAmount } from '../domain/sale-calculations';

export function createSale(amount: number, soldAt = new Date().toISOString()): Sale {
  if (!isMoneyAmount(amount) || amount === 0) {
    throw new RangeError('Sale amount must be a positive integer');
  }

  const soldDate = new Date(soldAt);
  if (Number.isNaN(soldDate.getTime())) throw new RangeError('Sale date must be valid');

  return {
    id: crypto.randomUUID(),
    amount,
    soldAt: soldDate.toISOString(),
    createdAt: new Date().toISOString()
  };
}
