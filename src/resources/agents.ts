import { HttpClient } from '../http';
import { Agent, InviteAgentParams } from '../types';

export class AgentsResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<{ data: Agent[] }> {
    return this.http.get('/v1/agents');
  }

  async getOnline(): Promise<{ data: { agentId: number; name: string; status: string }[] }> {
    return this.http.get('/v1/agents/online');
  }

  async invite(params: InviteAgentParams): Promise<{ success: boolean; message: string }> {
    return this.http.post('/v1/agents/invite', params);
  }
}
