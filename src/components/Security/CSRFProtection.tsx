import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { generateCSRFToken, setCSRFToken, getCSRFToken } from '@/utils/security';

interface CSRFContextType {
  token: string | null;
  refreshToken: () => void;
}

const CSRFContext = createContext<CSRFContextType>({
  token: null,
  refreshToken: () => {},
});

interface CSRFProviderProps {
  children: ReactNode;
}

export function CSRFProvider({ children }: CSRFProviderProps) {
  const [token, setToken] = useState<string | null>(null);

  const refreshToken = () => {
    const newToken = setCSRFToken();
    setToken(newToken);
  };

  useEffect(() => {
    // Initialize or get existing CSRF token
    let existingToken = getCSRFToken();
    if (!existingToken) {
      existingToken = setCSRFToken();
    }
    setToken(existingToken);
  }, []);

  return (
    <CSRFContext.Provider value={{ token, refreshToken }}>
      {children}
    </CSRFContext.Provider>
  );
}

export function useCSRF(): CSRFContextType {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider');
  }
  return context;
}

interface CSRFTokenProps {
  name?: string;
}

export function CSRFToken({ name = '_token' }: CSRFTokenProps) {
  const { token } = useCSRF();
  
  if (!token) return null;
  
  return <input type="hidden" name={name} value={token} />;
}