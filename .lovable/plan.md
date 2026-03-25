
Goal: restore a fully usable n8n chat (visible input + send button, messages sent/received), keep it public/no-login-required, and keep n8n branding hidden without breaking the chat UI.

What I confirmed
- The proxy call is now succeeding (`POST /functions/v1/chat-proxy` returns `200` with `{"data":[]}`).
- The chat mounts and shows the bot greeting.
- No input/send controls are rendered in the panel.
- Current CSS hides `#n8n-chat-container .chat-footer`, which is the likely container for n8n’s input area in this version.

Implementation plan

1) Fix the CSS that is removing the input area
- File: `src/index.css`
- Remove the rule that hides `.chat-footer`.
- Keep only targeted branding suppression (e.g. `.chat-powered-by` and branding-only elements), not structural footer/input wrappers.
- Keep existing launcher/header suppression and container fill behavior.

2) Harden embedded chat rendering so input is always visible
- File: `src/components/ChatBot.tsx`
- Keep proxy-based `webhookUrl` and `apikey` header in `webhookConfig` (required).
- Preserve no-auth usage (no login required; continue calling proxy with anon key only).
- Add a small post-init sanity check for input presence; if missing, show actionable error + retry path instead of blank panel.
- Keep current bubble/panel/header UI unchanged.

3) Keep backend proxy public and compatible
- File: `supabase/functions/chat-proxy/index.ts` (verify-only unless needed)
- Confirm it remains public (`verify_jwt = false`), does not require auth header, and supports `loadPreviousSession` + `sendMessage`.
- If needed, add clearer logs for action flow (`loadPreviousSession` vs `sendMessage`) to speed future debugging.

4) Remove noisy Vue feature-flag warning (optional cleanup but recommended)
- File: `vite.config.ts`
- Add Vue compile-time defines for `@n8n/chat` bundle flags to eliminate the console warning that looks like an error.

5) End-to-end validation checklist (must pass)
- Open `/` as anonymous user, open bubble, verify:
  - Input textbox and send button are visible.
  - Typing + sending triggers `sendMessage` network request to `chat-proxy` with `200`.
  - Bot response appears in chat.
  - No “Powered by n8n” text is visible.
  - Refresh page and verify chat still initializes and can send again.
  - Re-test on mobile viewport (same behavior).

Files to update
- `src/index.css`
- `src/components/ChatBot.tsx`
- `vite.config.ts` (warning cleanup)
- `supabase/functions/chat-proxy/index.ts` (only if logging/compatibility tweak is needed)
