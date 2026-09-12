import type { Sale } from '../domain/models';
import { isMoneyAmount } from '../domain/sale-calculations';

export function updateSaleAmount(sale: Sale, amount: number): Sale {
  if (!isMoneyAmount(amount) || amount === 0) {
    throw new RangeError('Sale amount must be a positive integer');
  }

  return { ...sale, amount };
}
