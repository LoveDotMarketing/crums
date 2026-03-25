
Fix chat bubble sizing and overflow with stronger n8n-targeted CSS (no JS/backend changes).

1) Tighten n8n theme variables in `src/index.css`
- Under `#n8n-chat-container`, set:
  - `--chat--message--font-size: 0.8125rem` (or 0.8rem)
  - `--chat--message-line-height: 1.35`
  - `--chat--message--padding: 0.625rem 0.75rem`
  - `--chat--messages-list--padding: 0.75rem`
- This ensures the widget’s own sizing system shrinks bubble text/padding consistently.

2) Fix markdown/font inheritance (likely why text still looks large)
- Add explicit inheritance rules:
  - `#n8n-chat-container .chat-message-markdown { font-size: inherit; line-height: inherit; }`
  - `#n8n-chat-container .chat-message-markdown * { font-size: inherit; line-height: inherit; }`
- Keep bubble font control on both `.chat-message` and `.chat-message-body`.

3) Prevent bubble/content bleed with hard overflow guards
- Add:
  - `overflow-x: hidden` on `.chat-window`, main chat scroller, and message list
  - `min-width: 0` on message row/wrapper elements
  - `max-width: 78%` on bot/user bubble containers (not only body text)
  - `overflow-wrap: anywhere; word-break: break-word;` for bubble text
- This handles long words, links, markdown lists, and code-like strings.

4) Keep current custom colors/branding
- Preserve existing bot/user background overrides and header styling.
- Only typography, spacing, and overflow behavior are adjusted.

5) Validate on real runtime states
- Test with:
  - short message
  - long paragraph
  - markdown list / long URL
  - mobile-ish viewport
- Confirm: smaller bubbles, no horizontal scroll, no clipping outside chat panel.

Technical details (what to build)
- File to update: `src/index.css` only.
- Main reason previous change missed: targeting `.chat-message-body` alone doesn’t fully control markdown descendants/wrappers used by `@n8n/chat`.
- New approach combines n8n CSS variables + explicit wrapper/markdown overrides for stable results.
