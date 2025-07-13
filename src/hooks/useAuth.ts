import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth as useSupabaseAuth } from '@/components/Auth/AuthProvider';

interface UserRole {
  role: string;
  is_active: boolean;
}

export function useAuth() {
  const { user, session, loading: authLoading, signOut } = useSupabaseAuth();
  
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_companies')
        .select('role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return data as UserRole;
    },
    enabled: !!user?.id,
  });

  const isAdmin = userRole?.role === 'admin';
  const loading = authLoading || roleLoading;

  return {
    user,
    session,
    loading,
    isAdmin,
    signOut,
  };
}