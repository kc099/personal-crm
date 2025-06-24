-- Fix email constraint to allow multiple NULL values but require unique non-NULL emails
-- Drop the existing unique constraint and recreate it with a partial index

-- Remove the existing unique constraint
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_email_key;

-- Create a partial unique index that only applies to non-NULL email values
CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique 
ON customers (email) 
WHERE email IS NOT NULL AND email != '';

-- Update any existing empty string emails to NULL
UPDATE customers SET email = NULL WHERE email = '' OR email IS NULL;