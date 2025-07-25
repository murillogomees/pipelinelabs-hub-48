-- Atualizar função is_super_admin para ser mais robusta
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  -- Se não há usuário logado, retornar false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se o usuário tem role super_admin na tabela user_companies
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    WHERE uc.user_id = current_user_id
      AND uc.user_type = 'super_admin'
      AND uc.is_active = true
  );
END;
$function$;

-- Função para verificar se usuário pode bypassar todas as restrições
CREATE OR REPLACE FUNCTION public.can_bypass_all_restrictions()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Super admin pode bypass tudo
  RETURN is_super_admin();
END;
$function$;