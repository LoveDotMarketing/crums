

## Add Transcripts to Call Recordings

Use Lovable AI (which is already available via `LOVABLE_API_KEY`) to transcribe call recordings on demand. When an admin clicks a "Transcript" button on a call with a recording, the system fetches the audio, sends it to the AI gateway for transcription, and displays the result.

### Architecture

1. **New edge function `transcribe-recording`** — fetches the recording audio from Twilio (reusing the same proxy pattern as `twilio-call-recording`), then sends it to Lovable AI (Gemini) for transcription via the audio/multimodal capability, returns the transcript text
2. **Database table `call_transcripts`** — caches transcripts so we only transcribe once per recording: `id`, `recording_sid` (unique), `transcript_text`, `created_at`
3. **UI changes in `CallLogs.tsx`** — add a transcript toggle/button per row with a recording. Clicking it loads (or generates) the transcript and shows it in an expandable row or dialog below the call

### Database
- **New table**: `call_transcripts` with columns: `id` (uuid PK), `recording_sid` (text, unique), `transcript_text` (text), `created_at` (timestamptz)
- **RLS**: Admin-only access via `has_role(auth.uid(), 'admin')`

### Edge Function: `transcribe-recording`
- Admin auth check (same pattern as other edge functions)
- Accepts `recordingSid` query param
- First checks `call_transcripts` table — if cached, return immediately
- If not cached: fetch audio from Twilio API as mp3 (same as `twilio-call-recording`)
- Convert audio to base64, send to Lovable AI gateway with Gemini model (which supports audio input) asking for a verbatim transcript
- Save result to `call_transcripts` table, return transcript

### UI Changes: `CallLogs.tsx`
- Add a "Transcript" button (FileText icon) next to recordings in the Recording column
- On click, call the edge function; show loading spinner
- Display transcript in a collapsible row below the call entry or in a Dialog
- Cache the result client-side in state so repeated clicks don't re-fetch

### Files Changed
- **Database migration** — create `call_transcripts` table + RLS
- **`supabase/functions/transcribe-recording/index.ts`** — new edge function
- **`src/pages/admin/CallLogs.tsx`** — add transcript button + display UI

