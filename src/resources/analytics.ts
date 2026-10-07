import { HttpClient } from '../http';
import { AgentStat, AnalyticsInsights, AnalyticsParams, AnalyticsSummary, SetupStatus, TicketSla } from '../types';

export class AnalyticsResource {
  constructor(private readonly http: HttpClient) {}

  /** Conversation, response-time, satisfaction and AI numbers for the last `days` days (default 30), with deltas vs the previous period. */
  async getSummary(params?: AnalyticsParams): Promise<AnalyticsSummary> {
    return this.http.get('/v1/analytics/summary', params as any);
  }

  async getAgentStats(params?: AnalyticsParams): Promise<{ agents: AgentStat[] }> {
    return this.http.get('/v1/analytics/agents', params as any);
  }

  /**
   * The deeper numbers: first-response times, per-agent and per-channel results, the questions customers ask,
   * who they are, when they write in, and which pages start conversations.
   */
  async getInsights(params?: AnalyticsParams): Promise<AnalyticsInsights> {
    return this.http.get('/v1/analytics/insights', params as any);
  }

  /** Open tickets by priority, and the percentage still within their SLA. */
  async getTicketSla(): Promise<TicketSla> {
    return this.http.get('/v1/analytics/tickets-sla');
  }

  /** Which of the first-run steps (connect a channel, train the AI, create an automation) are done. */
  async getSetupStatus(): Promise<SetupStatus> {
    return this.http.get('/v1/analytics/setup-status');
  }
}
