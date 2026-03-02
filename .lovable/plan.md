

## Admin ACH Setup for Customers

### What needs to happen

Admins need to run the Stripe Financial Connections flow on behalf of a customer, directly from the customer's profile page in the admin dashboard. The customer provides their bank info verbally/in-person, and the admin completes the linking.

### How the subscription flow works after ACH

The flow is already compatible:
1. **ACH Setup** → attaches a `us_bank_account` payment method to the Stripe customer
2. **Create Subscription** → creates an incomplete Stripe subscription (no payment method needed at this step)
3. **Activate Subscription** → pulls the payment method from Stripe (not the DB), pays the open invoice

No changes needed to `create-subscription` or `activate-subscription`. They already work independently of who initiated the ACH setup.

### Changes

#### 1. Update `create-ach-setup` edge function
- Accept optional `targetUserId` in request body
- When present, verify caller is admin via `user_roles` table
- Use `targetUserId` to look up the application and profile instead of the caller's own ID
- Use the target customer's email/name for Stripe customer creation

#### 2. Update `confirm-ach-setup` edge function
- Accept optional `targetUserId` in request body
- When present, verify caller is admin
- Use `targetUserId` to look up the application

#### 3. Create `src/components/admin/AdminAchSetupDialog.tsx`
- Dialog triggered by a "Set Up ACH" button next to the "Not Linked" badge on the Profile tab
- Loads Stripe.js, calls `create-ach-setup` with `{ targetUserId: profile.id }`
- Runs `collectBankAccountForSetup` → `confirmUsBankAccountSetup` → calls `confirm-ach-setup`
- On success, invalidates queries to refresh the ACH badge to "Linked"
- Shows the customer's name so the admin knows whose account they're linking

#### 4. Update `CustomerDetail.tsx` Profile tab
- Add the "Set Up ACH" button next to the existing ACH status badge (line ~467)
- Only shown when `application` exists, `stripe_payment_method_id` is null, and `profile` exists

### Security
- Admin role is verified server-side in both edge functions before allowing `targetUserId` override
- No client-side role checks are relied upon for authorization

