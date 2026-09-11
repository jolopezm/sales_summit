import type { Sale } from '../domain/models';

export interface SaleRepository {
  add(sale: Sale): Promise<void>;
  list(): Promise<Sale[]>;
  listForMonth(monthStart: string, monthEnd: string): Promise<Sale[]>;
}
