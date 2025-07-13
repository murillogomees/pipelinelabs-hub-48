import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSuperAdmin() {
  const { data: isSuperAdmin = false, isLoading } = useQuery({
    queryKey: ["super-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_super_admin");
      
      if (error) {
        console.error("Error checking super admin status:", error);
        return false;
      }
      
      return data as boolean;
    },
  });

  return {
    isSuperAdmin,
    isLoading,
  };
}