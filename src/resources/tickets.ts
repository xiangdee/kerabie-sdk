import { HttpClient } from '../http';
import {
  CreateTicketParams,
  ExportTicketsParams,
  PaginationMeta,
  Ticket,
  TicketExport,
  TicketMessage,
  TicketStats,
  UpdateTicketParams,
} from '../types';

export class TicketsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: { status?: string; priority?: string; page?: number; limit?: number }): Promise<{ data: Ticket[]; meta: PaginationMeta }> {
    return this.http.get('/v1/tickets', params as any);
  }

  /** Open, unassigned and SLA-breaching counts plus the 7-day average resolution time and its change. */
  async getStats(): Promise<TicketStats> {
    return this.http.get('/v1/tickets/stats');
  }

  /**
   * CSV of tickets matching the filters (max 5,000). Requires a plan with
   * data exports (Pro and above) — otherwise throws an HttpError with status 403.
   */
  async export(params?: ExportTicketsParams): Promise<TicketExport> {
    return this.http.get('/v1/tickets/export', params as any);
  }

  async get(id: number): Promise<Ticket & { messages: TicketMessage[] }> {
    return this.http.get(`/v1/tickets/${id}`);
  }

  async create(params: CreateTicketParams): Promise<{ ticketId: number; message: TicketMessage }> {
    return this.http.post('/v1/tickets', params);
  }

  async update(id: number, params: UpdateTicketParams): Promise<Ticket> {
    return this.http.patch(`/v1/tickets/${id}`, params);
  }

  async resolve(id: number): Promise<Ticket> {
    return this.update(id, { status: 'RESOLVED' });
  }

  async close(id: number): Promise<Ticket> {
    return this.update(id, { status: 'CLOSED' });
  }

  async reply(id: number, message: string): Promise<TicketMessage> {
    return this.http.post(`/v1/tickets/${id}/reply`, { message });
  }
}
