UPDATE customer_applications
SET payment_setup_status = 'pending',
    stripe_payment_method_id = NULL
WHERE id = '25b5046d-d4b2-405c-bf78-ba3e2b71039f';