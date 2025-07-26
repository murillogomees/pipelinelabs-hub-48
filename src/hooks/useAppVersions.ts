import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppVersion {
  id: string;
  version_number: string;
  git_sha: string;
  git_branch: string;
  environment: 'production' | 'staging' | 'preview';
  status: 'active' | 'rolled_back' | 'failed';
  deployed_at: string;
  deployed_by?: string;
  release_notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EnvironmentConfig {
  id: string;
  environment: string;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeploymentLog {
  id: string;
  version_id: string;
  step_name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration_ms?: number;
  created_at: string;
}

export const useAppVersions = () => {
  return useQuery({
    queryKey: ['app-versions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AppVersion[];
    }
  });
};

export const useCreateAppVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (version: Omit<AppVersion, 'id' | 'status' | 'created_at' | 'updated_at' | 'metadata'>) => {
      const { data, error } = await supabase
        .from('app_versions')
        .insert({
          ...version,
          status: 'active',
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-versions'] });
    }
  });
};

export const useEnvironmentConfigs = () => {
  return useQuery({
    queryKey: ['environment-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environment_configs')
        .select('*')
        .order('environment', { ascending: true });

      if (error) throw error;
      return data as EnvironmentConfig[];
    }
  });
};

export const useUpdateEnvironmentConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, config, is_active }: { id: string; config: Record<string, any>; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('environment_configs')
        .update({ config, is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environment-configs'] });
    }
  });
};

export const useDeploymentLogs = (versionId: string) => {
  return useQuery({
    queryKey: ['deployment-logs', versionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deployment_logs')
        .select('*')
        .eq('version_id', versionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DeploymentLog[];
    }
  });
};
