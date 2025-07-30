
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AuthProvider');

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info(`Auth state change`, { event, email: session?.user?.email });
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          logger.info('User signed in successfully', session.user.id);
          
          // Track login event with error handling
          try {
            await supabase.rpc('create_analytics_event', {
              p_event_name: 'user_login',
              p_device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop',
              p_route: window.location.pathname,
              p_meta: {
                user_id: session.user.id,
                email: session.user.email,
                timestamp: new Date().toISOString()
              }
            });
          } catch (error) {
            // Only log error once, don't retry for login events
            console.warn('Failed to track login event:', error);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    isLoading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
