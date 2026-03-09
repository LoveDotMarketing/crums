

# Add "Delete Subscription" Option

## What
Add a "Delete Subscription" dropdown option for admins. Deleting a subscription will:
1. Release any assigned trailers back to inventory
2. Cancel the Stripe subscription if one exists
3. Delete subscription items from the database
4. Delete the subscription record itself

## When it appears
Show "Delete Subscription" for subscriptions in any status — particularly useful for empty/erroneous records, but available for all. It will appear after "Cancel Subscription" with a separator, styled in destructive red.

## Implementation

### 1. Add delete state (`src/pages/admin/Billing.tsx` ~line 277)
Add a `deleteConfirm` state similar to `confirmAction`:
```typescript
const [deleteConfirm, setDeleteConfirm] = useState<{
  subscriptionId: string;
  customerName: string;
  stripeSubscriptionId?: string;
} | null>(null);
```

### 2. Add delete handler (~line 418)
New `handleDeleteSubscription` function that:
- Cancels Stripe subscription via `manage-subscription` edge function (if `stripe_subscription_id` exists and status is active/paused)
- Deletes `subscription_items` where `subscription_id` matches
- Releases trailers (`is_rented = false`, `customer_id = null`, `status = 'available'`) for any trailers linked via subscription items
- Deletes the `customer_subscriptions` record
- Invalidates queries and shows toast

### 3. Add dropdown menu item (~line 1686)
Add "Delete Subscription" option for all statuses, after the cancel option area:
```tsx
<DropdownMenuSeparator />
<DropdownMenuItem
  className="text-destructive focus:text-destructive"
  onClick={() => setDeleteConfirm({
    subscriptionId: sub.id,
    customerName: sub.customers?.full_name || "Unknown",
    stripeSubscriptionId: sub.stripe_subscription_id
  })}
>
  <Trash2 className="h-4 w-4 mr-2" />
  Delete Subscription
</DropdownMenuItem>
```

### 4. Add confirmation dialog (~line 2600)
AlertDialog confirming deletion with strong warning text: "This will permanently delete the subscription record, release all trailers, and cannot be undone."

### Files changed
- `src/pages/admin/Billing.tsx` — state, handler, dropdown item, confirmation dialog

