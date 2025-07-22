
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createLogger } from "@/utils/logger";

const backupLogger = createLogger('BackupSettings');

interface BackupSettings {
  id: string;
  company_id: string;
  auto_backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  backup_time: string;
  retention_days: number;
  backup_tables: string[];
  last_backup_at?: string;
  next_backup_at?: string;
  created_at: string;
  updated_at: string;
}

export function useBackupSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["backup-settings"],
    queryFn: async (): Promise<BackupSettings | null> => {
      const { data, error } = await supabase
        .from("backup_settings" as any)
        .select("*")
        .maybeSingle();

      if (error) {
        backupLogger.error("Error fetching backup settings", error);
        throw error;
      }

      return data ? (data as unknown as BackupSettings) : null;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<BackupSettings>) => {
      const { data, error } = await supabase
        .from("backup_settings" as any)
        .upsert(settings as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-settings"] });
      toast({
        title: "Configurações salvas",
        description: "As configurações de backup foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      backupLogger.error("Error updating backup settings", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações de backup.",
        variant: "destructive",
      });
    },
  });

  const triggerBackupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("trigger_manual_backup" as any);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-settings"] });
      toast({
        title: "Backup iniciado",
        description: "O backup manual foi iniciado com sucesso.",
      });
    },
    onError: (error) => {
      backupLogger.error("Error triggering backup", error);
      toast({
        title: "Erro no backup",
        description: "Não foi possível iniciar o backup manual.",
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    triggerBackup: triggerBackupMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    isTriggeringBackup: triggerBackupMutation.isPending,
  };
}
