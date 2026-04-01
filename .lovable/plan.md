

## Plan: Create `agent-public-fleet-info` Edge Function

### What It Does
A single endpoint the public n8n bot can call to get everything a homepage visitor would ask about: what trailers are available, what years/makes you carry, lease terms, and pricing. This replaces lead-gathering with actual Q&A capability.

### New File
**`supabase/functions/agent-public-fleet-info/index.ts`**

One endpoint that returns a combined response with three sections:

1. **Available inventory** — queries the `trailers` table for `status = 'available'` and `is_rented = false`, returning `type`, `year`, `make`, `model`, and count per type
2. **Lease terms** — hardcoded reference data matching your PriceSheet page:
   - Dry van: 2-year and flexible/MTM options
   - Flatbed: current pricing
   - Flat rate (no mileage charges)
   - Deposit info, contract lengths offered
3. **Pricing table** — the same year-by-year rates from PriceSheet.tsx embedded in the response so the bot can quote prices directly

### Request Format
- **Auth**: `Authorization: Bearer <N8N_AGENT_SECRET>` (same pattern as existing agent functions)
- **Body** (all optional): `{ "type": "dry van" }` to filter by trailer type
- **Response**:
```json
{
  "available": [
    { "type": "dry van", "year": 2027, "make": "Great Dane", "model": "Champion", "count": 3 }
  ],
  "totalAvailable": 12,
  "pricing": {
    "dryVan": [
      { "year": "2027", "twoYear": "$950", "flexible": "$1,100" },
      { "year": "2024", "twoYear": "$800", "flexible": "$850" }
    ],
    "flatbed": [
      { "year": "2027", "price": "$1,400" }
    ]
  },
  "leaseTerms": {
    "options": ["2-year", "1-year", "Month-to-month"],
    "mileageCharges": "None — flat monthly rate",
    "deposit": "Varies by trailer year and type",
    "includes": ["Roadside assistance", "GPS tracking"]
  }
}
```

### How n8n Uses It
In your public bot's n8n workflow, add one HTTP Request tool node:
- **Method**: POST
- **URL**: `https://deeeqatnqqfcxsccigyc.supabase.co/functions/v1/agent-public-fleet-info`
- **Headers**: `Authorization: Bearer {{ $env.N8N_AGENT_SECRET }}`
- **Body**: `{ "type": "" }` (empty for all, or `"dry van"` / `"flatbed"` to filter)

The bot can then answer questions like "What trailers do you have?", "How much is a 2024 dry van?", "What lease lengths do you offer?" directly from this single call.

### Technical Details
- Uses the same `validateAgentSecret` + `corsHeaders` from `_shared/auth.ts`
- Groups available trailers by type/year/make to keep the response concise (counts, not individual units)
- Pricing is hardcoded in the function to match PriceSheet.tsx — when prices change, update both places
- No sensitive data exposed (no trailer IDs, VINs, customer info, or internal costs)

### Files
| File | Action |
|------|--------|
| `supabase/functions/agent-public-fleet-info/index.ts` | Create |

