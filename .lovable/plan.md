

## Fix: Chat bubble text size and message overflow

### Problem
The n8n chat messages inside the chat panel have oversized text and message bubbles that bleed outside the chat window boundaries.

### Changes

**File: `src/index.css`** — Add CSS overrides to the existing n8n chat section:

1. **Reduce font size** on messages to 14px (from the n8n default ~16px)
2. **Constrain message bubbles** with `max-width: 85%` so they don't stretch edge-to-edge
3. **Add `word-break: break-word`** and `overflow-wrap` to prevent long text from overflowing
4. **Ensure the messages container clips overflow** with `overflow: hidden` on the outer wrapper

```css
/* Constrain message sizing */
#n8n-chat-container .chat-message-body {
  font-size: 0.875rem;
  line-height: 1.4;
  max-width: 85%;
  word-break: break-word;
  overflow-wrap: break-word;
}

#n8n-chat-container .chat-message {
  max-width: 100%;
  overflow: hidden;
}

#n8n-chat-container .chat-messages-list {
  overflow-x: hidden;
}

/* Smaller input text */
#n8n-chat-container .chat-input textarea,
#n8n-chat-container .chat-input input {
  font-size: 0.875rem;
}
```

No other files need changes.

