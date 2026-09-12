import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SalesDatabase } from '../db/sales-database';
import { DexieSaleRepository } from './dexie-sale-repository';

let database: SalesDatabase;
let repository: DexieSaleRepository;

beforeEach(() => {
  database = new SalesDatabase();
  repository = new DexieSaleRepository(database);
});

afterEach(async () => {
  await database.delete();
});

describe('DexieSaleRepository', () => {
  it('persists sales and returns them newest first', async () => {
    await repository.add({ id: 'first', amount: 10_000, soldAt: '2026-09-01T10:00:00.000Z', createdAt: '2026-09-01T10:00:00.000Z' });
    await repository.add({ id: 'second', amount: 13_490, soldAt: '2026-09-02T10:00:00.000Z', createdAt: '2026-09-02T10:00:00.000Z' });

    await expect(repository.list()).resolves.toMatchObject([{ id: 'second' }, { id: 'first' }]);
  });

  it('filters sales by an ISO timestamp range', async () => {
    await repository.add({ id: 'august', amount: 8_000, soldAt: '2026-08-31T23:00:00.000Z', createdAt: '2026-08-31T23:00:00.000Z' });
    await repository.add({ id: 'september', amount: 10_000, soldAt: '2026-09-01T10:00:00.000Z', createdAt: '2026-09-01T10:00:00.000Z' });

    await expect(repository.listForMonth('2026-09-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z')).resolves.toMatchObject([{ id: 'september' }]);
  });

  it('updates an existing sale', async () => {
    const sale = { id: 'sale', amount: 10_000, soldAt: '2026-09-01T10:00:00.000Z', createdAt: '2026-09-01T10:00:00.000Z' };
    await repository.add(sale);

    await repository.update({ ...sale, amount: 15_000 });

    await expect(repository.list()).resolves.toMatchObject([{ id: 'sale', amount: 15_000 }]);
  });

  it('deletes an existing sale', async () => {
    await repository.add({ id: 'sale', amount: 10_000, soldAt: '2026-09-01T10:00:00.000Z', createdAt: '2026-09-01T10:00:00.000Z' });

    await repository.delete('sale');

    await expect(repository.list()).resolves.toEqual([]);
  });
});
