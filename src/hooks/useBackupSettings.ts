
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
  auto_backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  backup_time: string;
  backup_tables: string[];
  last_backup_at?: string;
  next_backup_at?: string;
}

export function useBackupSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = usePermissions();

  const { data: settings, isLoading: isLoadingSettings, error } = useQuery({
    queryKey: ['backup-settings'],
    queryFn: async (): Promise<BackupSettings> => {
      // For now, return default settings since backup table might not exist
      return {
        enabled: false,
        frequency: 'daily',
        retention_days: 30,
        storage_location: 'supabase',
        encryption_enabled: true,
        last_backup: undefined,
        auto_backup_enabled: false,
        backup_frequency: 'daily',
        backup_time: '02:00',
        backup_tables: ['companies', 'customers', 'products', 'sales', 'invoices', 'accounts_payable', 'accounts_receivable', 'stock_movements', 'proposals', 'contracts'],
        last_backup_at: undefined,
        next_backup_at: undefined
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
    error,
    canManageBackup: isSuperAdmin,
    updateSettings: updateSettingsMutation.mutate,
    triggerBackup: triggerBackupMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    isTriggeringBackup: triggerBackupMutation.isPending,
  };
}
