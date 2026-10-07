import { HttpClient } from './http';
import { KerAbieClientConfig } from './types';
import { ConversationsResource } from './resources/conversations';
import { CustomersResource } from './resources/customers';
import { VisitorsResource } from './resources/visitors';
import { AgentsResource } from './resources/agents';
import { KnowledgeBaseResource } from './resources/knowledge-base';
import { WebhooksResource } from './resources/webhooks';
import { AnalyticsResource } from './resources/analytics';
import { StoreResource } from './resources/store';
import { TicketsResource } from './resources/tickets';
import { ContactsResource } from './resources/contacts';
import { CampaignsResource } from './resources/campaigns';
import { AiToolsResource } from './resources/ai-tools';
import { McpServersResource } from './resources/mcp-servers';

export class KerAbieClient {
  readonly conversations: ConversationsResource;
  readonly customers: CustomersResource;
  readonly visitors: VisitorsResource;
  readonly agents: AgentsResource;
  readonly kb: KnowledgeBaseResource;
  readonly webhooks: WebhooksResource;
  readonly analytics: AnalyticsResource;
  readonly store: StoreResource;
  readonly tickets: TicketsResource;
  readonly contacts: ContactsResource;
  readonly campaigns: CampaignsResource;
  readonly aiTools: AiToolsResource;
  readonly mcpServers: McpServersResource;

  private readonly http: HttpClient;

  constructor(config: KerAbieClientConfig) {
    if (!config.apiKey) throw new Error('KerAbieClient: apiKey is required');

    const baseUrl = config.baseUrl ?? 'https://api.kerabie.com';
    this.http = new HttpClient(baseUrl, config.apiKey, config.orgId, config.timeout);

    this.conversations = new ConversationsResource(this.http);
    this.customers = new CustomersResource(this.http);
    this.visitors = new VisitorsResource(this.http);
    this.agents = new AgentsResource(this.http);
    this.kb = new KnowledgeBaseResource(this.http);
    this.webhooks = new WebhooksResource(this.http);
    this.analytics = new AnalyticsResource(this.http);
    this.store = new StoreResource(this.http);
    this.tickets = new TicketsResource(this.http);
    this.contacts = new ContactsResource(this.http);
    this.campaigns = new CampaignsResource(this.http);
    this.aiTools = new AiToolsResource(this.http);
    this.mcpServers = new McpServersResource(this.http);
  }
}
