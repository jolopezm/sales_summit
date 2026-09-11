import type { Sale } from '../domain/models';

export function createSale(amount: number, soldAt = new Date().toISOString()): Sale {
  return {
    id: crypto.randomUUID(),
    amount,
    soldAt,
    createdAt: new Date().toISOString()
  };
}
