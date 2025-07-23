import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RollbackOptions {
  versionId: string;
  reason: string;
  targetEnvironment: 'production' | 'staging' | 'preview';
  rollbackType: 'automatic' | 'manual';
  rollbackBy?: string;
}

export const useRollback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: RollbackOptions) => {
      // 1. Mark current active version as rolled_back
      const { error: updateError } = await supabase
        .from('app_versions' as any)
        .update({ 
          status: 'rolled_back',
          updated_at: new Date().toISOString()
        })
        .eq('environment', options.targetEnvironment)
        .eq('status', 'active');

      if (updateError) throw updateError;

      // 2. Mark target version as active
      const { error: activateError } = await supabase
        .from('app_versions' as any)
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', options.versionId);

      if (activateError) throw activateError;

      // 3. Log the rollback operation
      const { error: logError } = await supabase
        .from('deployment_logs' as any)
        .insert({
          version_id: options.versionId,
          step_name: 'rollback_executed',
          status: 'success',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          logs: `Rollback executed: ${options.reason}`,
          metadata: {
            rollback_type: options.rollbackType,
            rollback_reason: options.reason,
            rollback_by: options.rollbackBy,
            target_environment: options.targetEnvironment,
            executed_at: new Date().toISOString()
          }
        });

      if (logError) throw logError;

      return { success: true, versionId: options.versionId };
    },
    onSuccess: (data, variables) => {
      toast.success(`Rollback executado com sucesso para ${variables.targetEnvironment}`);
      queryClient.invalidateQueries({ queryKey: ['app_versions'] });
      queryClient.invalidateQueries({ queryKey: ['current_version'] });
      queryClient.invalidateQueries({ queryKey: ['deployment_logs'] });
    },
    onError: (error) => {
      console.error('Erro no rollback:', error);
      toast.error('Falha ao executar rollback');
    },
  });
};

export const useCanRollback = () => {
  // Check if current user can perform rollback operations
  return {
    canRollbackProduction: true, // Implement based on user permissions
    canRollbackStaging: true,
    canRollbackPreview: true,
  };
};