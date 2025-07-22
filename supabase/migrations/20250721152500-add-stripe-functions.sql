
-- Function to get Stripe mappings for a company
CREATE OR REPLACE FUNCTION public.get_stripe_mappings(company_uuid UUID)
RETURNS TABLE (
  id UUID,
  plan_id UUID,
  stripe_product_id TEXT,
  stripe_price_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.plan_id,
    m.stripe_product_id,
    m.stripe_price_id
  FROM 
    stripe_products_mapping m
  WHERE 
    m.company_id = company_uuid;
END;
$$;

-- Function to save Stripe mapping
CREATE OR REPLACE FUNCTION public.save_stripe_mapping(
  company_uuid UUID,
  plan_uuid UUID,
  s_product_id TEXT,
  s_price_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id UUID;
BEGIN
  -- Check if mapping exists
  SELECT id INTO existing_id
  FROM stripe_products_mapping
  WHERE company_id = company_uuid AND plan_id = plan_uuid;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing
    UPDATE stripe_products_mapping
    SET 
      stripe_product_id = s_product_id,
      stripe_price_id = s_price_id,
      updated_at = now()
    WHERE id = existing_id;
  ELSE
    -- Create new
    INSERT INTO stripe_products_mapping (
      company_id,
      plan_id,
      stripe_product_id,
      stripe_price_id
    ) VALUES (
      company_uuid,
      plan_uuid,
      s_product_id,
      s_price_id
    );
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to delete Stripe mapping
CREATE OR REPLACE FUNCTION public.delete_stripe_mapping(mapping_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM stripe_products_mapping
  WHERE id = mapping_uuid;
  
  RETURN TRUE;
END;
$$;
