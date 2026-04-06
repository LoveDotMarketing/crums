

## Fix: Trailers Not Showing Under Customer After Billing Assignment

### Root Cause

Two issues:

1. **Missing status update in `create-subscription`**: When a subscription is first created, the edge function sets `is_rented: true` and `customer_id` on trailers but does NOT set `status: "rented"`. The `modify-subscription` function correctly sets all three. This inconsistency means trailers created via initial subscription may still show `status: "available"` even though they're assigned.

2. **Query cache not invalidated**: After assigning trailers via the Billing tab (ManageTrailersDialog or CreateSubscriptionDialog), the `admin-customer-assigned-trailers` query on the Customer Detail page is never invalidated. The admin must manually refresh to see changes.

### Changes

**1. Edge function: `supabase/functions/create-subscription/index.ts`**

Update line 626 to also set `status: "rented"`:
```typescript
.update({ is_rented: true, customer_id: customerId, status: "rented" })
```

**2. Component: `src/components/admin/ManageTrailersDialog.tsx`**

After successful add/remove/swap, also invalidate the customer trailers query:
```typescript
await queryClient.invalidateQueries({ queryKey: ["admin-customer-assigned-trailers"] });
```

**3. Component: `src/components/admin/CreateSubscriptionDialog.tsx`**

After successful subscription creation, invalidate the customer trailers query:
```typescript
await queryClient.invalidateQueries({ queryKey: ["admin-customer-assigned-trailers"] });
```

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/create-subscription/index.ts` | Add `status: "rented"` when marking trailers |
| `src/components/admin/ManageTrailersDialog.tsx` | Invalidate `admin-customer-assigned-trailers` query after changes |
| `src/components/admin/CreateSubscriptionDialog.tsx` | Invalidate `admin-customer-assigned-trailers` query after creation |

