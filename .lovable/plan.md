

## Fix: Outreach automation cron authentication

The outreach automation cron job runs hourly but silently fails because it sends the anon key, while the edge function requires an admin JWT. This means no password reminders or profile completion reminders have gone out since Feb 3.

### Changes

**1. Update `supabase/functions/process-outreach-automation/index.ts`**
- Change `verify_jwt` to `false` in config.toml (like other cron-triggered functions)
- Add dual auth: accept either a valid admin JWT OR a `CRON_SECRET` header for server-to-server calls
- When called with `CRON_SECRET`, skip the admin role check and proceed directly

**2. Update `supabase/config.toml`**
- Set `verify_jwt = false` for `process-outreach-automation` (auth handled in code)

**3. Update the cron job SQL**
- Change the cron job to pass the `CRON_SECRET` from the vault instead of the anon key, matching the pattern used by `process-payment-failures`

### Technical detail

The updated auth flow in the edge function:
```
1. Check for CRON_SECRET header → if valid, proceed (cron call)
2. Otherwise, check for admin JWT → if valid, proceed (manual admin call)
3. Otherwise, return 401/403
```

This matches the established pattern in `process-payment-failures` which already uses vault-based secret auth for cron.

