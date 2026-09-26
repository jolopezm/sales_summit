import type { Sale } from '../domain/models';
import { isMoneyAmount } from '../domain/sale-calculations';

export function updateSale(
  sale: Sale,
  amount: number,
  retailCommissionRate?: number,
): Sale {
  if (!isMoneyAmount(amount) || amount === 0) {
    throw new RangeError('Sale amount must be a positive integer');
  }

  if (
    retailCommissionRate !== undefined &&
    !(retailCommissionRate > 0 && retailCommissionRate <= 1)
  ) {
    throw new RangeError('Retail commission rate must be between 0 and 1');
  }

  const { retailCommissionRate: _currentRetailRate, ...regularSale } = sale;
  return {
    ...regularSale,
    amount,
    ...(retailCommissionRate === undefined ? {} : { retailCommissionRate }),
  };
}
