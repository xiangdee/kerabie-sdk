import { HttpClient } from '../http';
import { BlockVisitorParams, ListVisitorsParams, PaginationMeta, Visitor, VisitorsExport, VisitorsOverview } from '../types';

export class VisitorsResource {
  constructor(private readonly http: HttpClient) {}

  /** Visitors from the last few days (online and offline) with visit counts and block/allow status. */
  async list(params?: ListVisitorsParams): Promise<{ data: Visitor[]; meta: PaginationMeta & { truncated: boolean } }> {
    return this.http.get('/v1/visitors', params as any);
  }

  /** Visitors on the site right now. */
  async getActive(): Promise<{ data: Visitor[] }> {
    const { data } = await this.list({ status: 'online', limit: 100 });
    return { data };
  }

  /** Online now, countries and returning visitors (24h), active IP blocks, top countries. */
  async getOverview(): Promise<VisitorsOverview> {
    return this.http.get('/v1/visitors/overview');
  }

  /**
   * CSV of the visitors matching the filters (max 5,000). Requires a plan with
   * data exports (Pro and above) — otherwise throws an HttpError with status 403.
   */
  async export(params?: Omit<ListVisitorsParams, 'page' | 'limit'>): Promise<VisitorsExport> {
    return this.http.get('/v1/visitors/export', params as any);
  }

  async getPages(sessionId: string): Promise<{ data: { url: string; title: string; visitedAt: string }[] }> {
    return this.http.get(`/v1/visitors/${sessionId}/pages`);
  }

  async block(sessionId: string, params?: BlockVisitorParams): Promise<{ success: boolean }> {
    return this.http.post(`/v1/visitors/${sessionId}/block`, params ?? {});
  }
}
