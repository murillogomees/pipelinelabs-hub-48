
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { createLogger } from "@/utils/logger";

const authLogger = createLogger('useAuth');

interface AuthData {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async (): Promise<AuthData> => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          authLogger.error("Error getting session", error);
          return {
            user: null,
            session: null,
            isAuthenticated: false
          };
        }

        return {
          user: session?.user || null,
          session: session,
          isAuthenticated: !!session?.user
        };
      } catch (error) {
        authLogger.error("Error in useAuth", error);
        return {
          user: null,
          session: null,
          isAuthenticated: false
        };
      }
    },
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: (failureCount, error) => {
      // Não tentar novamente para erros de autenticação
      if (error?.message?.includes('JWT')) return false;
      return failureCount < 2;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      authLogger.error('Error signing out', error);
      // Force redirect even if signout fails
      window.location.href = '/auth';
    }
  };

  return {
    user: authData?.user || null,
    session: authData?.session || null,
    isAuthenticated: authData?.isAuthenticated || false,
    isLoading,
    error,
    signOut
  };
}
