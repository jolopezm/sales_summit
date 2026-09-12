import type { Sale } from '../domain/models';

export interface SaleRepository {
  add(sale: Sale): Promise<void>;
  update(sale: Sale): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<Sale[]>;
  listForMonth(monthStart: string, monthEnd: string): Promise<Sale[]>;
}
