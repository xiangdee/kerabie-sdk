import { HttpClient } from '../http';
import { CreateArticleParams, KbArticle, KbInsights, KbStats, PaginationMeta } from '../types';

export class KnowledgeBaseResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: { search?: string; category?: string; page?: number; limit?: number }): Promise<{ data: KbArticle[]; meta: PaginationMeta }> {
    return this.http.get('/v1/kb/articles', params as any);
  }

  /** Totals and the categories in use. */
  async getStats(): Promise<KbStats> {
    return this.http.get('/v1/kb/stats');
  }

  /** What to write or fix next: most viewed, unanswered customer questions, lowest rated, and stale articles. */
  async getInsights(): Promise<KbInsights> {
    return this.http.get('/v1/kb/insights');
  }

  async get(id: number): Promise<KbArticle> {
    return this.http.get(`/v1/kb/articles/${id}`);
  }

  async search(query: string): Promise<{ data: KbArticle[] }> {
    return this.http.get('/v1/kb/articles', { search: query });
  }

  async createArticle(params: CreateArticleParams): Promise<KbArticle> {
    return this.http.post('/v1/kb/articles', params);
  }

  async updateArticle(id: number, params: Partial<CreateArticleParams>): Promise<KbArticle> {
    return this.http.patch(`/v1/kb/articles/${id}`, params);
  }

  async deleteArticle(id: number): Promise<void> {
    return this.http.delete(`/v1/kb/articles/${id}`);
  }
}
