

## Plan: Separate Public and Customer Chatbots

### Problem
Currently, one `ChatBot` component routes all traffic to a single n8n webhook (`VITE_N8N_CHAT_URL`). Logged-in customers on the dashboard see the same public-facing bot as homepage visitors, with no account-aware capabilities.

### Approach
Create a second n8n webhook URL for the customer/authenticated bot, update the proxy to route to the correct webhook based on `userType`, and pass the user's auth token so the customer bot can access account data.

### Changes

**1. Add a new secret: `N8N_CUSTOMER_CHAT_URL`**
- You'll create a second n8n workflow for logged-in customers (with tools like application status, rentals, tolls)
- Store its webhook URL as a new secret in the backend

**2. Update `chat-proxy` Edge Function**
- Accept a `userType` field from the request body
- If `userType` is `"customer"`, `"admin"`, or `"mechanic"` AND the user is authenticated, route to `N8N_CUSTOMER_CHAT_URL`
- Otherwise, route to `VITE_N8N_CHAT_URL` (the public bot)
- Continue forwarding `userId` for authenticated sessions

**3. Update `ChatBot` component**
- Pass the user's Supabase auth token in the webhook headers when the user is logged in (so the proxy can verify identity)
- Include `userType` in the request metadata so the proxy knows which webhook to use
- Update initial messages per context (public vs customer vs admin vs mechanic)

### Technical Detail

```text
Homepage visitor  ──▶  chat-proxy  ──▶  VITE_N8N_CHAT_URL (public bot)
Logged-in user    ──▶  chat-proxy  ──▶  N8N_CUSTOMER_CHAT_URL (account bot)
```

The proxy decides routing based on two signals:
- `userType` in the POST body (sent by the frontend)
- Successful JWT verification (prevents spoofing)

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/chat-proxy/index.ts` | Add routing logic for two webhook URLs |
| `src/components/ChatBot.tsx` | Send auth token + userType in webhook headers/metadata |
| New secret: `N8N_CUSTOMER_CHAT_URL` | Webhook URL for the authenticated customer/admin/mechanic bot |

### What You Need
Before implementing, you'll need to create the second n8n workflow for authenticated users and have its webhook URL ready to store as the `N8N_CUSTOMER_CHAT_URL` secret.

