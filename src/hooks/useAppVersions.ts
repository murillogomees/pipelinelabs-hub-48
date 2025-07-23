import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Temporary types until the database types are updated
type DatabaseRow = Record<string, any>;

export interface AppVersion {
  id: string;
  version_number: string;
  git_sha: string;
  git_branch: string;
  environment: 'production' | 'staging' | 'preview' | 'dev' | 'development';
  deployed_at: string;
  deployed_by?: string;
  status: 'active' | 'rolled_back' | 'failed';
  release_notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DeploymentLog {
  id: string;
  version_id: string;
  step_name: string;
  status: 'running' | 'success' | 'failed' | 'skipped';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  logs?: string;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface EnvironmentConfig {
  id: string;
  environment: 'production' | 'staging' | 'preview' | 'dev' | 'development';
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAppVersions = (environment?: string) => {
  return useQuery({
    queryKey: ['app_versions', environment],
    queryFn: async () => {
      let query = supabase
        .from('app_versions' as any)
        .select('*')
        .order('deployed_at', { ascending: false });

      if (environment) {
        query = query.eq('environment', environment);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as DatabaseRow[]) as AppVersion[];
    },
  });
};

export const useCurrentVersion = (environment: string = 'production') => {
  return useQuery({
    queryKey: ['current_version', environment],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_version' as any, {
        p_environment: environment
      });

      if (error) throw error;
      return data?.[0] || null;
    },
  });
};

export const useDeploymentLogs = (versionId: string) => {
  return useQuery({
    queryKey: ['deployment_logs', versionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deployment_logs' as any)
        .select('*')
        .eq('version_id', versionId)
        .order('started_at', { ascending: true });

      if (error) throw error;
      return (data as DatabaseRow[]) as DeploymentLog[];
    },
    enabled: !!versionId,
  });
};

export const useEnvironmentConfigs = () => {
  return useQuery({
    queryKey: ['environment_configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environment_configs' as any)
        .select('*')
        .order('environment');

      if (error) throw error;
      return (data as DatabaseRow[]) as EnvironmentConfig[];
    },
  });
};

export const useCreateAppVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      version_number: string;
      git_sha: string;
      git_branch: string;
      environment: string;
      deployed_by?: string;
      release_notes?: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.rpc('create_app_version' as any, {
        p_version_number: params.version_number,
        p_git_sha: params.git_sha,
        p_git_branch: params.git_branch,
        p_environment: params.environment,
        p_deployed_by: params.deployed_by,
        p_release_notes: params.release_notes,
        p_metadata: params.metadata || {}
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Nova versão criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['app_versions'] });
      queryClient.invalidateQueries({ queryKey: ['current_version'] });
    },
    onError: (error) => {
      console.error('Erro ao criar versão:', error);
      toast.error('Erro ao criar nova versão');
    },
  });
};

export const useUpdateEnvironmentConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      config: Record<string, any>;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('environment_configs' as any)
        .update({
          config: params.config,
          is_active: params.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Configuração de ambiente atualizada!');
      queryClient.invalidateQueries({ queryKey: ['environment_configs'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração de ambiente');
    },
  });
};