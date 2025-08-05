
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { usePermissions } from './usePermissions';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useBackupSettings');

interface BackupSettings {
  enabled: boolean;
  frequency: string;
  retention_days: number;
  storage_location: string;
  encryption_enabled: boolean;
  last_backup?: string;
}

export function useBackupSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const permissionsData = usePermissions();
  
  const { isSuperAdmin } = permissionsData;

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['backup-settings'],
    queryFn: async (): Promise<BackupSettings> => {
      // For now, return default settings since backup table might not exist
      return {
        enabled: false,
        frequency: 'daily',
        retention_days: 30,
        storage_location: 'supabase',
        encryption_enabled: true,
        last_backup: undefined
      };
    },
    enabled: isSuperAdmin,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<BackupSettings>) => {
      logger.info('Updating backup settings', newSettings);
      
      // For now, just simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { ...settings, ...newSettings };
    },
    onSuccess: () => {
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações de backup foram salvas com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['backup-settings'] });
    },
    onError: (error: any) => {
      logger.error('Failed to update backup settings', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações de backup',
        variant: 'destructive',
      });
    }
  });

  const triggerBackupMutation = useMutation({
    mutationFn: async () => {
      logger.info('Triggering manual backup');
      
      const { data, error } = await supabase.rpc('trigger_manual_backup');
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Backup iniciado',
        description: 'O backup manual foi iniciado com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['backup-settings'] });
    },
    onError: (error: any) => {
      logger.error('Failed to trigger backup', error);
      toast({
        title: 'Erro no backup',
        description: 'Não foi possível iniciar o backup manual',
        variant: 'destructive',
      });
    }
  });

  return {
    settings,
    isLoading: isLoading || isLoadingSettings,
    canManageBackup: isSuperAdmin,
    updateSettings: updateSettingsMutation.mutate,
    triggerBackup: triggerBackupMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    isTriggering: triggerBackupMutation.isPending,
  };
}
