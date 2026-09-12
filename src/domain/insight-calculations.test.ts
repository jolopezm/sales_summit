import { describe, expect, it } from 'vitest';
import type { Sale, WorkSchedule } from './models';
import {
  averageCommissionPerWorkedDay,
  bestSalesDay,
  bestTimeSlot,
  bestWeekday,
  commissionNeededPerRemainingWorkday,
  commissionPacePercentage,
  currentAndPreviousPeriodSummary,
  filterSalesByRange,
  hasSufficientData,
  isValidWorkSchedule,
  monthlyCommissionProjection,
  percentageVariation,
  salesByDay,
  SUFFICIENT_DATA_MIN_DAYS,
  SUFFICIENT_DATA_MIN_SALES
} from './insight-calculations';

function sale(id: string, amount: number, soldAt: string): Sale {
  return { id, amount, soldAt, createdAt: soldAt };
}

function localTimestamp(monthIndex: number, day: number, hour: number, minute = 0): string {
  return new Date(2026, monthIndex, day, hour, minute).toISOString();
}

const schedule: WorkSchedule = {
  weekdays: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '17:00',
  breakHour: '13:00'
};

const sales = [
  sale('aug', 500, localTimestamp(7, 31, 15)),
  sale('1', 1_000, localTimestamp(8, 1, 9, 30)),
  sale('2', 2_000, localTimestamp(8, 1, 10, 30)),
  sale('3', 4_000, localTimestamp(8, 2, 14, 30)),
  sale('4', 3_000, localTimestamp(8, 8, 10)),
  sale('5', 5_000, localTimestamp(8, 9, 16)),
  sale('future', 99_000, localTimestamp(8, 30, 10))
];

describe('period insights', () => {
  it('filters a half-open ISO range', () => {
    expect(filterSalesByRange(sales, {
      start: new Date(2026, 8, 1).toISOString(),
      end: new Date(2026, 8, 2).toISOString()
    }).map(({ id }) => id)).toEqual(['1', '2']);
  });

  it('summarizes current and previous calendar months', () => {
    const result = currentAndPreviousPeriodSummary(sales, new Date(2026, 8, 11, 12));
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

  it('groups sales by local calendar day and identifies the best day', () => {
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

  it('identifies the best three-hour local time slot', () => {
    expect(bestTimeSlot(completedSales)).toMatchObject({
      startTime: '09:00',
      endTime: '12:00',
      totalAmount: 6_000
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
  const now = new Date(2026, 8, 11, 13);
  const completedSales = sales.filter(({ id }) => id !== 'aug' && id !== 'future');

  it('projects monthly commission using elapsed scheduled work time', () => {
    expect(monthlyCommissionProjection(completedSales, 0.1, schedule, now)).toBe(3_882);
  });

  it('calculates average commission per equivalent worked day', () => {
    expect(averageCommissionPerWorkedDay(completedSales, 0.1, schedule, now)).toBe(176);
  });

  it('calculates commission needed per remaining equivalent workday', () => {
    expect(commissionNeededPerRemainingWorkday(completedSales, 0.1, 4_400, schedule, now)).toBe(215);
  });

  it('compares actual commission with the goal expected at this point', () => {
    expect(commissionPacePercentage(completedSales, 0.1, 4_400, schedule, now)).toBe(88);
  });

  it('uses the injected now and ignores later sales', () => {
    expect(monthlyCommissionProjection(sales, 0.1, schedule, now)).toBe(
      monthlyCommissionProjection(completedSales, 0.1, schedule, now)
    );
  });

  it('validates weekday and HH:mm schedule values', () => {
    expect(isValidWorkSchedule(schedule)).toBe(true);
    expect(isValidWorkSchedule({ ...schedule, weekdays: [0, 6] })).toBe(true);
    expect(isValidWorkSchedule({ ...schedule, weekdays: [1, 7] })).toBe(false);
    expect(() => monthlyCommissionProjection([], 0.1, { ...schedule, startTime: '9:00' }, now)).toThrow(
      RangeError
    );
  });
});
