import Dexie, { type EntityTable } from "dexie";
import type { Sale } from "../domain/models";

export interface SellerProfileRecord {
  key: string;
  name: string;
  commissionRate: number;
  monthlyCommissionGoal: number;
  workSchedule: {
    weekdays: number[];
    startTime: string;
    endTime: string;
    breakHour?: string;
  };
}

export class SalesDatabase extends Dexie {
  sales!: EntityTable<Sale, "id">;
  sellerProfiles!: EntityTable<SellerProfileRecord, "key">;

  constructor(name = "sales-summit") {
    super(name);
    this.version(1).stores({
      sales: "id, soldAt, createdAt",
    });
    this.version(2).stores({
      sales: "id, soldAt, createdAt",
      sellerProfiles: "key",
    });
  }
}

export const salesDatabase = new SalesDatabase();
