export interface WorkSchedule {
  /** Weekday numbers, where Sunday is 0 and Saturday is 6. */
  weekdays: number[];
  /** Start of the workday in HH:mm format. */
  startTime: string;
  /** End of the workday in HH:mm format. */
  endTime: string;
  breakHour: string;
}

export interface SellerProfile {
  name: string;
  commissionRate: number;
  monthlyCommissionGoal: number;
  workSchedule: WorkSchedule;
}

export interface Sale {
  id: string;
  amount: number;
  soldAt: string;
  createdAt: string;
}
