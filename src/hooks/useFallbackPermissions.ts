import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFallbackPermissions() {
  return useQuery({
    queryKey: ["fallback-permissions"],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          return {
            isSuperAdmin: false,
            isAdmin: false,
            email: null
          };
        }

        // Verificar diretamente se o email é do super admin
        const email = user.user.email || "";
        const isSuperAdmin = email === "murilloggomes@gmail.com";
        
        return {
          isSuperAdmin,
          isAdmin: isSuperAdmin,
          email
        };
      } catch (error) {
        console.error("Error in fallback permissions:", error);
        return {
          isSuperAdmin: false,
          isAdmin: false,
          email: null
        };
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}