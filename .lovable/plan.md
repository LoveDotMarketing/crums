

## Plan: Push edits all the way to production callers

### What's missing today
Our **Save & Push to Bland** button writes the new prompt to the pathway's *draft*. Bland keeps the live caller experience pinned to a published *version*, so until someone clicks "Publish" inside Bland's dashboard, your callers still hear the old prompt. That defeats the whole point of editing in our admin.

### How Bland actually works
Bland has three layers per pathway:
1. **Draft** — what the API edits write to. Not live.
2. **Versions** — numbered snapshots of the draft. Not live until promoted.
3. **Production / Staging environment** — points at one version. This is what callers actually hear.

So a real "publish to production" requires two extra API calls after our existing node update:
- `POST /v1/pathway/{pathway_id}/version` — snapshot the current draft as a new version (returns a `version_number`).
- `POST /v1/pathway/{pathway_id}/publish` with `{ version_id: <number>, environment: "production" }` — point production at that version.

### What we'll build

**1. New edge function `bland-publish-pathway`** (admin-only, JWT-protected)
- Input: `{ pathway_id, version_name?, environment? }` (default environment `production`).
- Calls Create Version → captures `version_number`.
- Calls Promote Version with that number + environment.
- Logs the publish event into a new table `bland_pathway_publishes` (pathway_id, version_number, version_name, environment, published_by, created_at) for audit.
- Returns `{ version_number, version_name, environment }` so the UI can display it.

**2. UI changes in `src/pages/admin/BlandNodes.tsx`**
- Rename the existing button to **"Save Draft to Bland"** (clearer — it's a draft).
- Add a second primary button **"Publish to Production"** next to it. Confirm dialog: *"This snapshots your current draft as a new version and makes it live for all callers. Continue?"* Optional version name field (default: `"Edited via admin — {timestamp} by {user email}"`).
- After successful publish, toast: *"Published version #{n} to production. Callers will hear the new prompt on their next call."*
- Add a small **"Last published"** line under the node header showing the most recent publish from `bland_pathway_publishes` (version # + when + by whom). If no publish on record, show "Never published from admin."
- Add a **"Publish History"** collapsible section (mirrors the Edit History pattern) showing the last 10 production promotions.

**3. Minor safety touches**
- Disable **Publish to Production** if there are unsaved edits in the textarea (force Save Draft first), to avoid publishing a stale version.
- After Save Draft succeeds, surface a subtle hint: *"Draft saved. Click 'Publish to Production' to make it live for callers."*

### Database
One new migration:
- `bland_pathway_publishes` table (id, pathway_id, version_number int, version_name, environment, published_by uuid, created_at). RLS: admin only.

### Files
1. New migration — `bland_pathway_publishes` table + RLS.
2. New edge function — `supabase/functions/bland-publish-pathway/index.ts`.
3. `src/pages/admin/BlandNodes.tsx` — second button, confirm dialog, "Last published" status, Publish History section, unsaved-edits guard.

### Out of scope
- Staging environment toggle (we'll always publish to `production` for v1; trivially extensible if you want a Staging button later).
- Auto-publish on every edit (kept manual so a typo doesn't immediately go live to callers).
- Rollback/promote-an-older-version button (the audit log shows version numbers; can add a one-click "re-promote" later if needed).

