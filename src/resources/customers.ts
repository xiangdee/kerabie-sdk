import { HttpClient } from '../http';
import { Conversation, Customer, PaginationMeta, UpsertCustomerParams } from '../types';

export class CustomersResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: { search?: string; page?: number; limit?: number }): Promise<{ data: Customer[]; meta: PaginationMeta }> {
    return this.http.get('/v1/customers', params as any);
  }

  async get(id: number): Promise<Customer> {
    return this.http.get(`/v1/customers/${id}`);
  }

  async upsert(params: UpsertCustomerParams): Promise<Customer> {
    return this.http.post('/v1/customers', params);
  }

  async update(id: number, params: Partial<UpsertCustomerParams>): Promise<Customer> {
    return this.http.patch(`/v1/customers/${id}`, params);
  }

  async getConversations(id: number): Promise<{ data: Conversation[] }> {
    return this.http.get(`/v1/customers/${id}/conversations`);
  }

  async delete(id: number): Promise<void> {
    return this.http.delete(`/v1/customers/${id}`);
  }
}
