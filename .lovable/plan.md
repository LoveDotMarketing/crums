

## Plan: Clear chat session on page refresh

**Change:** In `src/components/ChatBot.tsx`, switch from `localStorage` to `sessionStorage` for the session ID. `sessionStorage` is automatically cleared when the tab/page is refreshed or closed, which gives exactly the behavior you want.

**File: `src/components/ChatBot.tsx`**
- In `getOrCreateSessionId()`, replace all `localStorage` references with `sessionStorage`
- No other files need changes

