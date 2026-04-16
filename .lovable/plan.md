

User wants two changes:

1. **API: Overwrite notes instead of appending** — currently the `create-phone-lead` edge function merges notes (`mergedNotes = old + "\n---\n" + new`). User wants it to just overwrite with the latest note.

2. **UI: Long notes overflow the screen** — in `PhoneLeads.tsx`, the lead detail dialog renders notes in a `<p>` with `whitespace-pre-wrap` and `min-h-[60px]`, with no max height or scroll. Long notes blow out the dialog.

## Plan

### 1. `supabase/functions/create-phone-lead/index.ts`
Replace the merge logic with a simple overwrite: when updating an existing lead, set `notes` to the new `notes` value (or keep existing if no new notes provided — but if user sends notes, overwrite cleanly).

```ts
const updates: Record<string, unknown> = {
  updated_at: new Date().toISOString(),
};
if (notes !== undefined) updates.notes = notes || null;  // overwrite
if (name && name !== existing.name) updates.name = name;
if (email && email !== existing.email) updates.email = email;
```

### 2. `src/pages/admin/PhoneLeads.tsx`
In the lead detail Dialog, wrap the notes `<p>` in a scrollable container with a max height. Replace:

```tsx
<p className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-md min-h-[60px]">
  {selectedLead.notes || "No notes"}
</p>
```

with a `max-h-[300px] overflow-y-auto` container so long notes scroll inside the dialog instead of pushing it off-screen.

Also truncate the table row's notes cell more strictly (already `max-w-[200px] truncate` — that's fine, no change needed there).

### Files changed
1. `supabase/functions/create-phone-lead/index.ts` — overwrite notes instead of merging
2. `src/pages/admin/PhoneLeads.tsx` — make notes scrollable in detail dialog

