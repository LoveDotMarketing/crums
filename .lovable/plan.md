
# Development Changelog with Activity Overview Chart

## Corrected Timeline

**Important Clarification**: This Lovable project was created on **November 18, 2025** (based on first database migration). The project is approximately **2.5 months old**.

The news articles with dates from July 2024 onwards are historical business events that were documented in the content registry, not when pages were built in this project.

### Actual Project Timeline

| Month | Development Activity |
|-------|---------------------|
| **November 2025** | Project created, initial database tables, core structure, authentication |
| **December 2025** | Tools launched, guides added, location pages, admin features |
| **January 2026** | Major guide updates (8), Chamber news, Call Logs, Lead Sources, Outreach |
| **February 2026** | Stripe Events logging, latest admin updates |

---

## What Gets Tracked

### Front-Facing / SEO Content
| Category | Source | Date Field | Current Count |
|----------|--------|------------|---------------|
| News Articles | `src/lib/news.ts` | `sortDate` | 15 articles |
| Guides | `src/lib/guides.ts` | `lastModified` | 12 available |
| Tools | `src/lib/tools.ts` | `lastModified` | 7 available |

### Admin / Backend Features
| Category | Source | Date Field |
|----------|--------|------------|
| Database Tables | Migration files | Filename timestamp (YYYYMMDD) |
| Edge Functions | `supabase/functions/` | Directory tracking |
| Admin Modules | `src/pages/admin/` | Historical log |

---

## Activity Chart Design

A stacked area chart at the top showing development activity by category over time (November 2025 - present):

```text
+----------------------------------------------------------+
|  Development Activity Overview                            |
|  [All Time v]  [Category: All v]                         |
+----------------------------------------------------------+
|  ^                                                        |
|  |         ████                                           |
|  |        █████████                                       |
|  |       ██████████████              ██████              |
|  |      █████████████████          ██████████            |
|  +────────────────────────────────────────────────────>   |
|       Nov'25    Dec'25    Jan'26    Feb'26               |
|                                                           |
|  ● News  ● Guides  ● Tools  ● Admin  ● Database          |
+----------------------------------------------------------+
```

### Chart Features
- Stacked AreaChart using recharts (already installed)
- Color-coded by category
- X-axis: Months (Nov 2025 - Feb 2026)
- Y-axis: Number of items added/updated
- Interactive tooltip with breakdown per month

---

## Summary Cards Row

| Total Items | Content Added | Database Tables | Edge Functions |
|-------------|---------------|-----------------|----------------|
| 35+         | 22 pages      | 20+ tables      | 15+ functions  |

---

## Historical Data by Month (Accurate)

### November 2025 (Project Creation)
**Week of Nov 18:**
- Database tables created: profiles, user_roles, companies, trailers, tolls, support_tickets, subscriptions, payments, and more
- Initial admin dashboard structure
- Customer and mechanic portals
- Authentication system

### December 2025
**Content:**
- Tools: Cost Per Mile, Lease vs Buy, IFTA, Fuel, Profit, Tax Deductions, Per Diem (7 tools)
- Guides: Choosing Trailer, Why Leasing Dry Van, Trailer Specifications (3 guides)

**Admin Features:**
- Billing system
- Fleet management
- Customer management

### January 2026
**Content (January 20-29):**
- News: Chamber of Commerce article (Jan 29)
- Guides updated (Jan 29): CDL License, Load Boards, Finding First Loads, Lease First Trailer, Owner-Operator Basics, Maintenance Schedules, Tire Care, Winter Driving
- Pre-Trip Inspection guide (Jan 20)

**Admin Features:**
- Call Logs (Twilio integration)
- Lead Sources tracking
- Outreach Automation
- DOT Inspections module

**Database additions (Jan 6-23):**
- lead_sources table
- outreach tables
- subscription_audit_log
- cron_history

### February 2026 (Current)
**Admin Features (Feb 2-3):**
- Stripe Events logging tab
- stripe_webhook_logs table
- Payment failure handling improvements

---

## Implementation Details

### Database Table: `development_changelog`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| category | text | news, guide, tool, admin_feature, edge_function, database_table |
| item_name | text | Display title |
| item_slug | text | URL slug or identifier |
| item_url | text | Full URL path (nullable for non-public items) |
| action | text | added, updated, removed |
| date_recorded | date | When change occurred |
| month_year | text | "2026-01" for filtering |
| notes | text | Optional description |
| created_at | timestamptz | Record creation time |

### Edge Function: `sync-development-changelog`

Weekly sync that:
1. Reads content registries (news.ts, guides.ts, tools.ts)
2. Compares against existing changelog entries
3. Detects new/updated/removed items
4. Inserts changelog entries

### Weekly Automation

```sql
SELECT cron.schedule(
  'sync-development-changelog-weekly',
  '0 0 * * 0', -- Every Sunday at midnight
  $$ SELECT net.http_post(...) $$
);
```

---

## UI Components for Reports.tsx

### New "Development" Tab

1. **Activity Chart Section**
   - Time period selector (All Time, Last 3 months)
   - Stacked AreaChart with category gradients
   - Legend with category colors

2. **Summary Cards Row**
   - Total Items
   - Content Published
   - Features Built
   - Database Changes

3. **Filters**
   - Month/Year dropdown (defaults to current month)
   - Category filter (All, News, Guides, Tools, Admin, Database)

4. **Changelog Table**
   - Date column
   - Category badge (color-coded)
   - Item name (clickable for public URLs)
   - Action badge (green=added, blue=updated, red=removed)

5. **Export CSV** button

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database migration | Create | `development_changelog` table with RLS |
| `supabase/functions/sync-development-changelog/index.ts` | Create | Edge function to sync registries |
| `src/pages/admin/Reports.tsx` | Modify | Add "Development" tab with chart and table |
| Cron job | Create | Weekly schedule trigger |

---

## Data Flow

```text
Content Registries (news.ts, guides.ts, tools.ts)
                |
                v
    Weekly Cron Job (Sunday midnight)
                |
                v
    sync-development-changelog Edge Function
                |
                +-> Compare with existing entries
                |
                v
    development_changelog Database Table
                |
                v
    Reports.tsx -> "Development" Tab
                |
                +-> Activity Chart (visual overview)
                +-> Summary Cards (counts)
                +-> Changelog Table (details)
```

---

## Seeding Historical Data

The seed will include entries from:
- **November 2025**: Core database tables (parsed from migration filenames)
- **December 2025**: Tools and guides with lastModified dates
- **January 2026**: Guide updates, news, admin features
- **February 2026**: Latest changes

This gives an accurate 2.5-month development history rather than incorrectly starting from July 2024.
