import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSuperAdmin() {
  const { data: isSuperAdmin = false, isLoading } = useQuery({
    queryKey: ["super-admin"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) return false;

      // Verificar email super admin
      if (user.user.email === "murilloggomes@gmail.com") {
        return true;
      }

      // Verificar user_type no banco
      const { data } = await supabase
        .from("user_companies")
        .select("user_type")
        .eq("user_id", user.user.id)
        .eq("user_type", "super_admin")
        .eq("is_active", true)
        .maybeSingle();
      
      return !!data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { isSuperAdmin, isLoading };
}