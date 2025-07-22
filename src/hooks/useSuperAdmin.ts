
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSuperAdmin() {
  const { data: isSuperAdmin = false, isLoading, error } = useQuery({
    queryKey: ["super-admin"],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return false;

        // Verificar diretamente pelo email primeiro
        const userEmail = user.user.email || "";
        if (userEmail === "murilloggomes@gmail.com") {
          return true;
        }

        // Verificar pelas permissões no banco
        const { data, error } = await supabase
          .from("user_companies")
          .select("permissions, user_type")
          .eq("user_id", user.user.id)
          .eq("is_active", true)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking super admin status:", error);
          return false;
        }
        
        if (!data) return false;
        
        // Verificar se é super admin por user_type ou permissions
        const isSuperByType = data.user_type === 'super_admin';
        const permissions = data.permissions as Record<string, any>;
        const isSuperByPermissions = permissions?.super_admin === true;
        
        return isSuperByType || isSuperByPermissions;
      } catch (error) {
        console.error("Error in useSuperAdmin:", error);
        
        // Fallback para verificação pelo email
        try {
          const { data: user } = await supabase.auth.getUser();
          const userEmail = user.user?.email || "";
          return userEmail === "murilloggomes@gmail.com";
        } catch (fallbackError) {
          console.error("Fallback error in useSuperAdmin:", fallbackError);
          return false;
        }
      }
    },
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Não tentar novamente para erros de autenticação
      if (error?.message?.includes('JWT')) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    isSuperAdmin,
    isLoading,
    error,
  };
}
