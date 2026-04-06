

## Remove Duplicate "Bi-weekly" Billing Cycle Option

### Problem
The Billing Cycle dropdown shows two identical "Bi-weekly (every 2 weeks)" entries — one for `biweekly` and one for `semimonthly`. Both map to the same Stripe interval (every 2 weeks, 26×/year). The `semimonthly` value is a legacy alias that should no longer appear as a selectable option.

### Solution
Remove the `semimonthly` `<SelectItem>` from the dropdowns in both the Create and Edit subscription dialogs. The backend already treats them identically, so existing subscriptions with `semimonthly` will continue to work — they just won't be created going forward. The display label mappings will keep the `semimonthly` entry so existing records render correctly.

### Files Modified
| File | Change |
|------|--------|
| `src/components/admin/CreateSubscriptionDialog.tsx` | Remove `semimonthly` SelectItem (line 753) |
| `src/components/admin/EditSubscriptionPanel.tsx` | Remove `semimonthly` SelectItem (line 240) |

