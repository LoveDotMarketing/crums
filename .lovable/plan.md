
Goal: fix the existing chat so users can send messages again, and remove the “Powered by n8n” line without changing your current bubble/panel UI.

What I found
- The chat currently initializes, but the first request (`loadPreviousSession`) fails with `Failed to fetch`, then Vue reports an unhandled mounted-hook error from `@n8n/chat`.
- That failure blocks normal chat behavior (“I can’t respond” symptom).
- The n8n branding in the panel uses a dedicated class (`.chat-powered-by`) and is not currently hidden.

Implementation plan

1) Make chat transport reliable (fix send/respond)
- File: `src/components/ChatBot.tsx`
- Keep your existing bubble, panel, header, close behavior, animation, spacing, and responsive layout unchanged.
- Point `createChat()` to the existing backend proxy endpoint instead of direct browser→n8n calls (removes CORS/origin breakage causing failed fetch).
- Keep `@n8n/chat` embed in the same existing container (`#n8n-chat-container`), no new launcher.
- Keep localStorage session ID persistence (`crums-chat-session-id`) so conversation continuity is preserved across refresh.

2) Align proxy with n8n embedded chat protocol
- File: `supabase/functions/chat-proxy/index.ts`
- Update proxy to accept and forward native `@n8n/chat` payloads (`action`, `sessionId`, `chatInput`, `metadata`) for both `loadPreviousSession` and `sendMessage`.
- Remove assumptions from old custom payload shape (`message`, `userType` at top-level).
- Support guest users (public pages) while still enriching metadata with authenticated user ID when available.
- Return upstream response/body/headers in a format `@n8n/chat` expects (no incompatible wrapping), while keeping CORS + rate limiting.

3) Remove n8n branding/footer text from the embedded panel
- File: `src/index.css`
- Add targeted CSS to hide branding/footer inside the embedded widget:
  - `.chat-powered-by { display: none !important; }`
  - (and, if needed, `.chat-get-started-footer` child only for powered-by area)
- Keep existing launcher/header-hide rules so only your site’s bubble + site header remain visible.

4) Keep existing error/loading UX
- File: `src/components/ChatBot.tsx`
- Preserve current loading and retry UI.
- Improve error state messaging for proxy/network failures so failures are actionable without breaking the panel UI.

5) Verify end-to-end before closing
- Confirm on `/` that:
  - only one site bubble is visible,
  - no n8n launcher appears,
  - no “Powered by n8n” line appears,
  - user can type/send and receive bot replies,
  - refresh keeps the same session ID and continues context,
  - behavior is correct on desktop and mobile breakpoints.

Files to change
- `src/components/ChatBot.tsx`
- `supabase/functions/chat-proxy/index.ts`
- `src/index.css`
