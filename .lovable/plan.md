

## Plan: Add Payment Processing & Refund Policy Acknowledgments

**Problem**: A customer demanded an immediate refund before ACH processing completed. The owner issued a manual Zelle refund, then the customer's bank declined the original charge — resulting in CRUMS being out the money with no recourse.

**Solution**: Add mandatory acknowledgment checkboxes and policy language in two key places so customers understand processing timelines and refund terms before signing.

### Changes

#### 1. `src/pages/customer/TrailerCheckout.tsx` — Add 2 new acknowledgment checkboxes

After the existing 4 checkboxes (review, condition, responsibility, certification), add:

- **Payment Processing Timeline**: "I understand that ACH bank payments require 7–10 business days to fully process and settle. Credit card payments may take up to 5–10 business days for refund processing. During this period, funds are held by the payment processor and cannot be reversed or refunded immediately."

- **Refund & Cancellation Policy**: "I acknowledge that all payments made to Crum's Leasing LLC are subject to standard banking processing timelines. If I cancel my lease or request a refund, processing will begin only after the original transaction has fully settled. If a manual refund is issued and the original payment subsequently fails or is reversed, I agree to promptly return the refunded amount within 5 business days. Failure to return funds will result in a daily interest charge of 1.5% on the outstanding balance until fully repaid, and Crum's Leasing LLC reserves the right to pursue all available legal remedies."

Both checkboxes will be required before the customer can submit the checkout form (same as existing ones).

#### 2. `src/pages/customer/PaymentSetup.tsx` — Add a new Billing Terms accordion section

Add a new accordion item "Refund & Processing Timeline" to the existing Billing Terms section (Section 8) with the same policy language covering:
- ACH 7–10 day processing window
- Credit card 5–10 day refund timeline
- Manual refund clawback obligation and interest terms

#### 3. `src/pages/Terms.tsx` — Add matching section to Terms of Service

Add a new section "9. Refund & Cancellation Policy" before the Contact section with the same policy language, establishing it as a published legal term.

### Files changed
1. `src/pages/customer/TrailerCheckout.tsx` — 2 new required checkboxes + state variables
2. `src/pages/customer/PaymentSetup.tsx` — New accordion item in Billing Terms
3. `src/pages/Terms.tsx` — New refund policy section

