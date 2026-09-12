import type { SellerProfile } from '../domain/models';

export interface SellerProfileRepository {
  get(): Promise<SellerProfile | null>;
  save(profile: SellerProfile): Promise<void>;
}
