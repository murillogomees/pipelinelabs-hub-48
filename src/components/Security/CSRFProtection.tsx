
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CSRFContextType {
  token: string;
  generateToken: () => string;
}

const CSRFContext = createContext<CSRFContextType | null>(null);

export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState('');

  const generateToken = () => {
    // SECURITY FIX: Use cryptographically secure token generation
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const newToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setToken(newToken);
    return newToken;
  };

  useEffect(() => {
    generateToken();
  }, []);

  return (
    <CSRFContext.Provider value={{ token, generateToken }}>
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
  const { token } = useCSRF();
  
  return (
    <input
      type="hidden"
      name="csrf_token"
      value={token}
      readOnly
    />
  );
}
