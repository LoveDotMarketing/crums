

## Plan: Bland Pathway Node Editor in Admin

### Goal
Give Ambrosia/staff a simple admin page to edit Bland Pathway node prompts (markdown) and push them to Bland's API — no more logging into Bland's dashboard for frequent inventory/instruction tweaks.

### How it works
1. Admin opens **Marketing → Bland AI** in the sidebar.
2. Page lists configured nodes (each with a label like "Answer Questions"). She picks one.
3. The current prompt is pulled from Bland's API and shown in a markdown editor with a live preview tab.
4. She edits → clicks **Save & Push to Bland**. An edge function PATCHes the node via Bland's API.
5. Every save is logged to a new `bland_node_edits` table (who, when, before/after) for audit + rollback.

### What gets built

**1. Database (1 migration)**
- `bland_pathway_nodes` — registry of editable nodes:
  - `id`, `label` (e.g. "Answer Questions — Main Hub"), `pathway_id`, `node_id`, `description`, `created_at`, `updated_at`.
  - Seeded with the Answer Questions node (`d4e5f6a7-1b2c-3d4e-5f6a-7b8c9d0e1f2a`) so it works out of the box.
  - RLS: admin only (full CRUD).
- `bland_node_edits` — edit history:
  - `id`, `node_record_id` (FK), `edited_by` (uuid), `previous_prompt`, `new_prompt`, `created_at`.
  - RLS: admin only (read).

**2. Edge functions (2 new, JWT-protected, admin-only)**
- `bland-get-node` — `GET` Bland API for `{pathway_id}/nodes/{node_id}`, returns current prompt + node metadata.
- `bland-update-node` — accepts `{ node_record_id, new_prompt }`, fetches current prompt for snapshot, PATCHes Bland (POST `https://api.bland.ai/v1/pathway/{pathway_id}/nodes/{node_id}` with `{ data: { prompt } }`), then inserts a row in `bland_node_edits`. Returns success/error.
- Both use a new `BLAND_API_KEY` secret (admin will be prompted to add it).

**3. UI — `src/pages/admin/BlandNodes.tsx`**
- Sidebar entry under **Marketing**: "Bland AI Nodes" (Phone icon) — gated by new `bland_nodes` permission.
- Layout:
  - Left: list of registered nodes with label + last-edited timestamp.
  - Right (when one selected):
    - Header with node label, pathway/node IDs (small/muted), "Refresh from Bland" button.
    - Tabs: **Edit** (textarea, monospace, ~30 rows) | **Preview** (rendered markdown using `react-markdown` — already in skill context patterns).
    - "Save & Push to Bland" button (disabled until changed). Confirms via dialog: "This will overwrite the live Bland node. Continue?"
    - Toast on success / error with Bland's message.
    - **Edit history** accordion below: last 10 edits with diff-friendly view (collapsible "Show previous version") + a "Restore this version" button that copies that prompt back into the editor (manual save still required).
- Empty state if no `BLAND_API_KEY` set: instructions + link to add it.

**4. Admin "Manage Nodes" small dialog** (on the same page)
- "+ Add Node" button → dialog: label, pathway_id, node_id, description. Lets her register additional nodes (e.g. greeting node, routing nodes) over time without code changes.
- Edit/Delete actions per registered node.

**5. Permissions**
- Add `bland_nodes` to `ALL_SECTION_KEYS` + `SECTION_LABELS` so it shows in Staff permission matrix; admins always have it.

### Secrets needed
- **`BLAND_API_KEY`** — Bland API key. After plan approval and migration, you'll be prompted to paste it.

### Out of scope
- Editing other Bland resources (tools, standards, settings) — only node prompts.
- Scheduled/automated updates from inventory data — manual editing only for v1 (can layer a cron later).
- Markdown WYSIWYG — plain textarea + react-markdown preview is enough; matches Bland's own editor.

### Files
1. New migration — `bland_pathway_nodes` + `bland_node_edits` tables, RLS, seed row.
2. New edge functions: `supabase/functions/bland-get-node/index.ts`, `supabase/functions/bland-update-node/index.ts`.
3. New page: `src/pages/admin/BlandNodes.tsx`.
4. `src/App.tsx` — add lazy route `/dashboard/admin/bland-nodes`.
5. `src/components/admin/AdminSidebar.tsx` — add menu item under Marketing.
6. `src/hooks/useStaffPermissions.ts` — add `bland_nodes` section key + label.
7. `package.json` — add `react-markdown` if not already present.

