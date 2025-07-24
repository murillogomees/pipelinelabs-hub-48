import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/security';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface SecureAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

export function SecureAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!session;

  // Log security events
  const logSecurityEvent = useCallback(async (eventType: string, riskLevel: string = 'low') => {
    try {
      await supabase.functions.invoke('log-security-event', {
        body: {
          event_type: eventType,
          risk_level: riskLevel,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to log security event', error);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        await logSecurityEvent('session_refreshed');
      }
    } catch (error) {
      logger.error('Failed to refresh session', error);
      await logSecurityEvent('session_refresh_failed', 'medium');
    }
  }, [logSecurityEvent]);

  const signOut = useCallback(async () => {
    try {
      // Log sign out attempt
      await logSecurityEvent('sign_out_attempt');
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        logger.warn('Global sign out failed, proceeding with local cleanup', err);
      }
      
      // Clear state
      setSession(null);
      setUser(null);
      
      // Log successful sign out
      await logSecurityEvent('sign_out_success');
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      logger.error('Sign out error', error);
      await logSecurityEvent('sign_out_failed', 'medium');
      toast.error('Erro ao fazer logout');
    }
  }, [logSecurityEvent]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Log sign in attempt
      await logSecurityEvent('sign_in_attempt');
      
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await logSecurityEvent('sign_in_failed', 'medium');
        return { error };
      }

      if (data.user && data.session) {
        setSession(data.session);
        setUser(data.user);
        await logSecurityEvent('sign_in_success');
        toast.success('Login realizado com sucesso!');
        
        // Force page reload for clean state
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }

      return { error: null };
    } catch (error) {
      logger.error('Sign in error', error);
      await logSecurityEvent('sign_in_error', 'high');
      return { error };
    }
  }, [logSecurityEvent]);

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      // Log sign up attempt
      await logSecurityEvent('sign_up_attempt');
      
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      if (error) {
        await logSecurityEvent('sign_up_failed', 'medium');
        return { error };
      }

      await logSecurityEvent('sign_up_success');
      toast.success('Conta criada com sucesso! Verifique seu email.');
      
      return { error: null };
    } catch (error) {
      logger.error('Sign up error', error);
      await logSecurityEvent('sign_up_error', 'high');
      return { error };
    }
  }, [logSecurityEvent]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Log auth state changes
        if (event === 'SIGNED_IN') {
          await logSecurityEvent('auth_state_signed_in');
        } else if (event === 'SIGNED_OUT') {
          await logSecurityEvent('auth_state_signed_out');
        } else if (event === 'TOKEN_REFRESHED') {
          await logSecurityEvent('auth_token_refreshed');
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [logSecurityEvent]);

  // Auto-refresh session periodically
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(refreshSession, 15 * 60 * 1000); // 15 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshSession]);

  const value: SecureAuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    signOut,
    signIn,
    signUp,
    refreshSession
  };

  return (
    <SecureAuthContext.Provider value={value}>
      {children}
    </SecureAuthContext.Provider>
  );
}

export function useSecureAuth() {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
}

export default SecureAuthProvider;