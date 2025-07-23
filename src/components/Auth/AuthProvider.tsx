
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { setUserContext } from '@/lib/sentry';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, options?: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authLogger = createLogger('AuthProvider');

// Cleanup function to remove auth state
const cleanupAuthState = () => {
  try {
    localStorage.removeItem('supabase.auth.token');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    authLogger.error('Error cleaning up auth state', error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        authLogger.info('Auth state change', { event, email: session?.user?.email });

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer any additional processing
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            if (mounted) {
              authLogger.info('User signed in successfully');
              // Set Sentry user context
              setUserContext({
                id: session.user.id,
                email: session.user.email,
              });
            }
          }, 0);
        }

        if (event === 'SIGNED_OUT') {
          cleanupAuthState();
          // Clear Sentry user context
          setUserContext({ id: '' });
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          authLogger.error('Error getting initial session', error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Set Sentry user context if session exists
          if (session?.user) {
            setUserContext({
              id: session.user.id,
              email: session.user.email,
            });
          }
        }
      } catch (error) {
        authLogger.error('Error in getInitialSession', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force redirect after a short delay
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
    } catch (error) {
      authLogger.error('Error signing out', error);
      // Force redirect even if signout fails
      window.location.href = '/auth';
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      // Try to sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        authLogger.warn('Error during pre-signin cleanup', err);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Don't redirect immediately, let the auth state change handle it
        authLogger.info('Sign in successful, waiting for auth state change...');
      }
      
      return { error: null };
    } catch (error) {
      authLogger.authError('Sign in error', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, options: any = {}) => {
    try {
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: options.data
        }
      });
      
      return { error };
    } catch (error) {
      authLogger.authError('Sign up error', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
