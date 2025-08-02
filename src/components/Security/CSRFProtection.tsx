
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CSRFContextType {
  token: string;
  generateToken: () => Promise<string>;
  validateToken: (token: string) => Promise<boolean>;
  isLoading: boolean;
}

const CSRFContext = createContext<CSRFContextType | null>(null);

export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateToken = async (): Promise<string> => {
    setIsLoading(true);
    try {
      // Use server-side generation for enhanced security
      const { data, error } = await supabase.rpc('generate_csrf_token', {
        p_session_id: null,
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      });

      if (error) {
        console.error('CSRF token generation failed:', error);
        // Fallback to client-side generation
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const fallbackToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        setToken(fallbackToken);
        return fallbackToken;
      }

      setToken(data);
      return data;
    } catch (error) {
      console.error('CSRF token generation error:', error);
      // Fallback to client-side generation
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const fallbackToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      setToken(fallbackToken);
      return fallbackToken;
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async (tokenToValidate: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('validate_csrf_token', {
        p_token: tokenToValidate,
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      });

      if (error) {
        console.error('CSRF token validation failed:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('CSRF token validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    generateToken();
  }, []);

  return (
    <CSRFContext.Provider value={{ token, generateToken, validateToken, isLoading }}>
      {children}
    </CSRFContext.Provider>
  );
}

export function useCSRF() {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider');
  }
  return context;
}

export function CSRFToken() {
  const { token, isLoading } = useCSRF();
  
  if (isLoading) {
    return (
      <input
        type="hidden"
        name="csrf_token"
        value=""
        readOnly
      />
    );
  }
  
  return (
    <input
      type="hidden"
      name="csrf_token"
      value={token}
      readOnly
    />
  );
}
