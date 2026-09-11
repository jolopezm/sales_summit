import type { Sale } from '../domain/models';
import { salesDatabase, type SalesDatabase } from '../db/sales-database';
import type { SaleRepository } from './sale-repository';

export class DexieSaleRepository implements SaleRepository {
  constructor(private readonly database: SalesDatabase = salesDatabase) {}

  async add(sale: Sale): Promise<void> {
    await this.database.sales.add(sale);
  }

  async list(): Promise<Sale[]> {
    return this.database.sales.orderBy('soldAt').reverse().toArray();
  }

  async listForMonth(monthStart: string, monthEnd: string): Promise<Sale[]> {
    return this.database.sales
      .where('soldAt')
      .between(monthStart, monthEnd, true, false)
      .reverse()
      .toArray();
  }
}
