
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider - Initializing auth state...');
    
    // Primeiro, configurar o listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthProvider - Auth state changed:', event, session?.user?.email || 'no user');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Depois, buscar a sessão atual
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthProvider - Error getting session:', error);
      }
      console.log('AuthProvider - Initial session:', session?.user?.email || 'no user');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider - Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('AuthProvider - Signing out...');
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
