import { describe, expect, it } from 'vitest';
import {
  accumulatedCommission,
  averageSale,
  estimatedSalesNeededForCommissionGoal,
  goalProgress,
  grossSalesNeededForCommissionGoal,
  isMoneyAmount,
  remainingCommission,
  totalSales
} from './sale-calculations';
import type { Sale } from './models';

const sales: Sale[] = [
  { id: '1', amount: 10_000, soldAt: '2026-09-01T10:00:00.000Z', createdAt: '2026-09-01T10:00:00.000Z' },
  { id: '2', amount: 13_490, soldAt: '2026-09-02T10:00:00.000Z', createdAt: '2026-09-02T10:00:00.000Z' }
];

describe('sale calculations', () => {
  it('totals all sale amounts', () => expect(totalSales(sales)).toBe(23_490));
  it('validates non-negative integer money amounts', () => {
    expect(isMoneyAmount(23_490)).toBe(true);
    expect(isMoneyAmount(23_490.5)).toBe(false);
    expect(isMoneyAmount(-1)).toBe(false);
  });
  it('returns zero totals for no sales', () => expect(totalSales([])).toBe(0));
  it('rounds the average to a whole money amount', () => expect(averageSale(sales)).toBe(11_745));
  it('returns zero average for no sales', () => expect(averageSale([])).toBe(0));
  it('rounds accumulated commission to a whole money amount', () => expect(accumulatedCommission(sales, 0.007)).toBe(164));
  it('calculates commission goal progress and caps it at 100', () => {
    expect(goalProgress(sales, 0.007, 350)).toBeCloseTo(46.857);
    expect(goalProgress(sales, 0.007, 100)).toBe(100);
  });
  it('preserves progress below one percent', () => {
    expect(goalProgress([sales[0]], 0.007, 500_000)).toBeCloseTo(0.014);
  });
  it('returns zero progress for a non-positive goal', () => expect(goalProgress(sales, 0.007, 0)).toBe(0));
  it('returns the non-negative commission still needed', () => {
    expect(remainingCommission(sales, 0.007, 350)).toBe(186);
    expect(remainingCommission(sales, 0.007, 100)).toBe(0);
  });
  it('calculates gross sales needed to earn the remaining commission', () => {
    expect(grossSalesNeededForCommissionGoal(sales, 0.007, 350)).toBe(26_572);
    expect(grossSalesNeededForCommissionGoal(sales, 0, 350)).toBe(0);
  });
  it('estimates the number of average sales needed for the goal', () => {
    expect(estimatedSalesNeededForCommissionGoal(sales, 0.007, 350)).toBe(3);
    expect(estimatedSalesNeededForCommissionGoal([], 0.007, 350)).toBe(0);
  });
});
