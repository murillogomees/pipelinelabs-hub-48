
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { setUserContext } from '@/lib/sentry';
import { retryWithBackoff, isNetworkError } from '@/utils/networkRetry';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any;
  networkError: boolean;
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
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initializeAuth = async () => {
      try {
        setNetworkError(false);
        
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            authLogger.info('Auth state change', { event, email: session?.user?.email });

            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            setNetworkError(false);
            
            // Defer any additional processing
            if (event === 'SIGNED_IN' && session?.user) {
              setTimeout(async () => {
                if (mounted) {
                  authLogger.info('User signed in successfully');
                  // Set Sentry user context
                  setUserContext({
                    id: session.user.id,
                    email: session.user.email,
                  });
                  
                  // Track login event with retry
                  try {
                    await retryWithBackoff(() => 
                      supabase.rpc('create_analytics_event' as any, {
                        p_event_name: 'user:login',
                        p_device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop',
                        p_route: window.location.pathname,
                        p_meta: { user_id: session.user.id, email: session.user.email }
                      })
                    );
                  } catch (error) {
                    console.error('Error tracking login event:', error);
                  }
                }
              }, 0);
            }

            if (event === 'SIGNED_OUT') {
              // Track logout event before cleaning up
              setTimeout(() => {
                retryWithBackoff(() =>
                  supabase.rpc('create_analytics_event' as any, {
                    p_event_name: 'user:logout',
                    p_device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop',
                    p_route: window.location.pathname,
                    p_meta: { timestamp: new Date().toISOString() }
                  })
                ).catch(() => {}); // Ignore errors on logout
              }, 0);
              
              cleanupAuthState();
              // Clear Sentry user context
              setUserContext({ id: '' });
            }
          }
        );

        // THEN check for existing session with retry
        const { data: { session }, error } = await retryWithBackoff(() => 
          supabase.auth.getSession()
        );
        
        if (error) {
          authLogger.error('Error getting initial session', error);
          if (isNetworkError(error)) {
            setNetworkError(true);
          }
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

        return () => subscription.unsubscribe();
        
      } catch (error) {
        authLogger.error('Error in auth initialization', error);
        
        if (isNetworkError(error) && retryCount < maxRetries) {
          setNetworkError(true);
          retryCount++;
          
          // Retry after delay
          setTimeout(() => {
            if (mounted) {
              initializeAuth();
            }
          }, Math.min(1000 * Math.pow(2, retryCount), 10000));
        } else {
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
            setNetworkError(isNetworkError(error));
          }
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signOut = async () => {
    try {
      setNetworkError(false);
      cleanupAuthState();
      
      await retryWithBackoff(() => 
        supabase.auth.signOut({ scope: 'global' })
      );
      
      // Force redirect after a short delay
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
    } catch (error) {
      authLogger.error('Error signing out', error);
      if (isNetworkError(error)) {
        setNetworkError(true);
      }
      
      // Force redirect even if signout fails
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setNetworkError(false);
      cleanupAuthState();
      
      // Try to sign out first
      try {
        await retryWithBackoff(() => 
          supabase.auth.signOut({ scope: 'global' })
        );
      } catch (err) {
        authLogger.warn('Error during pre-signin cleanup', err);
      }
      
      const { data, error } = await retryWithBackoff(() =>
        supabase.auth.signInWithPassword({ email, password })
      );
      
      if (error) throw error;
      
      if (data.user) {
        // Don't redirect immediately, let the auth state change handle it
        authLogger.info('Sign in successful, waiting for auth state change...');
      }
      
      return { error: null };
      
    } catch (error) {
      authLogger.authError('Sign in error', error);
      if (isNetworkError(error)) {
        setNetworkError(true);
      }
      return { error };
    }
  };

  const signUp = async (email: string, password: string, options: any = {}) => {
    try {
      setNetworkError(false);
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await retryWithBackoff(() =>
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: options.data
          }
        })
      );
      
      return { error };
      
    } catch (error) {
      authLogger.authError('Sign up error', error);
      if (isNetworkError(error)) {
        setNetworkError(true);
      }
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isLoading: loading,
    error: null,
    networkError,
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
