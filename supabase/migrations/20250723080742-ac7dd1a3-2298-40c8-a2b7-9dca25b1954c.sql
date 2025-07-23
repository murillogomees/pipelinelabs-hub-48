-- Add missing columns to stripe_config table
ALTER TABLE public.stripe_config 
ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT,
ADD COLUMN IF NOT EXISTS stripe_secret_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS stripe_webhook_secret_encrypted TEXT,
ADD COLUMN IF NOT EXISTS test_mode BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;