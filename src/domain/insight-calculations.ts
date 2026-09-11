import type { Sale, WorkSchedule } from './models';
import { totalSales } from './sale-calculations';

export const SUFFICIENT_DATA_MIN_SALES = 5;
export const SUFFICIENT_DATA_MIN_DAYS = 3;

export interface DateRange {
  start: string;
  end: string;
}

export interface PeriodSummary {
  totalAmount: number;
  saleCount: number;
  averageAmount: number;
}

export interface DaySales extends PeriodSummary {
  date: string;
}

export interface WeekdaySales extends PeriodSummary {
  weekday: number;
}

export interface TimeSlotSales extends PeriodSummary {
  startTime: string;
  endTime: string;
}

function toDate(value: string | Date): Date {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid ISO timestamp');
  return date;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function minutesFromTime(value: string): number {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new RangeError('Time must use HH:mm');
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function scheduleMinutes(schedule: WorkSchedule): { start: number; end: number; duration: number } {
  if (
    schedule.weekdays.length === 0 ||
    new Set(schedule.weekdays).size !== schedule.weekdays.length ||
    schedule.weekdays.some((weekday) => !Number.isInteger(weekday) || weekday < 0 || weekday > 6)
  ) {
    throw new RangeError('Work schedule weekdays must be unique integers from 0 to 6');
  }

  const start = minutesFromTime(schedule.startTime);
  const end = minutesFromTime(schedule.endTime);
  if (end <= start) throw new RangeError('Work schedule endTime must be after startTime');
  return { start, end, duration: end - start };
}

function monthStart(date: Date, offset = 0): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
}

function summarize(sales: readonly Sale[]): PeriodSummary {
  const amount = totalSales(sales);
  return {
    totalAmount: amount,
    saleCount: sales.length,
    averageAmount: sales.length === 0 ? 0 : Math.round(amount / sales.length)
  };
}

function currentMonthSales(sales: readonly Sale[], now: Date): Sale[] {
  return filterSalesByRange(sales, {
    start: monthStart(now).toISOString(),
    end: monthStart(now, 1).toISOString()
  }).filter((sale) => toDate(sale.soldAt).getTime() <= now.getTime());
}

function workingMinutesInMonth(schedule: WorkSchedule, now: Date): { elapsed: number; total: number } {
  const { start, end, duration } = scheduleMinutes(schedule);
  const firstDay = monthStart(now);
  const nextMonth = monthStart(now, 1);
  let elapsed = 0;
  let total = 0;

  for (const day = new Date(firstDay); day < nextMonth; day.setUTCDate(day.getUTCDate() + 1)) {
    if (!schedule.weekdays.includes(day.getUTCDay())) continue;
    total += duration;

    const dayStart = new Date(day);
    dayStart.setUTCMinutes(start);
    const dayEnd = new Date(day);
    dayEnd.setUTCMinutes(end);
    if (now >= dayEnd) elapsed += duration;
    else if (now > dayStart) elapsed += (now.getTime() - dayStart.getTime()) / 60_000;
  }

  return { elapsed, total };
}

export function filterSalesByRange(sales: readonly Sale[], range: DateRange): Sale[] {
  const start = toDate(range.start).getTime();
  const end = toDate(range.end).getTime();
  if (end <= start) throw new RangeError('Date range end must be after start');
  return sales.filter((sale) => {
    const soldAt = toDate(sale.soldAt).getTime();
    return soldAt >= start && soldAt < end;
  });
}

export function currentAndPreviousPeriodSummary(
  sales: readonly Sale[],
  now: Date = new Date()
): { current: PeriodSummary; previous: PeriodSummary } {
  const currentStart = monthStart(now);
  const nextStart = monthStart(now, 1);
  const previousStart = monthStart(now, -1);
  return {
    current: summarize(filterSalesByRange(sales, { start: currentStart.toISOString(), end: nextStart.toISOString() })),
    previous: summarize(filterSalesByRange(sales, { start: previousStart.toISOString(), end: currentStart.toISOString() }))
  };
}

export function percentageVariation(current: number, baseline: number): number | null {
  if (baseline === 0) return null;
  return Math.round(((current - baseline) / baseline) * 100);
}

export function salesByDay(sales: readonly Sale[]): DaySales[] {
  const groups = new Map<string, Sale[]>();
  for (const sale of sales) {
    const date = toIsoDate(toDate(sale.soldAt));
    groups.set(date, [...(groups.get(date) ?? []), sale]);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, daySales]) => ({ date, ...summarize(daySales) }));
}

