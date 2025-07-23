-- Drop a política existente se existir
DROP POLICY IF EXISTS "Super admins can manage integrations" ON public.integrations_available;
DROP POLICY IF EXISTS "Authenticated users can view active integrations" ON public.integrations_available;

-- Recriar as políticas corretas
CREATE POLICY "Super admins can manage integrations" ON public.integrations_available
  FOR ALL USING (is_super_admin());

CREATE POLICY "Authenticated users can view active integrations" ON public.integrations_available
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);