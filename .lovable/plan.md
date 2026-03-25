

## Wire Existing ChatBot to n8n Embedded Chat

### Approach

Use the official `@n8n/chat` npm package with `createChat({ target: '#n8n-chat-container' })` to mount the n8n chat widget inside the existing chat panel. This renders n8n chat in "embedded" mode (no floating launcher) within the current container.

### Changes

**1. Install `@n8n/chat` package**

**2. Add environment variable `VITE_N8N_CHAT_URL`**
- You'll paste your real n8n Chat Trigger webhook URL as a secret

**3. Rewrite `src/components/ChatBot.tsx`**
- Keep the existing floating bubble button (position, size, colors, animations, z-index — unchanged)
- Keep the existing Card panel (dimensions, shadow, open/close animation — unchanged)
- Keep the existing header with "CRUMS AI Assistant" title, subtitle, close button — unchanged
- **Remove**: all placeholder message state, `handleAdminCommand`, `handleCustomerStream`, `simulateStreaming`, fake message arrays, manual Input/Send UI
- **Add**: a `<div id="n8n-chat-container">` in the message body area
- **Add**: `useEffect` that calls `createChat()` once when the component mounts, targeting that container div
- **Add**: CSS overrides to hide n8n's default launcher button and header (since we provide our own)
- **Add**: localStorage-based session ID (`crums-chat-session-id`) for conversation continuity across refreshes
- **Add**: loading state while n8n widget initializes, error fallback if `VITE_N8N_CHAT_URL` is missing
- Keep GA4 tracking (`trackChatbotOpen`) on bubble click

**4. Add CSS overrides in `src/index.css`**
- Hide n8n's built-in launcher: `#n8n-chat .chat-window-toggle { display: none !important; }`
- Hide n8n's built-in header: `#n8n-chat-container .chat-header { display: none !important; }`
- Make n8n chat fill the panel: `#n8n-chat-container { height: 100%; }`
- Style n8n messages to match site theme colors where possible

### What stays the same
- Floating bubble position, size, icon, colors
- Panel dimensions (max-w-96, h-[600px]), shadow, open/close scale animation
- Header bar (teal background, "CRUMS AI Assistant", close X button)
- Mobile responsive behavior
- All 6 consumer files importing `<ChatBot>` remain untouched
- `userType` prop kept for future routing to different n8n workflows

### Files changed
- `package.json` — add `@n8n/chat`
- `src/components/ChatBot.tsx` — replace placeholder logic with n8n `createChat`
- `src/index.css` — add CSS overrides for n8n widget styling
- Environment variable `VITE_N8N_CHAT_URL` — needs to be set with your webhook URL

