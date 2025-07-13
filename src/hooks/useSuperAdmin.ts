import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSuperAdmin() {
  const { data: isSuperAdmin = false, isLoading } = useQuery({
    queryKey: ["super-admin"],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return false;

        const { data, error } = await supabase
          .from("user_companies")
          .select("permissions")
          .eq("user_id", user.user.id)
          .eq("is_active", true)
          .maybeSingle();
        
        if (error || !data) return false;
        
        const permissions = data.permissions as Record<string, any>;
        return permissions?.super_admin === true;
      } catch {
        return false;
      }
    },
    refetchOnWindowFocus: false,
  });

  return {
    isSuperAdmin,
    isLoading,
  };
}