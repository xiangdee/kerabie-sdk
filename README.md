# @kerabie/sdk

Official TypeScript SDK for the [Kerabie](https://kerabie.com) customer support platform.

## Installation

```bash
npm install @kerabie/sdk
```

## Quick Start

```typescript
import { KerAbieClient } from '@kerabie/sdk';

const kerabie = new KerAbieClient({
  apiKey: process.env.KERABIE_API_KEY,
  orgId: 'your-org-id',           // Optional; set per request or in client
  baseUrl: 'https://api.kerabie.com', // Default
});
```

## Conversations

```typescript
// List conversations
const { data, meta } = await kerabie.conversations.list({ status: 'OPEN', limit: 20 });

// Get a single conversation
const conv = await kerabie.conversations.get(123);

// Send a message
const msg = await kerabie.conversations.sendMessage(123, { body: 'Hello!' });

// Resolve / assign
await kerabie.conversations.resolve(123);
await kerabie.conversations.assign(123, agentId);
```

## Customers

```typescript
// Upsert a customer (create or update)
const customer = await kerabie.customers.upsert({
  email: 'user@example.com',
  name: 'John Doe',
  externalRef: 'app_user_id_123',
  customAttributes: { plan: 'pro' },
});

// Get conversation history
const { data: convs } = await kerabie.customers.getConversations(customer.id);
```

## Campaigns

```typescript
// Proactive messages on your chat widget
const { campaigns, meta } = await kerabie.campaigns.list({ status: 'active' });

// Saved as a draft; add isActive: true to launch it straight away
const { campaign } = await kerabie.campaigns.create({
  name: 'Pricing page nudge',
  message: 'Questions about plans? I can compare them for you in two minutes.',
  ctaLabel: 'Compare plans',
  trigger: 'time_on_page',
  triggerValue: 20,            // seconds
  pages: '/pricing',
  audience: 'all',
  frequency: 'once_per_visitor',
});

await kerabie.campaigns.update(campaign.id, { isActive: true });  // launch (403 if your plan's live limit is reached)
await kerabie.campaigns.duplicate(campaign.id);                   // copy as a draft
const stats = await kerabie.campaigns.getStats();                 // { total, active, sent, opened, clicked, replied, limit, … }
await kerabie.campaigns.delete(campaign.id);
```

`trigger` is `page_load`, `time_on_page` (seconds), `scroll_depth` (percent) or `exit_intent`. `pages` takes comma-separated URL patterns with `*` wildcards; leave it empty for every page. How many campaigns can be live at once depends on your plan (`getStats().limit`, 0 = unlimited).

## AI tools

```typescript
// Custom API actions your chatbot can call (check stock, validate an address, book a slot…)
const { tools, stats } = await kerabie.aiTools.list();   // stats.limit: -1 = not on your plan, 0 = unlimited

const { tool } = await kerabie.aiTools.create({
  name: 'check_availability',                            // snake_case; this is what the AI calls
  displayName: 'Check availability',
  description: 'Use this when a customer asks if a specific item is in stock.',
  endpoint: 'https://api.yourstore.com/inventory/check', // must be a public address
  method: 'GET',
  authType: 'bearer',
  authConfig: { token: process.env.STORE_API_TOKEN },    // write-only, never returned
  responsePath: 'data.message',
  parameters: [
    { name: 'sku', type: 'string', description: 'Product SKU the customer mentioned' },
    { name: 'location', type: 'string', description: 'Store, if mentioned', required: false },
  ],
});

const result = await kerabie.aiTools.test(tool.id, { sku: 'A-100' }); // calls your real endpoint once
await kerabie.aiTools.update(tool.id, { enabled: false });            // switch it off
await kerabie.aiTools.duplicate(tool.id);                             // a copy that starts switched off
await kerabie.aiTools.delete(tool.id);
```

How many tools you can have depends on your plan; `create` and `duplicate` throw a 403 when it is full. Endpoints that resolve to a private or local address are rejected, and redirects are not followed.


### MCP servers as tool sources

```typescript
// Let your chatbot use the tools of a remote MCP server
const { server } = await kerabie.mcpServers.create({
  name: 'Shop tools',
  description: 'Order and stock lookups for our shop. Use when a customer asks about an order or an item.',
  url: 'https://mcp.yourstore.com/mcp',
  authType: 'bearer',
  authConfig: { token: process.env.SHOP_MCP_TOKEN },
});
console.log(server.tools.map((t) => t.name));            // what the server offers

await kerabie.mcpServers.update(server.id, { enabledTools: ['check_stock'] });  // switch tools on
await kerabie.mcpServers.test(server.id, 'check_stock', { sku: 'A-100' });
await kerabie.mcpServers.sync(server.id);                // read the tools again
await kerabie.mcpServers.delete(server.id);
```

Each switched-on MCP tool counts towards your plan's AI tool limit, the same as your own tools.

## Contacts

```typescript
// People you have talked to (or added), last-contacted first
const { contacts, meta } = await kerabie.contacts.list({ type: 'VIP', search: 'palmex', limit: 20 });

const stats = await kerabie.contacts.getStats();   // { total, newThisWeek, leads, vip }

// Add one by hand — throws an HttpError with status 409 if the email is already saved
const { contact } = await kerabie.contacts.create({ name: 'Chidi Okafor', email: 'chidi@palmex.com', company: 'Palmex', contactType: 'CUSTOMER' });

await kerabie.contacts.update(contact.id, { contactType: 'VIP', notes: 'Prefers WhatsApp', ownerId: 7 });

// Bulk import (max 1,000 per call). Existing emails are skipped, bad rows are reported by number.
const result = await kerabie.contacts.import([{ name: 'Sam Adeyemi', email: 'sam@tenda.ng', type: 'lead' }]);
result;                                            // { created, duplicates, invalid: [{ row, error }], total }
```

`type` is `LEAD`, `CUSTOMER` or `VIP`. `ownerId` is a team-member id and must belong to your organisation. Emails are stored lower-cased and must be unique per organisation.

## Visitors

```typescript
// Who has been on the site recently (online and offline), newest first
const { data, meta } = await kerabie.visitors.list({ status: 'all', country: 'NG', limit: 20 });
data[0].visitCount;      // 14  → coming back after 30+ minutes away counts as a new visit
data[0].status;          // 'online' | 'offline' | 'blocked' | 'allowed'

// On the site right now
const { data: online } = await kerabie.visitors.getActive();

// Online now, countries and returning visitors (24h), blocked IPs, top countries
const overview = await kerabie.visitors.getOverview();

// CSV of the visitors matching the filters (max 5,000 rows) — Pro plan and above
const { csv, filename, count, truncated } = await kerabie.visitors.export({ status: 'blocked' });
```

`status` comes from your IP rules and wins over presence: an allowlisted IP reads `allowed` even while the visitor is online. `ip` is `null` when your organisation hides visitor IPs in its privacy settings. Visitor history is kept for 30 days. `visitors.export()` needs a plan with data exports; on other plans it throws an `HttpError` with status `403`.

## Knowledge Base

```typescript
const { data: articles } = await kerabie.kb.search('refund policy');

const stats = await kerabie.kb.getStats();         // { total, published, drafts, views, top, categories }
const insights = await kerabie.kb.getInsights();  // { mostViewed, gaps, lowestRated, stale }: what to write or fix next

const article = await kerabie.kb.createArticle({
  title: 'How to reset your password',
  body: '...markdown content...',
  category: 'account',
  tags: ['password', 'security'],
});
```

## Tickets

Tickets are async, form-submitted support requests — the same underlying conversation model as live chat, just created through a dedicated flow instead of a real-time widget session. Use `externalRef` to identify your own end users; repeated calls with the same `externalRef` land on the same open ticket instead of creating duplicates.

```typescript
// Create a ticket on behalf of one of your users
const { ticketId } = await kerabie.tickets.create({
  externalRef: 'user_42',       // your own stable user id
  subject: 'Refund request',
  message: 'I was charged twice for order #1029.',
  priority: 'HIGH',             // LOW | NORMAL | HIGH | URGENT
  name: 'Jane Doe',
  email: 'jane@example.com',    // optional — enables email continuation: replies to the notification land back on this ticket
});

// List / filter
const { data: tickets } = await kerabie.tickets.list({ status: 'WAITING', priority: 'HIGH' });

// Fetch a ticket with its full message thread
const ticket = await kerabie.tickets.get(ticketId);

// Reply as the end user (e.g. relaying a message from your own app)
await kerabie.tickets.reply(ticketId, 'Any update on this?');

// Update status / priority, or use the shortcuts
await kerabie.tickets.update(ticketId, { priority: 'URGENT' });
await kerabie.tickets.resolve(ticketId);
await kerabie.tickets.close(ticketId);

// Overview numbers: open, unassigned, breaching SLA, and 7-day average resolution time
const stats = await kerabie.tickets.getStats();
stats.resolutionDeltaPct;            // -18 → 18% faster than the 7 days before (null if nothing to compare)

// CSV export of the tickets matching the filters (max 5,000 rows)
const { csv, filename, count, truncated } = await kerabie.tickets.export({ status: 'ACTIVE', priority: 'URGENT' });
```

`tickets.export()` needs a plan with data exports (Pro and above); on other plans it throws an `HttpError` with status `403`. Every cell is escaped, and values that start with `=`, `+`, `-` or `@` are prefixed with a single quote so spreadsheets show them as text instead of running them as formulas.

Tickets are subject to the same monthly conversation limit as live chat on your plan (a ticket **is** a conversation) — there's no separate ticket-specific cap or plan gate on the API itself.

## Webhooks

```typescript
// Register a webhook
const webhook = await kerabie.webhooks.create({
  url: 'https://your-server.com/hooks/kerabie',
  events: ['message.sent.customer', 'conversation.created'],
  secret: 'your-signing-secret',
});

// Verify incoming webhooks (Express example)
import { WebhooksResource } from '@kerabie/sdk';
import express from 'express';

const app = express();
app.use(express.raw({ type: 'application/json' }));

app.post('/hooks/kerabie', (req, res) => {
  const sig = req.headers['x-kerabie-signature'] as string;
  const rawBody = req.body.toString();

  if (!WebhooksResource.verify(rawBody, sig, process.env.KERABIE_WEBHOOK_SECRET!)) {
    return res.status(401).end();
  }

  const payload = WebhooksResource.parse(rawBody);
  console.log('Event:', payload.event, payload.data);
  res.status(200).end();
});
```

## Analytics

The same numbers as your Kerabie dashboard (cached for up to 5 minutes; tickets and setup for 1 minute).

```typescript
// Conversation, response-time, satisfaction and AI numbers (days: default 30, max 365)
const summary = await kerabie.analytics.getSummary({ days: 7 });
summary.totals.conversations;        // 186
summary.deltas.conversations;        // 12  → +12% vs the previous 7 days (null if nothing to compare)
summary.ai.resolvedAlonePct;         // 70  → % the AI handled without a human
summary.ai.agentHoursSaved;          // 41  → an estimate
summary.trend;                       // [{ date, count, ai, human }, …] oldest first

// Team
const { agents } = await kerabie.analytics.getAgentStats({ period: '7d' });

// The deeper numbers behind the dashboard's Analytics page
const insights = await kerabie.analytics.getInsights({ days: 30 });
insights.firstResponse.medianSeconds;       // 144
insights.ai.questions[0];                   // { question, asked, aiResolvedPct, avgRating, page, trendPct }
insights.customers.heatmap.cells;           // 7 weekdays × 12 two-hour blocks of customer messages
insights.pages[0];                          // { page, views, questions, askRate, topQuestion }

// Open tickets by priority and the % still within SLA
const sla = await kerabie.analytics.getTicketSla();
sla.withinSlaPct;                    // 94
sla.byPriority;                      // [{ priority: 'URGENT', count: 3, oldestMinutes: 14 }, …]

// First-run checklist: connect a channel, train the AI, create an automation
const setup = await kerabie.analytics.getSetupStatus();   // { channel, ai, automation }
```

`deltas.responseTime` is a percentage where a **negative** number is an improvement. `avgResponseTime` is in seconds.

## AI take-over and customer history

```typescript
// List with inbox tab counts, tags and an `aiHandling` flag
const { data, meta } = await kerabie.conversations.list({ status: 'WAITING' });
meta.counts;                         // { all, WAITING, ACTIVE, RESOLVED, CLOSED } — ignores filters
data.filter((c) => c.aiHandling);    // conversations the AI is handling alone

// A customer's earlier conversations (newest first, default 5, max 20)
const { data: earlier } = await kerabie.conversations.getHistory(101, 5);

// Stop the AI and hand the conversation to a team member
await kerabie.conversations.takeOver(101, { agentId: 7 });
```

`takeOver` throws an `HttpError` with status `400` if the AI is no longer handling the conversation (for example someone already took over), so it is safe to call from several places at once.

## Error handling

```typescript
import { HttpError } from '@kerabie/sdk';

try {
  const conv = await kerabie.conversations.get(9999);
} catch (err) {
  if (err instanceof HttpError) {
    console.log(err.status); // 404
    console.log(err.message); // "Conversation not found"
  }
}
```

## TypeScript

All types are exported:

```typescript
import type { Conversation, Message, Customer, WebhookPayload } from '@kerabie/sdk';
```

## License

MIT

## Building with an AI assistant

The [`@kerabie/mcp`](https://kerabie.com/docs/sdks/mcp) server gives Claude, Cursor and other MCP clients the API reference, this SDK's types and integration guides, so generated code matches the real API. It needs no API key to help you build, and with one it can work with your account:

```json
{ "mcpServers": { "kerabie": { "command": "npx", "args": ["-y", "@kerabie/mcp"], "env": { "KERABIE_API_KEY": "ker_live_..." } } } }
```
