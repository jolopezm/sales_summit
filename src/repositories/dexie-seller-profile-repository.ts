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
      ...(record.commissionRateRetail === undefined
        ? {}
        : { commissionRateRetail: record.commissionRateRetail }),
      monthlyCommissionGoal: record.monthlyCommissionGoal,
      workSchedule: {
        weekdays: [...record.workSchedule.weekdays],
        startTime: record.workSchedule.startTime,
        endTime: record.workSchedule.endTime,
        breakHour: record.workSchedule.breakHour ?? ''
      }
    };
  }

  async save(
    profile: SellerProfile,
    applyRetailRateToExistingSales = false,
  ): Promise<void> {
    const record: SellerProfileRecord = {
      key: SELLER_PROFILE_KEY,
      name: profile.name,
      commissionRate: profile.commissionRate,
      ...(profile.commissionRateRetail === undefined
        ? {}
        : { commissionRateRetail: profile.commissionRateRetail }),
      monthlyCommissionGoal: profile.monthlyCommissionGoal,
      workSchedule: {
        weekdays: [...profile.workSchedule.weekdays],
        startTime: profile.workSchedule.startTime,
        endTime: profile.workSchedule.endTime,
        breakHour: profile.workSchedule.breakHour
      }
    };

    await this.database.transaction(
      'rw',
      this.database.sellerProfiles,
      this.database.sales,
      async () => {
        await this.database.sellerProfiles.put(record);

        if (
          applyRetailRateToExistingSales &&
          profile.commissionRateRetail !== undefined
        ) {
          const retailRate = profile.commissionRateRetail;
          await this.database.sales
            .filter((sale) => sale.retailCommissionRate !== undefined)
            .modify((sale) => {
              sale.retailCommissionRate = retailRate;
            });
        }
      },
    );
  }
}
