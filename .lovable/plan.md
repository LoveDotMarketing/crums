

## Plan: Fix Broken Logo in MATS Email Templates

### The problem
All three MATS 2026 email templates stored in the database reference a non-existent logo URL: `https://crumsleasing.com/lovable-uploads/crums-logo.png`. This path was never deployed — it's a fabricated URL.

### The fix
Run a database migration to update the logo `src` in all three templates to use the actual published logo: `https://crumsleasing.com/images/pub-logo-112.webp`

The three affected templates:
- **MATS 2026 — Great Meeting You**
- **MATS 2026 — Prospect Follow-Up**
- **MATS 2026 — Partnership Follow-Up**

### Changes
- **One SQL migration** — `UPDATE email_templates SET body = REPLACE(body, 'https://crumsleasing.com/lovable-uploads/crums-logo.png', 'https://crumsleasing.com/images/pub-logo-112.webp') WHERE name LIKE 'MATS 2026%'`

No code file changes needed — this is purely a database data fix.

