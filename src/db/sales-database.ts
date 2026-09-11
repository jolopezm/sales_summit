import Dexie, { type EntityTable } from 'dexie';
import type { Sale } from '../domain/models';

export class SalesDatabase extends Dexie {
  sales!: EntityTable<Sale, 'id'>;

  constructor() {
    super('sales-summit');
    this.version(1).stores({
      sales: 'id, soldAt, createdAt'
    });
  }
}

export const salesDatabase = new SalesDatabase();
