import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SalesDatabase } from '../db/sales-database';
import type { Sale, SellerProfile } from '../domain/models';
import { DexieSaleRepository } from './dexie-sale-repository';
import { DexieSellerProfileRepository } from './dexie-seller-profile-repository';

const profile: SellerProfile = {
  name: 'Alex',
  commissionRate: 0.007,
  monthlyCommissionGoal: 250_000,
  workSchedule: {
    weekdays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '18:00',
    breakHour: '13:00'
  }
};

let database: SalesDatabase;
let repository: DexieSellerProfileRepository;

beforeEach(() => {
  database = new SalesDatabase(`seller-profile-test-${crypto.randomUUID()}`);
  repository = new DexieSellerProfileRepository(database);
});

afterEach(async () => {
  await database.delete();
});

describe('DexieSellerProfileRepository', () => {
  it('returns null when no profile has been saved', async () => {
    await expect(repository.get()).resolves.toBeNull();
  });

  it('saves and loads a seller profile', async () => {
    await repository.save(profile);

    await expect(repository.get()).resolves.toEqual(profile);
  });

  it('saves and loads an optional retail commission rate', async () => {
    const retailProfile = { ...profile, commissionRateRetail: 0.012 };

    await repository.save(retailProfile);

    await expect(repository.get()).resolves.toEqual(retailProfile);
  });

  it('saves reactive weekday arrays including Sunday and Saturday', async () => {
    await repository.save({
      ...profile,
      workSchedule: {
        ...profile.workSchedule,
        weekdays: new Proxy([0, 6], {})
      }
    });

    await expect(repository.get()).resolves.toEqual({
      ...profile,
      workSchedule: {
        ...profile.workSchedule,
        weekdays: [0, 6]
      }
    });
  });

  it('loads profiles saved before break hours were introduced', async () => {
    await database.sellerProfiles.put({
      key: 'seller-profile',
      name: profile.name,
      commissionRate: profile.commissionRate,
      monthlyCommissionGoal: profile.monthlyCommissionGoal,
      workSchedule: {
        weekdays: profile.workSchedule.weekdays,
        startTime: profile.workSchedule.startTime,
        endTime: profile.workSchedule.endTime
      }
    });

    await expect(repository.get()).resolves.toEqual({
      ...profile,
      workSchedule: {
        ...profile.workSchedule,
        breakHour: ''
      }
    });
  });

  it('updates the singleton profile', async () => {
    await repository.save(profile);
    await repository.save({
      ...profile,
      name: 'Sam',
      monthlyCommissionGoal: 320_000
    });

    await expect(repository.get()).resolves.toEqual({
      ...profile,
      name: 'Sam',
      monthlyCommissionGoal: 320_000
    });
    await expect(database.sellerProfiles.count()).resolves.toBe(1);
  });

  it('keeps historical retail rates when a change applies only to future sales', async () => {
    const saleRepository = new DexieSaleRepository(database);
    await saleRepository.add({
      id: 'retail-sale',
      amount: 10_000,
      retailCommissionRate: 0.01,
      soldAt: '2026-09-01T10:00:00.000Z',
      createdAt: '2026-09-01T10:00:00.000Z'
    });

    await repository.save({ ...profile, commissionRateRetail: 0.015 });

    await expect(saleRepository.list()).resolves.toMatchObject([
      { id: 'retail-sale', retailCommissionRate: 0.01 }
    ]);
  });

  it('applies a changed retail rate to every existing retail sale', async () => {
    const saleRepository = new DexieSaleRepository(database);
    const soldAt = '2026-09-01T10:00:00.000Z';
    await saleRepository.add({
      id: 'retail-sale',
      amount: 10_000,
      retailCommissionRate: 0.01,
      soldAt,
      createdAt: soldAt
    });
    await saleRepository.add({
      id: 'regular-sale',
      amount: 20_000,
      soldAt,
      createdAt: soldAt
    });

    await repository.save(
      { ...profile, commissionRateRetail: 0.015 },
      true
    );

    const storedSales = await saleRepository.list();
    expect(storedSales.find(({ id }) => id === 'retail-sale')).toMatchObject({
      retailCommissionRate: 0.015
    });
    expect(storedSales.find(({ id }) => id === 'regular-sale')).not.toHaveProperty(
      'retailCommissionRate'
    );
  });

  it('upgrades a v1 database without losing sales', async () => {
    const databaseName = database.name;
    await database.delete();

    const legacyDatabase = new Dexie(databaseName);
    legacyDatabase.version(1).stores({
      sales: 'id, soldAt, createdAt'
    });
    const sale: Sale = {
      id: 'existing-sale',
      amount: 23_490,
      soldAt: '2026-09-01T10:00:00.000Z',
      createdAt: '2026-09-01T10:00:00.000Z'
    };
    await legacyDatabase.table<Sale>('sales').add(sale);
    legacyDatabase.close();

    database = new SalesDatabase(databaseName);
    repository = new DexieSellerProfileRepository(database);
    const saleRepository = new DexieSaleRepository(database);

    await repository.save(profile);

    await expect(saleRepository.list()).resolves.toEqual([sale]);
    await expect(repository.get()).resolves.toEqual(profile);
  });
});
