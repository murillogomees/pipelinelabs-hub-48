
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        .from("backup_settings")
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Error fetching backup settings:", error);
        throw error;
      }

      return data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<BackupSettings>) => {
      const { data, error } = await supabase
        .from("backup_settings")
        .upsert(settings)
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
      console.error("Error updating backup settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações de backup.",
        variant: "destructive",
      });
    },
  });

  const triggerBackupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("trigger_manual_backup");
      
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
      console.error("Error triggering backup:", error);
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
