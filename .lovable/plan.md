

## Fix Chat: No Input Area + 401 Auth Error

### Root Cause

Two problems found:

1. **401 Error**: The `@n8n/chat` library sends POST requests to the proxy URL **without** the Supabase `apikey` header. Even with `verify_jwt = false`, Supabase edge functions require the `apikey` header to be present. The network log confirms: `POST chat-proxy → 401 {"error":"Authorization required"}`.

2. **No input area**: Because the initial `loadPreviousSession` request fails with 401, the n8n chat widget enters a broken state and never renders the message input area.

### Fix

**File: `src/components/ChatBot.tsx`**

Add the Supabase anon key to the `webhookConfig.headers` so `@n8n/chat` includes it on every request:

```typescript
webhookConfig: {
  method: "POST",
  headers: {
    "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    "Content-Type": "application/json",
  },
},
```

This is the only change needed. The edge function code and config.toml are already correct — the proxy accepts unauthenticated requests, forwards to n8n, and relays responses. The widget just couldn't reach it because of the missing apikey header.

### Files changed
- `src/components/ChatBot.tsx` — add apikey header to webhookConfig

