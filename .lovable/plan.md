
# Twilio Call Logs Integration - Implementation Plan

## Overview
This plan integrates Twilio call logs into the CRUMS Leasing admin dashboard, allowing administrators to view, search, and analyze incoming/outgoing phone calls. This provides visibility into customer communications and helps track lead engagement.

---

## Architecture

```text
Frontend (Admin Dashboard)
        │
        ▼
Edge Function (twilio-call-logs)
        │
        ▼
Twilio REST API
```

The integration will:
1. Create a new Edge Function to securely proxy Twilio API requests
2. Add a new "Call Logs" admin page with search, filtering, and stats
3. Add navigation menu entry in the admin sidebar

---

## Required Secrets

Before implementation, you'll need to provide two Twilio credentials:

| Secret Name | Description |
|-------------|-------------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID (starts with AC...) |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |

These can be found in your Twilio Console dashboard.

---

## Technical Implementation

### 1. Edge Function: `twilio-call-logs`

**File:** `supabase/functions/twilio-call-logs/index.ts`

Features:
- Admin-only authentication (JWT + role check)
- Fetches call logs from Twilio REST API with pagination
- Supports filtering by date range, direction, and status
- Returns formatted call data including:
  - Call SID
  - From/To phone numbers
  - Direction (inbound/outbound)
  - Status (completed, busy, no-answer, failed)
  - Duration (seconds)
  - Start/End time
  - Price

API Endpoint structure:
```
GET /twilio-call-logs
Query params:
  - startDate (optional): Filter calls after this date
  - endDate (optional): Filter calls before this date
  - direction (optional): "inbound" | "outbound" | "all"
  - limit (optional): Number of records (default 50)
```

### 2. Config Update

**File:** `supabase/config.toml`

Add configuration for the new function:
```toml
[functions.twilio-call-logs]
verify_jwt = false  # Auth handled in code
```

### 3. Admin Page: Call Logs

**File:** `src/pages/admin/CallLogs.tsx`

Features:
- **Stats Cards:**
  - Today's Calls
  - Inbound vs Outbound ratio
  - Total Duration
  - Missed Calls (busy/no-answer/failed)

- **Filters:**
  - Date range picker (7d, 30d, 90d, custom)
  - Direction filter (All, Inbound, Outbound)
  - Status filter (All, Completed, Missed, Failed)

- **Call Log Table:**
  - Date/Time
  - From (formatted phone number)
  - To (formatted phone number)
  - Direction (badge: inbound/outbound)
  - Duration (formatted as Xm Ys)
  - Status (badge with color coding)
  - Cost (if available)

- **Actions:**
  - Refresh button
  - Export to CSV

UI Pattern: Follows existing admin page patterns (Logs.tsx, Reports.tsx) with:
- SidebarProvider wrapper
- AdminSidebar component
- Tabs for different views if needed
- useQuery for data fetching

### 4. Sidebar Update

**File:** `src/components/admin/AdminSidebar.tsx`

Add new menu item:
```tsx
{ title: "Call Logs", url: "/dashboard/admin/call-logs", icon: Phone }
```

Position: After "Outreach" (communication-related grouping)

### 5. Route Registration

**File:** `src/App.tsx`

Add lazy import and route:
```tsx
const CallLogs = lazy(() => import("./pages/admin/CallLogs"));

<Route path="/dashboard/admin/call-logs" element={
  <ProtectedRoute requiredRole="admin">
    <CallLogs />
  </ProtectedRoute>
} />
```

---

## Data Flow

1. Admin navigates to Call Logs page
2. Frontend calls edge function with auth token
3. Edge function validates admin role
4. Edge function calls Twilio API: `GET /2010-04-01/Accounts/{AccountSid}/Calls.json`
5. Response is parsed and returned to frontend
6. UI displays calls with filtering/sorting

---

## Twilio API Integration Details

The edge function will use Basic Auth with Twilio:
```typescript
const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
const response = await fetch(
  `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json?PageSize=50`,
  {
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json"
    }
  }
);
```

Response fields we'll use:
- `sid` - Unique call identifier
- `from` / `from_formatted` - Caller phone number
- `to` / `to_formatted` - Recipient phone number
- `direction` - "inbound" or "outbound-api" or "outbound-dial"
- `status` - "completed", "busy", "no-answer", "failed", "canceled"
- `duration` - Call duration in seconds
- `start_time` / `end_time` - Timestamps
- `price` - Cost in USD (if available)

---

## UI Design

### Stats Row (4 cards)
| Today's Calls | Inbound | Outbound | Missed |
|--------------|---------|----------|--------|
| 23           | 15      | 8        | 3      |

### Filters Bar
- Date Range: [Last 7 days ▾]
- Direction: [All ▾]
- Status: [All ▾]
- [Refresh] [Export CSV]

### Calls Table
| Date & Time | From | To | Direction | Duration | Status |
|-------------|------|-----|-----------|----------|--------|
| Feb 2, 2:30 PM | (210) 555-1234 | (210) 555-9876 | Inbound | 4m 23s | Completed |
| Feb 2, 1:15 PM | (210) 555-9876 | (512) 555-4321 | Outbound | 1m 02s | Completed |

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/twilio-call-logs/index.ts` | Create | Edge function for Twilio API |
| `supabase/config.toml` | Modify | Add function config |
| `src/pages/admin/CallLogs.tsx` | Create | Admin page component |
| `src/components/admin/AdminSidebar.tsx` | Modify | Add menu item |
| `src/App.tsx` | Modify | Add route |

---

## Security Considerations

1. **Admin-only access**: Edge function verifies JWT and admin role
2. **Secrets stored securely**: Twilio credentials in Supabase secrets
3. **No client-side exposure**: Twilio credentials never sent to browser
4. **Rate limiting**: Twilio API has built-in rate limits

---

## Future Enhancements (Not in scope)

- Click-to-call functionality
- Call recordings playback (if enabled in Twilio)
- Webhook for real-time call notifications
- Link calls to customer records
- Call analytics/reporting charts

---

## Implementation Steps

1. Request Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
2. Create edge function with Twilio API integration
3. Create CallLogs admin page
4. Add sidebar navigation
5. Register route in App.tsx
6. Test end-to-end
