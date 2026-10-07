import { HttpClient } from '../http';
import {
  Conversation,
  CreateConversationParams,
  ListConversationsParams,
  ListMessagesParams,
  Message,
  PaginationMeta,
  PreviousConversation,
  SendMessageParams,
  TakeOverParams,
  UpdateConversationParams,
} from '../types';

export class ConversationsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ListConversationsParams): Promise<{ data: Conversation[]; meta: PaginationMeta }> {
    return this.http.get('/v1/conversations', params as any);
  }

  async get(id: number): Promise<Conversation> {
    return this.http.get(`/v1/conversations/${id}`);
  }

  async create(params: CreateConversationParams): Promise<Conversation> {
    return this.http.post('/v1/conversations', params);
  }

  async update(id: number, params: UpdateConversationParams): Promise<Conversation> {
    return this.http.patch(`/v1/conversations/${id}`, params);
  }

  async resolve(id: number): Promise<Conversation> {
    return this.update(id, { status: 'RESOLVED' });
  }

  async close(id: number): Promise<Conversation> {
    return this.update(id, { status: 'CLOSED' });
  }

  async assign(id: number, agentId: number): Promise<Conversation> {
    return this.update(id, { assignedTeamMemberId: agentId });
  }

  /** The same customer's earlier conversations, newest first (default 5, max 20). */
  async getHistory(id: number, limit?: number): Promise<{ data: PreviousConversation[] }> {
    return this.http.get(`/v1/conversations/${id}/history`, { limit });
  }

  /**
   * Hand a conversation from the AI assistant to a human: stops the bot and
   * assigns `agentId` (a team-member id) if nobody holds it yet. Fails with
   * 400 if the AI is no longer handling it.
   */
  async takeOver(id: number, params: TakeOverParams): Promise<{ success: boolean; conversationId: number }> {
    return this.http.post(`/v1/conversations/${id}/take-over`, params);
  }

  async getMessages(id: number, params?: ListMessagesParams): Promise<{ data: Message[]; meta: { hasMore: boolean; nextCursor?: string } }> {
    return this.http.get(`/v1/conversations/${id}/messages`, params as any);
  }

  async sendMessage(id: number, params: SendMessageParams): Promise<Message> {
    return this.http.post(`/v1/conversations/${id}/messages`, params);
  }

  async delete(id: number): Promise<void> {
    return this.http.delete(`/v1/conversations/${id}`);
  }
}
