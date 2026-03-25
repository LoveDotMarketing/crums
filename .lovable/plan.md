
## Fix plan: force fresh chat on every page reload

1. **Stop n8n from restoring previous messages**
   - In `src/components/ChatBot.tsx`, set `loadPreviousSession: false` in `createChat(...)`.
   - This prevents automatic `loadPreviousSession` calls that repopulate old bubbles.

2. **Clear n8n’s persisted session key before chat init**
   - Still in `ChatBot.tsx`, remove the n8n storage key right before `createChat(...)`:
     - `localStorage.removeItem("n8n-chat/sessionId")`
   - Keep your module-level `SESSION_ID` logic for metadata (or future tracing), but don’t rely on it for n8n history control.

3. **Keep current UI behavior intact**
   - No layout/styling changes.
   - No backend/database changes.

4. **Validation checklist**
   - Open chat, send 1–2 messages, refresh page, reopen chat.
   - Confirm old messages are gone.
   - Confirm network no longer restores old transcript (no persisted `loadPreviousSession` history with prior session).

### Technical detail (root cause)
`@n8n/chat` manages its own internal session persistence in browser storage (`n8n-chat/sessionId`). The `metadata.sessionId` you generate is not the session key used by the widget to restore prior history. So refresh kept loading the same transcript until we disable previous-session loading and clear n8n’s stored session key.