export function bestSalesDay(sales: readonly Sale[]): DaySales | null {
  return salesByDay(sales).reduce<DaySales | null>(
    (best, day) => (!best || day.totalAmount > best.totalAmount ? day : best),
    null
  );
}

export function monthlyProjection(
  sales: readonly Sale[],
  schedule: WorkSchedule,
  now: Date = new Date()
): number {
  const { elapsed, total } = workingMinutesInMonth(schedule, now);
  if (elapsed === 0) return 0;
  return Math.round((totalSales(currentMonthSales(sales, now)) / elapsed) * total);
}

export function averagePerWorkedDay(
  sales: readonly Sale[],
  schedule: WorkSchedule,
  now: Date = new Date()
): number {
  const { elapsed } = workingMinutesInMonth(schedule, now);
  const duration = scheduleMinutes(schedule).duration;
  if (elapsed === 0) return 0;
  return Math.round(totalSales(currentMonthSales(sales, now)) / (elapsed / duration));
}

export function amountNeededPerRemainingWorkday(
  sales: readonly Sale[],
  monthlySalesGoal: number,
  schedule: WorkSchedule,
  now: Date = new Date()
): number {
  const { elapsed, total } = workingMinutesInMonth(schedule, now);
  const remainingDays = (total - elapsed) / scheduleMinutes(schedule).duration;
  if (remainingDays <= 0) return Math.max(0, monthlySalesGoal - totalSales(currentMonthSales(sales, now)));
  return Math.ceil(Math.max(0, monthlySalesGoal - totalSales(currentMonthSales(sales, now))) / remainingDays);
}

export function pacePercentage(
  sales: readonly Sale[],
  monthlySalesGoal: number,
  schedule: WorkSchedule,
  now: Date = new Date()
): number {
  if (monthlySalesGoal <= 0) return 0;
  const { elapsed, total } = workingMinutesInMonth(schedule, now);
  if (elapsed === 0 || total === 0) return 0;
  const expectedAmount = monthlySalesGoal * (elapsed / total);
  return Math.round((totalSales(currentMonthSales(sales, now)) / expectedAmount) * 100);
}

export function bestWeekday(sales: readonly Sale[]): WeekdaySales | null {
  const groups = new Map<number, Sale[]>();
  for (const sale of sales) {
    const weekday = toDate(sale.soldAt).getUTCDay();
    groups.set(weekday, [...(groups.get(weekday) ?? []), sale]);
  }
  return [...groups.entries()].reduce<WeekdaySales | null>((best, [weekday, weekdaySales]) => {
    const candidate = { weekday, ...summarize(weekdaySales) };
    return !best || candidate.totalAmount > best.totalAmount ? candidate : best;
  }, null);
}

export function bestTimeSlot(sales: readonly Sale[], slotHours = 3): TimeSlotSales | null {
  if (!Number.isInteger(slotHours) || slotHours <= 0 || 24 % slotHours !== 0) {
    throw new RangeError('slotHours must be a positive divisor of 24');
  }
  const groups = new Map<number, Sale[]>();
  for (const sale of sales) {
    const hour = toDate(sale.soldAt).getUTCHours();
    const startHour = Math.floor(hour / slotHours) * slotHours;
    groups.set(startHour, [...(groups.get(startHour) ?? []), sale]);
  }
  return [...groups.entries()].reduce<TimeSlotSales | null>((best, [startHour, slotSales]) => {
    const candidate = {
      startTime: `${String(startHour).padStart(2, '0')}:00`,
      endTime: `${String(startHour + slotHours).padStart(2, '0')}:00`,
      ...summarize(slotSales)
    };
    return !best || candidate.totalAmount > best.totalAmount ? candidate : best;
  }, null);
}

export function hasSufficientData(sales: readonly Sale[]): boolean {
  return sales.length >= SUFFICIENT_DATA_MIN_SALES && salesByDay(sales).length >= SUFFICIENT_DATA_MIN_DAYS;
}
