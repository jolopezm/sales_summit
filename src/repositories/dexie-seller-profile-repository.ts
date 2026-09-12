import type { SellerProfile } from '../domain/models';
import { salesDatabase, type SalesDatabase, type SellerProfileRecord } from '../db/sales-database';
import type { SellerProfileRepository } from './seller-profile-repository';

const SELLER_PROFILE_KEY = 'seller-profile';

export class DexieSellerProfileRepository implements SellerProfileRepository {
  constructor(private readonly database: SalesDatabase = salesDatabase) {}

  async get(): Promise<SellerProfile | null> {
    const record = await this.database.sellerProfiles.get(SELLER_PROFILE_KEY);

    if (!record) return null;

    return {
      name: record.name,
      commissionRate: record.commissionRate,
      monthlyCommissionGoal: record.monthlyCommissionGoal,
      workSchedule: {
        weekdays: [...record.workSchedule.weekdays],
        startTime: record.workSchedule.startTime,
        endTime: record.workSchedule.endTime,
        breakHour: record.workSchedule.breakHour ?? ''
      }
    };
  }

  async save(profile: SellerProfile): Promise<void> {
    const record: SellerProfileRecord = {
      key: SELLER_PROFILE_KEY,
      name: profile.name,
      commissionRate: profile.commissionRate,
      monthlyCommissionGoal: profile.monthlyCommissionGoal,
      workSchedule: {
        weekdays: [...profile.workSchedule.weekdays],
        startTime: profile.workSchedule.startTime,
        endTime: profile.workSchedule.endTime,
        breakHour: profile.workSchedule.breakHour
      }
    };

    await this.database.sellerProfiles.put(record);
  }
}
