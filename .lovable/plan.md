

## Fix: Clear chat session on page refresh

### Problem
`sessionStorage` persists across refreshes within the same tab. It only clears when the tab is closed, so the session ID survives reloads.

### Solution
Generate a new session ID on every page load without storing it persistently. Use a module-level variable instead of `sessionStorage`.

### Change

**File: `src/components/ChatBot.tsx`**

Replace the `getOrCreateSessionId` function with:

```typescript
// Generate a fresh session ID on every page load (module re-evaluates on refresh)
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const getSessionId = (): string => SESSION_ID;
```

Then update the one call site from `getOrCreateSessionId()` to `getSessionId()`.

This works because the module is re-evaluated on every page load/refresh, producing a new ID each time, while staying stable for the lifetime of the page.

