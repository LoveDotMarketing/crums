

## Plan: Scan Business Card to Add MATS 2026 Leads

### What we are building
A "Scan Business Card" button in the Events tab of the admin Outreach page. Staff can upload/capture a photo of a business card, AI extracts the contact info, staff reviews and confirms, then the lead is added to the MATS 2026 event list.

### 1. Create Edge Function: `scan-business-card/index.ts`
- Accepts `{ image: string }` (base64-encoded image)
- Calls Lovable AI (`google/gemini-2.5-flash`) with the image and a prompt to extract `full_name`, `email`, `phone`, and `company` from the business card
- Uses tool calling for structured output
- Returns extracted fields as JSON
- CORS headers, no JWT verification needed (admin-only UI context)

### 2. Update `src/pages/admin/Outreach.tsx` — EventLeadsTab
- Add a "Scan Business Card" button (Camera icon) next to the "Export CSV" button
- Clicking opens a Dialog with:
  - File input accepting images (`accept="image/*"` with `capture="environment"` for mobile camera)
  - Image preview after selection
  - "Scan" button that sends base64 image to the edge function
  - Editable fields showing extracted data (name, email, phone, notes/company)
  - "Add to MATS 2026" button that inserts into `event_leads` with `event_name = 'MATS 2026'`
- After successful insert, invalidate the `event-leads` query, show toast, close dialog

### Files
- **Create**: `supabase/functions/scan-business-card/index.ts`
- **Modify**: `src/pages/admin/Outreach.tsx`

