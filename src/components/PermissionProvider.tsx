
import React, { createContext, useContext } from 'react';

interface PermissionContextType {
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (route: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  // Implementação básica - pode ser expandida conforme necessário
  const hasPermission = (permission: string) => true;
  const canAccessRoute = (route: string) => true;

  const value = {
    hasPermission,
    canAccessRoute,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
