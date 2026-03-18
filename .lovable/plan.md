

## Add Dedicated Bland AI Webhook Key

### What Changes
Update the `create-phone-lead` edge function to accept either `N8N_AGENT_SECRET` (existing agent auth) or a new `BLAND_WEBHOOK_KEY` secret. This way Bland AI gets its own key and you don't share the n8n secret.

### Steps

1. **Add new secret** — Use the secrets tool to request `BLAND_WEBHOOK_KEY` from you. You'll generate any value you want (random string) and paste it into Bland AI's webhook config as the Bearer token.

2. **Update `create-phone-lead/index.ts`** — Modify the auth check to accept either token:
   - If token matches `N8N_AGENT_SECRET` → allowed (existing agent calls still work)
   - If token matches `BLAND_WEBHOOK_KEY` → allowed (Bland AI webhook calls)
   - Otherwise → 401

No database changes. No UI changes. Just the edge function auth logic and one new secret.

