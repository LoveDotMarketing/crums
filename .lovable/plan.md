

## Patch: Fire `chatbot_message_sent` on User Messages

### Problem
`trackChatbotMessage()` exists in `analytics.ts` but is never called. The n8n chat widget renders its own form inside `#n8n-chat-container`, so we need a DOM-level listener.

### Changes

**File: `src/components/ChatBot.tsx`**

1. Import `trackChatbotMessage` alongside `trackChatbotOpen`
2. Add a `useEffect` that, after chat initializes (`!isLoading && !hasError && isOpen`):
   - Uses `MutationObserver` to wait for the n8n chat form to appear inside `#n8n-chat-container`
   - Attaches a `submit` event listener (with `capture: true`) to the form
   - On submit, reads the textarea/input value; if non-empty after trim, calls `trackChatbotMessage()`
   - Uses a debounce flag (100ms cooldown) to prevent duplicate fires
   - Cleans up observer and listener on unmount or when chat closes

No changes to `analytics.ts` — `trackChatbotMessage` already exists and fires the correct `chatbot_message_sent` event.

### Why MutationObserver
The n8n chat widget renders asynchronously after `createChat()` resolves. We can't query the form immediately — we observe the container until the form element appears, then attach the listener once.

