
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CSRFContextType {
  token: string;
  generateToken: () => string;
}

const CSRFContext = createContext<CSRFContextType | null>(null);

export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState('');

  const generateToken = () => {
    const newToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
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
