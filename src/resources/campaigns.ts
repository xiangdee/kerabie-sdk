import { HttpClient } from '../http';
import {
  Campaign, CampaignStats, CreateCampaignParams, ListCampaignsParams, PaginationMeta, UpdateCampaignParams,
} from '../types';

export class CampaignsResource {
  constructor(private readonly http: HttpClient) {}

  /** Proactive messages shown on your chat widget, newest first. */
  async list(params?: ListCampaignsParams): Promise<{ campaigns: Campaign[]; meta: PaginationMeta }> {
    return this.http.get('/v1/campaigns', params as any);
  }

  /** Totals and funnel numbers, plus how many campaigns your plan lets you run at once. */
  async getStats(): Promise<CampaignStats> {
    return this.http.get('/v1/campaigns/stats');
  }

  async get(id: number): Promise<Campaign> {
    return this.http.get(`/v1/campaigns/${id}`);
  }

  /**
   * Saves a draft, or launches it with `isActive: true`.
   * Throws an HttpError with status 403 when launching would exceed your plan's live-campaign limit.
   */
  async create(params: CreateCampaignParams): Promise<{ campaign: Campaign }> {
    return this.http.post('/v1/campaigns', params);
  }

  /** Edits fields and/or turns it on or off with `isActive`. Send only what you want to change. */
  async update(id: number, params: UpdateCampaignParams): Promise<{ success: boolean }> {
    return this.http.patch(`/v1/campaigns/${id}`, params);
  }

  /** A copy saved as a draft, with fresh results. */
  async duplicate(id: number): Promise<{ campaign: Campaign }> {
    return this.http.post(`/v1/campaigns/${id}/duplicate`, {});
  }

  async delete(id: number): Promise<{ success: boolean }> {
    return this.http.delete(`/v1/campaigns/${id}`);
  }
}
