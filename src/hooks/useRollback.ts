
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from './usePermissions';

export interface RollbackData {
  versionId: string;
  reason: string;
  targetEnvironment: 'production' | 'staging' | 'preview';
  rollbackType: 'manual' | 'automatic';
  rollbackBy: string;
}

export const useRollback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rollbackData: RollbackData) => {
      // Simulate rollback process
      const { data, error } = await supabase
        .from('app_versions')
        .update({ status: 'active' })
        .eq('id', rollbackData.versionId)
        .select()
        .single();

      if (error) throw error;
      
      // Log the rollback
      await supabase
        .from('deployment_logs')
        .insert({
          version_id: rollbackData.versionId,
          step_name: 'rollback',
          status: 'success'
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-versions'] });
    }
  });
};

export const useCanRollback = () => {
  const { isAdmin, isSuperAdmin } = usePermissions();

  return {
    canRollbackProduction: isSuperAdmin,
    canRollbackStaging: isAdmin || isSuperAdmin,
    canRollbackPreview: true
  };
};
