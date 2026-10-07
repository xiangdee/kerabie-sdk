import { HttpClient } from '../http';
import { AiToolTestResult, CreateMcpServerParams, McpServer, UpdateMcpServerParams } from '../types';

/** Remote MCP servers whose tools your AI chatbot can call, next to your own AI tools. */
export class McpServersResource {
  constructor(private readonly http: HttpClient) {}

  /** Connected servers, with the tools each offers and which are switched on. */
  async list(): Promise<{ servers: McpServer[]; limit: number }> {
    return this.http.get('/v1/mcp-servers');
  }

  /**
   * Connects a server and reads its tools. No tool is switched on yet: use `update` with `enabledTools`.
   * Throws an HttpError with status 400 when the server can't be reached, 403 when your plan has no AI tools,
   * and 409 when it is already connected.
   */
  async create(params: CreateMcpServerParams): Promise<{ server: McpServer }> {
    return this.http.post('/v1/mcp-servers', params);
  }

  /** Reads the server's tools again. Switched-on tools the server no longer offers are dropped. */
  async sync(id: number): Promise<{ server: McpServer }> {
    return this.http.post(`/v1/mcp-servers/${id}/sync`, {});
  }

  /** Renames, switches the server on or off, changes which tools the chatbot may use, or updates credentials. */
  async update(id: number, params: UpdateMcpServerParams): Promise<{ server: McpServer }> {
    return this.http.patch(`/v1/mcp-servers/${id}`, params);
  }

  async delete(id: number): Promise<{ success: boolean }> {
    return this.http.delete(`/v1/mcp-servers/${id}`);
  }

  /** Runs one of the server's tools once with `args`, the way the chatbot would. Limited to 40 a hour. */
  async test(id: number, tool: string, args: Record<string, unknown> = {}): Promise<AiToolTestResult> {
    return this.http.post(`/v1/mcp-servers/${id}/test`, { tool, args });
  }
}
