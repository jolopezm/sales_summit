import { describe, expect, it } from 'vitest';
import type { Sale, WorkSchedule } from './models';
import {
  amountNeededPerRemainingWorkday,
  averagePerWorkedDay,
  bestSalesDay,
  bestTimeSlot,
  bestWeekday,
  currentAndPreviousPeriodSummary,
  filterSalesByRange,
  hasSufficientData,
  monthlyProjection,
  pacePercentage,
  percentageVariation,
  salesByDay,
  SUFFICIENT_DATA_MIN_DAYS,
  SUFFICIENT_DATA_MIN_SALES
} from './insight-calculations';

function sale(id: string, amount: number, soldAt: string): Sale {
  return { id, amount, soldAt, createdAt: soldAt };
}

const schedule: WorkSchedule = {
  weekdays: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '17:00'
};

const sales = [
  sale('aug', 500, '2026-08-31T15:00:00.000Z'),
  sale('1', 1_000, '2026-09-01T09:30:00.000Z'),
  sale('2', 2_000, '2026-09-01T10:30:00.000Z'),
  sale('3', 4_000, '2026-09-02T14:30:00.000Z'),
  sale('4', 3_000, '2026-09-08T10:00:00.000Z'),
  sale('5', 5_000, '2026-09-09T16:00:00.000Z'),
  sale('future', 99_000, '2026-09-30T10:00:00.000Z')
];

describe('period insights', () => {
  it('filters a half-open ISO range', () => {
    expect(filterSalesByRange(sales, {
      start: '2026-09-01T00:00:00.000Z',
      end: '2026-09-02T00:00:00.000Z'
    }).map(({ id }) => id)).toEqual(['1', '2']);
  });

  it('summarizes current and previous calendar months', () => {
    const result = currentAndPreviousPeriodSummary(sales, new Date('2026-09-11T12:00:00.000Z'));
    expect(result.previous).toEqual({ totalAmount: 500, saleCount: 1, averageAmount: 500 });
    expect(result.current).toEqual({ totalAmount: 114_000, saleCount: 6, averageAmount: 19_000 });
  });

  it('returns null variation when the baseline is zero', () => {
    expect(percentageVariation(150, 100)).toBe(50);
    expect(percentageVariation(150, 0)).toBeNull();
  });
});

describe('distribution insights', () => {
  const completedSales = sales.filter(({ id }) => id !== 'aug' && id !== 'future');

  it('groups sales by UTC calendar day and identifies the best day', () => {
    expect(salesByDay(completedSales)[0]).toEqual({
      date: '2026-09-01',
      totalAmount: 3_000,
      saleCount: 2,
      averageAmount: 1_500
    });
    expect(bestSalesDay(completedSales)?.date).toBe('2026-09-09');
  });

  it('identifies the weekday with the greatest gross amount', () => {
    expect(bestWeekday(completedSales)).toMatchObject({ weekday: 3, totalAmount: 9_000 });
  });

  it('identifies the best three-hour UTC time slot', () => {
    expect(bestTimeSlot(completedSales)).toMatchObject({
      startTime: '15:00',
      endTime: '18:00',
      totalAmount: 5_000
    });
  });

  it('exports and applies the sufficient-data rule', () => {
    expect(SUFFICIENT_DATA_MIN_SALES).toBe(5);
    expect(SUFFICIENT_DATA_MIN_DAYS).toBe(3);
    expect(hasSufficientData(completedSales)).toBe(true);
    expect(hasSufficientData(completedSales.slice(0, 4))).toBe(false);
  });
});

describe('work schedule insights', () => {
  // September 1-30, 2026 has 22 Monday-Friday workdays. At Friday 11th 13:00,
  // eight full days and half of the current day have elapsed.
  const now = new Date('2026-09-11T13:00:00.000Z');
  const completedSales = sales.filter(({ id }) => id !== 'aug' && id !== 'future');

  it('projects the month using elapsed scheduled work time', () => {
    expect(monthlyProjection(completedSales, schedule, now)).toBe(38_824);
  });

  it('calculates average gross sales per equivalent worked day', () => {
    expect(averagePerWorkedDay(completedSales, schedule, now)).toBe(1_765);
  });

  it('calculates the amount needed per remaining equivalent workday', () => {
    expect(amountNeededPerRemainingWorkday(completedSales, 44_000, schedule, now)).toBe(2_321);
  });

  it('compares actual sales with the goal expected at this point', () => {
    expect(pacePercentage(completedSales, 44_000, schedule, now)).toBe(88);
  });

  it('uses the injected now and ignores later sales', () => {
    expect(monthlyProjection(sales, schedule, now)).toBe(monthlyProjection(completedSales, schedule, now));
  });

  it('validates weekday and HH:mm schedule values', () => {
    expect(() => monthlyProjection([], { ...schedule, weekdays: [1, 7] }, now)).toThrow(RangeError);
    expect(() => monthlyProjection([], { ...schedule, startTime: '9:00' }, now)).toThrow(RangeError);
  });
});
