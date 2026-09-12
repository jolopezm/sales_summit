import type { Sale } from "./models";

export function isMoneyAmount(amount: number): boolean {
  return Number.isSafeInteger(amount) && amount >= 0;
}

export function totalSales(sales: readonly Sale[]): number {
  return sales.reduce((total, sale) => total + sale.amount, 0);
}

export function averageSale(sales: readonly Sale[]): number {
  if (sales.length === 0) return 0;

  return Math.round(totalSales(sales) / sales.length);
}

export function accumulatedCommission(
  sales: readonly Sale[],
  commissionRate: number,
): number {
  return Math.round(totalSales(sales) * commissionRate);
}

export function remainingCommission(
  sales: readonly Sale[],
  commissionRate: number,
  monthlyCommissionGoal: number,
): number {
  return Math.max(
    0,
    monthlyCommissionGoal - accumulatedCommission(sales, commissionRate),
  );
}

export function grossSalesNeededForCommissionGoal(
  sales: readonly Sale[],
  commissionRate: number,
  monthlyCommissionGoal: number,
): number {
  if (commissionRate <= 0) return 0;

  return Math.ceil(
    remainingCommission(sales, commissionRate, monthlyCommissionGoal) /
      commissionRate,
  );
}

export function estimatedSalesNeededForCommissionGoal(
  sales: readonly Sale[],
  commissionRate: number,
  monthlyCommissionGoal: number,
): number {
  const average = averageSale(sales);
  if (average <= 0) return 0;

  return Math.ceil(
    grossSalesNeededForCommissionGoal(
      sales,
      commissionRate,
      monthlyCommissionGoal,
    ) / average,
  );
}

export function goalProgress(
  sales: readonly Sale[],
  commissionRate: number,
  monthlyCommissionGoal: number,
): number {
  if (monthlyCommissionGoal <= 0) return 0;

  return Math.min(
    100,
    (accumulatedCommission(sales, commissionRate) / monthlyCommissionGoal) *
      100,
  );
}
