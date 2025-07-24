-- Update marketplace logos to use internal icons instead of external URLs
UPDATE public.marketplace_channels SET logo_url = NULL WHERE logo_url LIKE 'https://pipelinelabs.com.br/marketplace-logos/%';