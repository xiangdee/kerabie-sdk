export interface KerAbieClientConfig {
  apiKey: string;
  orgId?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
  /** Total pages (conversation lists). */
  pages?: number;
  /** Organisation-wide totals per status — ignores the list filters (conversation lists). */
  counts?: ConversationCounts;
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export type ConversationStatus = 'WAITING' | 'ACTIVE' | 'RESOLVED' | 'CLOSED';
export type ConversationChannel = 'WEBSITE' | 'WHATSAPP' | 'INSTAGRAM' | 'EMAIL' | 'API';

export interface Conversation {
  id: number;
  status: ConversationStatus;
  channel: ConversationChannel;
  subject?: string | null;
  customerId?: number | null;
  customer?: { id: number; name: string | null; email: string | null; sessionId: string };
  /** Team-member id of the assignee, if any. */
  assignedTeamMemberId?: number | null;
  assignedAgent?: { id: number; userId: number; user: { fname: string | null; lname: string | null; email: string; avatar?: string | null } } | null;
  rating?: number | null;
  ratingComment?: string | null;
  /** Text of the most recent message (list responses). */
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  /** First few tags (list responses); `get` returns all of them. */
  tags?: { tag: string }[];
  /** True while the AI bot is handling the conversation alone: still open, no human reply, not handed off. */
  aiHandling?: boolean;
  /** AI recap written when the bot hands off to a human. */
  handoffSummary?: string | null;
  /** Unread message count, under `_count.messages` (list responses). */
  _count?: { messages: number };
  createdAt: string;
  updatedAt: string;
}

/** Organisation-wide conversation totals per status. */
export interface ConversationCounts {
  all: number;
  WAITING: number;
  ACTIVE: number;
  RESOLVED: number;
  CLOSED: number;
}

/** An earlier conversation with the same customer. */
export interface PreviousConversation {
  id: number;
  status: ConversationStatus;
  channel: ConversationChannel;
  subject: string | null;
  isTicket: boolean;
  createdAt: string;
  lastMessageAt: string | null;
  handoffSummary: string | null;
}

export interface TakeOverParams {
  /** Organisation team-member id the conversation is assigned to if nobody holds it yet. */
  agentId: number;
}

export interface ListConversationsParams {
  status?: ConversationStatus;
  channel?: ConversationChannel;
  page?: number;
  limit?: number;
  search?: string;
  assignedTo?: number;
}

export interface CreateConversationParams {
  customerId?: number;
  customerEmail?: string;
  subject?: string;
  channel?: ConversationChannel;
  metadata?: Record<string, any>;
}

export interface UpdateConversationParams {
  status?: ConversationStatus;
  assignedTeamMemberId?: number;
  rating?: number;
  ratingComment?: string;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
export type SenderType = 'agent' | 'visitor' | 'bot';

export interface Message {
  id: number;
  conversationId: number;
  body: string;
  type: MessageType;
  senderType: SenderType;
  senderName?: string;
  agentId?: number;
  metadata?: Record<string, any>;
  attachments?: Attachment[];
  createdAt: string;
}

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'file' | 'audio' | 'video';
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface SendMessageParams {
  body: string;
  type?: MessageType;
  metadata?: Record<string, any>;
}

export interface ListMessagesParams {
  limit?: number;
  before?: number;
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  externalSource?: string;
  externalRef?: string;
  customAttributes?: Record<string, string>;
  conversationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertCustomerParams {
  email?: string;
  name?: string;
  phone?: string;
  externalSource?: string;
  externalRef?: string;
  customAttributes?: Record<string, string>;
}

// ─── Visitor ──────────────────────────────────────────────────────────────────

export type VisitorStatus = 'online' | 'offline' | 'blocked' | 'allowed';

/** A visitor from the last few days — on the site now or recently gone. */
export interface Visitor {
  /** The widget's anonymous session id. */
  sessionId: string;
  /** From the contact record if they have chatted, otherwise as identified to the widget. */
  name: string | null;
  email: string | null;
  phone: string | null;
  /** ISO 3166-1 alpha-2 code, e.g. "NG". */
  country: string | null;
  city: string | null;
  /** null when the organisation hides visitor IPs in its privacy settings. */
  ip: string | null;
  userAgent: string | null;
  /** The page they are on now (online) or were last on. */
  currentPage: string | null;
  /** Visits so far. Coming back after 30+ minutes away counts as a new visit. */
  visitCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  /** Their most recent conversation, if they have chatted. */
  conversationId: number | null;
  /** Blocked / allowed come from your IP rules and win over online / offline. */
  status: VisitorStatus;
}

export interface ListVisitorsParams {
  status?: 'all' | VisitorStatus;
  /** Matches name, email, IP, city or page, case-insensitively. */
  search?: string;
  /** Two-letter country code. */
  country?: string;
  /** How far back to look: default 7, max 30 (visitor history is kept for 30 days). */
  days?: number;
  page?: number;
  limit?: number;
}

export interface VisitorsOverview {
  /** On the site right now. */
  online: number;
  /** Distinct countries in the last 24 hours. */
  countries: number;
  /** Visitors in the last 24 hours who have visited more than once. */
  returning: number;
  /** Active IP block rules. */
  blockedIps: number;
  topCountries: { country: string; count: number }[];
}

export interface VisitorsExport {
  /** e.g. visitors-2026-10-05.csv */
  filename: string;
  csv: string;
  count: number;
  /** True when more than 5,000 matched and the file was cut at 5,000. */
  truncated: boolean;
}

export interface BlockVisitorParams {
  reason?: string;
  blockIp?: boolean;
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export type CampaignStatus = 'active' | 'paused' | 'draft';
export type CampaignTrigger = 'page_load' | 'time_on_page' | 'scroll_depth' | 'exit_intent';
export type CampaignAction = 'open_chat' | 'open_kb' | 'open_link';
export type CampaignAudience = 'all' | 'new' | 'returning' | 'not_chatted' | 'country';
export type CampaignFrequency = 'once_per_visitor' | 'once_per_day' | 'every_session';

export interface Campaign {
  id: number;
  name: string;
  /** What the visitor sees. */
  message: string;
  /** Button text; no button when null. */
  ctaLabel: string | null;
  ctaAction: CampaignAction;
  /** Only for `open_link`. */
  ctaUrl: string | null;
  trigger: CampaignTrigger;
  /** Seconds for `time_on_page`, percent for `scroll_depth`, otherwise null. */
  triggerValue: string | null;
  /** Comma-separated URL patterns (`*` wildcards); null = every page. */
  pages: string | null;
  audience: CampaignAudience;
  /** ISO country code (e.g. `NG`), only for audience `country`. */
  audienceCountry: string | null;
  frequency: CampaignFrequency;
  isActive: boolean;
  /** `draft` = never launched, `paused` = launched before but off. */
  status: CampaignStatus;
  launchedAt: string | null;
  /** Times it was shown to a visitor. */
  sentCount: number;
  /** Visitors who opened the chat from it. */
  openedCount: number;
  /** Visitors who pressed its button. */
  clickCount: number;
  /** Visitors who wrote back after opening it. */
  repliedCount: number;
  createdAt: string;
}

export interface ListCampaignsParams {
  status?: CampaignStatus;
  /** Matches name or message, case-insensitively. */
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateCampaignParams {
  name: string;
  message: string;
  ctaLabel?: string;
  ctaAction?: CampaignAction;
  ctaUrl?: string;
  trigger?: CampaignTrigger;
  triggerValue?: string | number;
  pages?: string;
  audience?: CampaignAudience;
  /** Required when audience is `country`. */
  audienceCountry?: string;
  frequency?: CampaignFrequency;
  /** `true` launches it straight away (counts against your plan's live-campaign limit). Default: saved as a draft. */
  isActive?: boolean;
}

export type UpdateCampaignParams = Partial<CreateCampaignParams>;

export interface CampaignStats {
  total: number;
  active: number;
  paused: number;
  draft: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  /** Most campaigns your plan lets you run at once; 0 = unlimited. */
  limit: number;
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export type ContactType = 'LEAD' | 'CUSTOMER' | 'VIP';

export interface Contact {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  contactType: ContactType;
  /** Team-member id of the owner, if any. */
  ownerId: number | null;
  owner: { id: number; user: { fname: string | null; lname: string | null; email: string; avatar?: string | null } } | null;
  tagLinks: { tag: { id: number; name: string; color: string | null } }[];
  /** Two-letter country code, from the visitor's IP when they chatted in. */
  visitorCountry: string | null;
  /** 'manual', 'import', or null for contacts who wrote in themselves. */
  externalSource: string | null;
  /** Last message in either direction; falls back to the latest conversation for older contacts. */
  lastContactAt: string | null;
  createdAt: string;
  _count: { conversations: number };
}

export interface ListContactsParams {
  /** Matches name, email, phone, company or a tag name, case-insensitively. */
  search?: string;
  type?: ContactType;
  tagId?: number;
  /** Team-member id. */
  ownerId?: number;
  /** 'recent' (default) = last contact first, contacts never messaged last. */
  sort?: 'recent' | 'newest' | 'name';
  page?: number;
  limit?: number;
}

export interface CreateContactParams {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  contactType?: ContactType;
  ownerId?: number | null;
}

export type UpdateContactParams = CreateContactParams;

export interface ContactStats {
  total: number;
  /** Added in the last 7 days. */
  newThisWeek: number;
  leads: number;
  vip: number;
}

export interface ImportContactRow {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  /** lead, customer or vip (any case). Defaults to lead. */
  type?: string;
}

export interface ImportContactsResult {
  created: number;
  /** Rows skipped because the email already belongs to a contact. */
  duplicates: number;
  /** Rows that could not be imported. `row` is 1-based, not counting the header. */
  invalid: { row: number; error: string }[];
  total: number;
}

// ─── Agent ───────────────────────────────────────────────────────────────────

export interface Agent {
  id: number;
  fname: string;
  lname: string;
  email: string;
  avatar?: string;
  availability?: 'online' | 'away' | 'offline';
  role?: string;
}

export interface InviteAgentParams {
  email: string;
  accessLevel?: 'ADMIN' | 'CHAT_ONLY' | 'READ_ONLY';
  teamId?: number;
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────

export type KbArticleType = 'faq' | 'article' | 'news' | 'information';
export type KbArticleStatus = 'draft' | 'published' | 'archived';

export interface KbArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  type: KbArticleType;
  status: KbArticleStatus;
  imageUrl?: string;
  views: number;
  /** Share of widget visitors who found it helpful (0-100); null until at least 3 have voted. */
  helpfulPct: number | null;
  /** How many visitors have voted. */
  votes: number;
  /** Times the AI chatbot cited it in an answer. */
  aiCitations: number;
  createdAt: string;
  updatedAt: string;
}

export interface KbStats {
  total: number;
  published: number;
  drafts: number;
  views: number;
  /** The most viewed published article; null until something has been viewed. */
  top: { title: string; views: number } | null;
  /** Categories in use. */
  categories: string[];
}

export interface KbInsights {
  mostViewed: { id: number; title: string; views: number; pct: number }[];
  /** Customer questions the AI had no article to answer from in the last 30 days: what to write next. */
  gaps: { question: string; count: number }[];
  /** Published articles with the lowest helpfulness, lowest first (needs 3 votes). */
  lowestRated: { id: number; title: string; helpfulPct: number; votes: number }[];
  /** Published articles not updated in 90 days. */
  stale: { id: number; title: string; age: string }[];
}

export interface CreateArticleParams {
  title: string;
  content: string;
  category?: string;
  type?: KbArticleType;
  status?: KbArticleStatus;
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Ticket {
  id: number;
  status: ConversationStatus;
  priority: TicketPriority;
  subject?: string;
  slaDueAt?: string;
  customerId?: number;
  createdAt: string;
  updatedAt: string;
}

/** KPI numbers for the tickets overview. */
export interface TicketStats {
  /** Tickets that are new or active. */
  open: number;
  /** Open tickets nobody owns. */
  unassigned: number;
  /** Open tickets past their SLA due time. */
  breachingSla: number;
  /** Average open→resolved time in minutes over the last 7 days; null when none were resolved. */
  avgResolutionMinutes: number | null;
  /** % change vs the 7 days before; negative = faster. Null when there is nothing to compare. */
  resolutionDeltaPct: number | null;
}

export interface ExportTicketsParams {
  status?: ConversationStatus;
  priority?: TicketPriority;
  /** Matches requester name or email, subject, or a ticket reference such as KB-2041. */
  search?: string;
  /** User id of the assigned agent. */
  assignedTo?: number;
}

export interface TicketExport {
  /** e.g. tickets-2026-10-05.csv */
  filename: string;
  csv: string;
  count: number;
  /** True when more than 5,000 tickets matched and the file was cut at 5,000. */
  truncated: boolean;
}

export interface CreateTicketParams {
  /** A stable identifier for this end user in your own system — repeated calls with the same externalRef land on the same ticket. */
  externalRef: string;
  message: string;
  subject?: string;
  priority?: TicketPriority;
  name?: string;
  email?: string;
}

export interface UpdateTicketParams {
  status?: ConversationStatus;
  priority?: TicketPriority;
}

export interface TicketMessage {
  id: number;
  body: string;
  senderRole: 'agent' | 'customer';
  senderName?: string;
  createdAt: string;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export interface StoreProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category?: string;
  stock?: number;
  sku?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export type WebhookEvent =
  | 'message.sent.customer'
  | 'message.sent.agent'
  | 'conversation.created'
  | 'conversation.resolved'
  | 'conversation.assigned'
  | 'visitor.new'
  | 'rating.submitted';

export interface Webhook {
  id: number;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  secret?: string;
  createdAt: string;
}

export interface CreateWebhookParams {
  url: string;
  events: WebhookEvent[];
  secret?: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  period: { days: number; since: string };
  /** Currently open (new + active) conversations. */
  openConversations: number;
  /** Conversations resolved or closed since midnight. */
  resolvedToday: number;
  /** Average first-response time in seconds (0 when there is no data). */
  avgResponseTime: number;
  /** Customer satisfaction 0–100 (average rating × 20). */
  satisfactionScore: number;
  /** Visitors on the website right now. */
  activeVisitors: number;
  totals: {
    conversations: number; resolved: number; closed: number; messages: number; visitors: number; aiChats: number;
    /** Tickets created in the period. */
    tickets: number;
    /** Contacts added (someone with a name, email or phone). */
    contacts: number;
    /** Website visitor sessions that started in the period (history is kept 30 days, so longer windows count that far back). */
    siteVisitors: number;
  };
  rates: { resolution: number };
  satisfaction: { avgRating: number | null; totalRatings: number };
  /** % change vs the previous period of the same length; null = nothing to compare. For responseTime, negative is an improvement. */
  deltas: { conversations: number | null; resolved: number | null; responseTime: number | null; satisfaction: number | null; aiChats: number | null };
  /** The AI assistant's share of the work. */
  ai: {
    /** Conversations the AI handled alone (no human ever replied). */
    resolvedAlone: number;
    resolvedAlonePct: number;
    /** Share of conversations handed off to a human. */
    handedOffPct: number;
    /** Estimate: AI-only conversations × the average time agents spent on human-handled ones. */
    agentHoursSaved: number;
  };
  channels: { channel: string; count: number }[];
  aiEscalations: { reason: string; count: number }[];
  /** Daily buckets (up to 30), oldest first. `ai` + `human` = `count`. */
  trend: { date: string; count: number; ai: number; human: number }[];
}

export interface AnalyticsParams {
  /** Window in days (default 30, max 365). */
  days?: number;
  /** Alternative to `days`, e.g. '7d' or '30d'. */
  period?: string;
}

export interface AgentStat {
  agentId: number;
  /** Full name, falling back to the email's local part for agents who haven't set one. */
  name: string;
  avatar?: string | null;
  availability: 'online' | 'away' | 'busy' | 'offline' | string;
  messages: number;
  assigned: number;
  resolved: number;
  resolutionRate: number;
  avgRating: number | null;
}

/** An agent in {@link AnalyticsInsights}: the usual stats plus first-response time. */
export interface AgentInsight extends AgentStat {
  /** Average time to this agent's first reply on conversations they answered first; null when there are none. */
  firstResponseSeconds: number | null;
}

export interface QuestionInsight {
  /** The wording customers used most. */
  question: string;
  asked: number;
  /** Share of these conversations the AI handled without a person stepping in. */
  aiResolvedPct: number;
  /** Average customer rating (1-5) of these conversations; null when none were rated. */
  avgRating: number | null;
  /** The page most of them started on. */
  page: string | null;
  /** % change in how often it was asked vs the previous period; null when it is new. */
  trendPct: number | null;
}

/** The deeper numbers behind the dashboard's Analytics page. */
export interface AnalyticsInsights {
  period: { days: number; since: string };
  /** Median time from a customer's first message to a person's first reply. `deltaPct` is vs the previous period (negative = faster). */
  firstResponse: { medianSeconds: number | null; deltaPct: number | null; sample: number };
  agents: AgentInsight[];
  channels: { channel: string; count: number; pct: number; firstResponseSeconds: number | null; avgRating: number | null }[];
  ai: {
    csatOnAiChats: { avg: number | null; count: number };
    /** The most frequently asked questions (top 20), grouped by wording. */
    questions: QuestionInsight[];
    /** Questions handed to a person because nothing in the knowledge base matched. */
    unanswered: { question: string; count: number }[];
    outcomes: { resolvedByAi: number; handedOff: number; other: number };
  };
  customers: {
    active: number;
    new: number;
    returning: number;
    perCustomer: number | null;
    deltas: { active: number | null; new: number | null; returning: number | null };
    /** One row per star, 5 first. */
    csat: { stars: number; count: number; pct: number }[];
    csatResponses: number;
    countries: { country: string; count: number }[];
    newPct: number;
    returningPct: number;
    top: { id: number; name: string; company: string | null; conversations: number; lastSeenAt: string | null; avgRating: number | null }[];
    /** Customer messages by weekday (Monday first) and two-hour block (0, 2, … 22), in the organisation's timezone. */
    heatmap: { days: string[]; cells: number[][]; timezone: string };
  };
  /** Pages that start the most conversations. `askRate` is null until the page has recorded views. */
  pages: { page: string; views: number; questions: number; askRate: number | null; topQuestion: string | null }[];
}

/** Open tickets by priority and how many are still inside their SLA. */
export interface TicketSla {
  total: number;
  withinSlaPct: number;
  byPriority: { priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'; count: number; oldestMinutes: number | null }[];
}

/** Which first-run steps are done. */
export interface SetupStatus {
  channel: boolean;
  ai: boolean;
  automation: boolean;
}

// ─── Webhook verification ─────────────────────────────────────────────────────

export interface WebhookPayload<T = any> {
  event: WebhookEvent;
  orgId: number;
  timestamp: string;
  data: T;
}

// ─── AI tools ────────────────────────────────────────────────────────────────

export type AiToolMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';
export type AiToolAuthType = 'none' | 'bearer' | 'api_key' | 'basic';

export interface AiToolParameter {
  /** Letters, numbers and underscores. */
  name: string;
  type: 'string' | 'number' | 'boolean';
  /** What the AI should put here, e.g. "Product SKU the customer mentioned". */
  description?: string;
  /** Default `true`: the AI collects it before calling your API. */
  required?: boolean;
}

export interface AiToolUsage {
  /** Calls in the last 30 days. */
  calls: number;
  /** Calls that failed (error or HTTP 4xx/5xx) in the last 30 days. */
  failures: number;
  lastUsedAt: string | null;
}

export interface AiTool {
  id: number;
  /** The snake_case function name the AI calls. */
  name: string;
  displayName: string;
  /** The AI reads this to decide when to call the tool. */
  description: string;
  parameters: Required<AiToolParameter>[];
  endpoint: string;
  method: AiToolMethod;
  authType: AiToolAuthType;
  /** Dot-notation path into the JSON response; null = the whole response. */
  responsePath: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  usage: AiToolUsage;
}

/** One tool as returned by `get`: secrets are never returned, `hasSecret` says whether one is stored. */
export interface AiToolDetail extends Omit<AiTool, 'usage'> {
  /** Names and headers only; secret values come back empty. */
  authConfig: Record<string, string> | null;
  headers: Record<string, string> | null;
  hasSecret: boolean;
}

export interface AiToolStats {
  total: number;
  active: number;
  /** Calls in the last 30 days. */
  calls: number;
  /** Percent of calls that succeeded; null when there were none. */
  successRate: number | null;
  /** How many tools your plan allows: -1 = not on your plan, 0 = unlimited. */
  limit: number;
}

export interface CreateAiToolParams {
  /** snake_case, unique in your organisation. */
  name: string;
  displayName: string;
  /** 10-500 characters. Say when the AI should use the tool. */
  description: string;
  parameters?: AiToolParameter[];
  /** A public https:// or http:// address. Private and local addresses are rejected. */
  endpoint: string;
  /** Default `POST`. GET sends parameters in the query string, the others as a JSON body. */
  method?: AiToolMethod;
  /** Default `none`. */
  authType?: AiToolAuthType;
  /** bearer: `{ token }` | api_key: `{ header, value }` | basic: `{ username, password }`. Write-only. */
  authConfig?: Record<string, string>;
  /** Extra static headers sent on every call (10 at most). */
  headers?: Record<string, string>;
  responsePath?: string;
  /** Default `true`. */
  enabled?: boolean;
}

/** Send only what you want to change. Leave a secret out of `authConfig` to keep the stored one. */
export type UpdateAiToolParams = Partial<CreateAiToolParams>;

export interface AiToolTestResult {
  success: boolean;
  /** What the AI would see, when the call succeeded. */
  result?: string;
  error?: string;
  statusCode?: number;
  durationMs: number;
}

// ─── MCP servers (tools for your AI chatbot) ────────────────────────────────

export interface McpServerTool {
  name: string;
  description: string;
  /** The tool's input as JSON Schema. */
  inputSchema: Record<string, unknown>;
}

export interface McpServer {
  id: number;
  name: string;
  /** What the server is for and when the chatbot should use it. */
  description: string;
  url: string;
  authType: 'none' | 'bearer' | 'api_key';
  /** Header names and the like; secret values come back empty. */
  authConfig: Record<string, string> | null;
  /** Whether a secret is stored. */
  hasSecret: boolean;
  /** `false` disconnects the whole server from the chatbot. */
  enabled: boolean;
  /** What the server offered at the last sync. */
  tools: McpServerTool[];
  /** Names of the tools the chatbot may use. */
  enabledTools: string[];
  lastSyncedAt: string | null;
  /** Why the last sync failed, if it did. */
  lastError: string | null;
  /** Calls the chatbot made to this server, and how many failed. */
  callCount: number;
  failureCount: number;
  createdAt: string;
}

export interface CreateMcpServerParams {
  name: string;
  /**
   * 10-300 characters: what this server is for and when the chatbot should use it, e.g.
   * "Order and stock lookups for our shop. Use when a customer asks about an order or an item."
   * The chatbot reads it with each of the server's tools to choose the right one.
   */
  description: string;
  /** The server's Streamable HTTP endpoint, a public address. */
  url: string;
  authType?: 'none' | 'bearer' | 'api_key';
  /** bearer: `{ token }` | api_key: `{ header, value }`. Write-only. */
  authConfig?: Record<string, string>;
}

export interface UpdateMcpServerParams {
  name?: string;
  description?: string;
  enabled?: boolean;
  /** Tool names to switch on (the rest are switched off). Counts against your plan's AI tool limit. */
  enabledTools?: string[];
  authType?: 'none' | 'bearer' | 'api_key';
  /** Leave a secret out to keep the stored one. */
  authConfig?: Record<string, string>;
}
