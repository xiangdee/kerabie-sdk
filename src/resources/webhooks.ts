import { createHmac, timingSafeEqual } from 'crypto';
import { HttpClient } from '../http';
import { CreateWebhookParams, Webhook, WebhookPayload } from '../types';

export class WebhooksResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<{ data: Webhook[] }> {
    return this.http.get('/v1/webhooks');
  }

  async get(id: number): Promise<Webhook> {
    return this.http.get(`/v1/webhooks/${id}`);
  }

  async create(params: CreateWebhookParams): Promise<Webhook> {
    return this.http.post('/v1/webhooks', params);
  }

  async update(id: number, params: Partial<CreateWebhookParams & { isActive: boolean }>): Promise<Webhook> {
    return this.http.patch(`/v1/webhooks/${id}`, params);
  }

  async delete(id: number): Promise<void> {
    return this.http.delete(`/v1/webhooks/${id}`);
  }

  /**
   * Verify an incoming webhook signature.
   * The signature header is `X-Kerabie-Signature`.
   */
  static verify(rawBody: string, signature: string, secret: string): boolean {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const expectedHeader = `sha256=${expected}`;
    try {
      return timingSafeEqual(Buffer.from(expectedHeader), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  /**
   * Parse a verified webhook payload with full TypeScript types.
   */
  static parse<T = any>(rawBody: string): WebhookPayload<T> {
    return JSON.parse(rawBody);
  }
}
