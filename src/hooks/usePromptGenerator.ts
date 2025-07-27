
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

export const usePromptGenerator = () => {
  const { user } = useAuth();

  const { data: promptLogs, isLoading: isLoadingLogs, refetch } = useQuery({
    queryKey: ['prompt-logs'],
    queryFn: async () => {
      // Mock data for now since table doesn't exist
      return [];
    }
  });

  const { data: userCompany } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Mock implementation for now
      return {
        company_id: 'mock-company-id',
        company: { id: 'mock-company-id', name: 'Mock Company' }
      };
    },
    enabled: !!user?.id
  });

  const generateCodeMutation = useMutation({
    mutationFn: async (params: { prompt: string; temperature: number; model: string }) => {
      const { data, error } = await supabase.functions.invoke('prompt-generator', {
        body: {
          action: 'generate',
          prompt: params.prompt,
          temperature: params.temperature,
          model: params.model
        }
      });

      if (error) throw error;
      return data;
    }
  });

  const reviseCodeMutation = useMutation({
    mutationFn: async (params: { prompt: string; originalCode: any }) => {
      const { data, error } = await supabase.functions.invoke('prompt-generator', {
        body: {
          action: 'revise',
          prompt: params.prompt,
          originalCode: params.originalCode
        }
      });

      if (error) throw error;
      return data;
    }
  });

  const applyCodeMutation = useMutation({
    mutationFn: async (logId: string) => {
      const { data, error } = await supabase.functions.invoke('prompt-generator', {
        body: {
          action: 'apply',
          logId
        }
      });

      if (error) throw error;
      return data;
    }
  });

  const rollbackCodeMutation = useMutation({
    mutationFn: async (logId: string) => {
      const { data, error } = await supabase.functions.invoke('prompt-generator', {
        body: {
          action: 'rollback',
          logId
        }
      });

      if (error) throw error;
      return data;
    }
  });

  return {
    promptLogs,
    isLoadingLogs,
    isGenerating: generateCodeMutation.isPending || reviseCodeMutation.isPending,
    isApplying: applyCodeMutation.isPending,
    generateCode: (params: { prompt: string; temperature: number; model: string }, callbacks?: { onSuccess?: (data: any) => void; onError?: (error: any) => void }) => {
      generateCodeMutation.mutate(params, {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError
      });
    },
    reviseCode: (prompt: string, originalCode: any, callbacks?: { onSuccess?: (data: any) => void; onError?: (error: any) => void }) => {
      reviseCodeMutation.mutate({ prompt, originalCode }, {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError
      });
    },
    applyCode: applyCodeMutation.mutate,
    rollbackCode: rollbackCodeMutation.mutate,
    refetch
  };
};
