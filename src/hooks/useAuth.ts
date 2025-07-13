import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth as useSupabaseAuth } from '@/components/Auth/AuthProvider';
import { usePermissions } from './usePermissions';

interface UserRole {
  role: string;
  is_active: boolean;
}

export function useAuth() {
  const { user, session, loading: authLoading, signOut } = useSupabaseAuth();
  const { 
    isSuperAdmin, 
    isAdmin, 
    permissions,
    email,
    isLoading: permissionsLoading,
    canAccessAdminPanel,
    hasFullAccess 
  } = usePermissions();

  const loading = authLoading || permissionsLoading;

  return {
    user,
    session,
    loading,
    isAdmin: isAdmin || isSuperAdmin, // Super admin também é considerado admin
    isSuperAdmin,
    permissions,
    email,
    canAccessAdminPanel,
    hasFullAccess,
    signOut,
  };
}