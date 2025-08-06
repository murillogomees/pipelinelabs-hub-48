
import React, { createContext, useContext } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionContextType {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  canAccessAdmin: boolean;
  currentCompanyId: string | null;
  isLoading: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const permissions = usePermissions();

  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
};
