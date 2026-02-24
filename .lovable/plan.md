

# XSS Vulnerability Remediation

## Finding

One real XSS vulnerability exists in the codebase. The rest of the application is safe thanks to React's built-in escaping and the existing DOMPurify usage in the Outreach page.

## Vulnerability: DOT Inspection Print Window

**File:** `src/pages/admin/DOTInspections.tsx` (lines 216-346)

**Risk:** The `handleDownloadPDF` function builds a full HTML document using template literals and `document.write()`. It interpolates approximately 15 database fields directly into the HTML without escaping:

- `inspection.trailer_number`
- `inspection.vin`
- `inspection.license_plate`
- `inspection.trailer_type`
- `inspection.inspector_name`
- `inspection.customer_name`
- `inspection.customer_company_name`
- `inspection.customer_signer_name`
- `inspection.notes`
- `inspection.status`
- `inspection.inspector_signature` (used in an `img src`)
- `inspection.customer_signature` (used in an `img src`)

If any field contained `<script>alert('xss')</script>` or a malicious `onerror` handler in an img src, it would execute in the print window context.

**Severity:** Medium -- this is an admin-only page and the data comes from the database (not directly from anonymous users), but a compromised database record or a malicious mechanic input could exploit it.

## Fix

Add an `escapeHtml` utility function and apply it to every interpolated database value in the `document.write()` template. This is the same pattern already used in the `send-rental-request-email` edge function.

### Changes

| File | Change |
|---|---|
| `src/pages/admin/DOTInspections.tsx` | Add `escapeHtml` helper function; wrap all ~15 interpolated database values with `escapeHtml()` calls inside the `handleDownloadPDF` function |

### Implementation Detail

1. Add an `escapeHtml` function at the top of the file (or import from a shared util):

```typescript
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}
```

2. Wrap every interpolation: `${inspection.trailer_number}` becomes `${escapeHtml(inspection.trailer_number)}`

3. For signature `img src` attributes, validate that the value is a data URI or known Supabase storage URL before embedding, and escape the attribute value.

### What Was Already Safe (No Changes Needed)

- **Outreach.tsx** -- already uses `DOMPurify.sanitize()`
- **chart.tsx** -- `dangerouslySetInnerHTML` only with internal CSS, no user input
- **ChatBot.tsx** -- React JSX auto-escapes `{msg.content}`
- **All other components** -- standard React rendering with auto-escaping
- **Edge functions** -- `send-rental-request-email` already has its own `escapeHtml`

