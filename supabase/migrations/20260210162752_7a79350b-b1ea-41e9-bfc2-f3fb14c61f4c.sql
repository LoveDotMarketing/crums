ALTER TABLE customer_subscriptions
  ADD COLUMN contract_start_date date,
  ADD COLUMN docusign_envelope_id text,
  ADD COLUMN docusign_completed_at timestamptz;