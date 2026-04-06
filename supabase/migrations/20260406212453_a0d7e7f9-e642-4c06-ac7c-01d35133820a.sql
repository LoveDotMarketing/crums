
-- Clean up Abdul's two broken subscriptions
-- Delete subscription items first (FK constraint)
DELETE FROM subscription_items WHERE subscription_id IN ('60a1a130-1642-4564-8c80-ad80f0fd06d3', 'ab5db5d3-7573-4edc-b3a6-98c3f6e67c9a');

-- Delete billing history
DELETE FROM billing_history WHERE subscription_id IN ('60a1a130-1642-4564-8c80-ad80f0fd06d3', 'ab5db5d3-7573-4edc-b3a6-98c3f6e67c9a');

-- Delete applied discounts
DELETE FROM applied_discounts WHERE subscription_id IN ('60a1a130-1642-4564-8c80-ad80f0fd06d3', 'ab5db5d3-7573-4edc-b3a6-98c3f6e67c9a');

-- Delete the subscription records
DELETE FROM customer_subscriptions WHERE id IN ('60a1a130-1642-4564-8c80-ad80f0fd06d3', 'ab5db5d3-7573-4edc-b3a6-98c3f6e67c9a');

-- Release the trailer back to available
UPDATE trailers SET is_rented = false, customer_id = NULL, status = 'available' 
WHERE customer_id = (SELECT id FROM customers WHERE lower(email) = 'azptrucking@gmail.com');
