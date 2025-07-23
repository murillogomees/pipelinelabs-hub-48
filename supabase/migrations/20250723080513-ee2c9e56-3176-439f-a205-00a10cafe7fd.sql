-- Add default_currency column if it doesn't exist
ALTER TABLE public.stripe_config 
ADD COLUMN IF NOT EXISTS default_currency TEXT NOT NULL DEFAULT 'usd';