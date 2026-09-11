export interface WorkSchedule {
  weekdays: number[];
  startTime: string;
  endTime: string;
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
