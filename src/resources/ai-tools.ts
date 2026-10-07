import { HttpClient } from '../http';
import { AiTool, AiToolDetail, AiToolStats, AiToolTestResult, CreateAiToolParams, UpdateAiToolParams } from '../types';

export class AiToolsResource {
  constructor(private readonly http: HttpClient) {}

  /** Your AI agent tools (custom API actions the chatbot can call), with 30-day usage and your plan's limit. */
  async list(): Promise<{ tools: AiTool[]; stats: AiToolStats }> {
    return this.http.get('/v1/ai-tools');
  }

  /** One tool. Secrets are never returned. */
  async get(id: number): Promise<AiToolDetail> {
    return this.http.get(`/v1/ai-tools/${id}`);
  }

  /**
   * Adds a tool. Throws an HttpError with status 403 when your plan has no room for another,
   * 409 when the function name is taken, and 400 for a private or local endpoint.
   */
  async create(params: CreateAiToolParams): Promise<{ tool: { id: number } }> {
    return this.http.post('/v1/ai-tools', params);
  }

  /** Edits fields and/or switches the tool on or off with `enabled`. Send only what you want to change. */
  async update(id: number, params: UpdateAiToolParams): Promise<{ tool: { id: number } }> {
    return this.http.patch(`/v1/ai-tools/${id}`, params);
  }

  /** A copy that starts switched off. Counts against your plan's tool limit. */
  async duplicate(id: number): Promise<{ tool: { id: number } }> {
    return this.http.post(`/v1/ai-tools/${id}/duplicate`, {});
  }

  async delete(id: number): Promise<{ success: boolean }> {
    return this.http.delete(`/v1/ai-tools/${id}`);
  }

  /** Calls the tool's real endpoint once with `args`, the way the AI would. Not counted as usage. Limited to 40 a hour. */
  async test(id: number, args: Record<string, unknown> = {}): Promise<AiToolTestResult> {
    return this.http.post(`/v1/ai-tools/${id}/test`, { args });
  }
}
