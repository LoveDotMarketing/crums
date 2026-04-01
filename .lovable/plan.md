

## Fix: Chat Proxy Not Reading `userType` from Metadata

### Problem
The `chat-proxy` Edge Function reads `userType` from the top level of the request body (`body.userType`), but the n8n chat widget sends it nested inside `body.metadata.userType`. This means `userType` is always `undefined`, so every request — even from logged-in customers — routes to the public webhook.

Evidence from logs:
```
Incoming payload keys: [ "action", "sessionId", "chatInput", "metadata" ]
```

### Fix
**One file change: `supabase/functions/chat-proxy/index.ts`**

Update the destructuring to pull `userType` from `metadata`:

```typescript
const userType = body?.metadata?.userType ?? body?.userType;
```

This checks `metadata.userType` first (where n8n chat puts it), then falls back to a top-level `userType` for direct API callers.

### No other changes needed
- The `ChatBot.tsx` component already correctly passes `userType` in metadata
- The `N8N_CUSTOMER_AGENT_WEBHOOK` secret is already configured
- Auth token headers are already being sent for authenticated users

