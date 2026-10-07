import { HttpClient } from '../http';
import { StoreProduct, PaginationMeta } from '../types';

export class StoreResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: { page?: number; limit?: number }): Promise<{ data: StoreProduct[]; meta: PaginationMeta }> {
    return this.http.get('/v1/store/products', params as any);
  }

  async get(id: number): Promise<StoreProduct> {
    return this.http.get(`/v1/store/products/${id}`);
  }
}
