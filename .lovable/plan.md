

## Fix: Use correct n8n webhook secret in chat proxy

### Problem
The `chat-proxy` edge function currently reads `N8N_CUSTOMER_AGENT_WEBHOOK` to get the n8n webhook URL. The correct secret for the main chat bubble is `VITE_N8N_CHAT_URL`.

### Change

**File: `supabase/functions/chat-proxy/index.ts`**

Replace:
```typescript
const webhookUrl = Deno.env.get("N8N_CUSTOMER_AGENT_WEBHOOK");
```
With:
```typescript
const webhookUrl = Deno.env.get("VITE_N8N_CHAT_URL");
```

Update the error log accordingly. One-line change, no other files affected.

