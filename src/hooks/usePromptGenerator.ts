
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from './useProfile';

interface PromptGeneratorParams {
  prompt: string;
  temperature: number;
  model: string;
}

interface PromptResponse {
  success: boolean;
  data: any;
  rawContent: string;
  usage?: any;
}

export function usePromptGenerator() {
  const { profile, isSuperAdmin } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch prompt logs
  const { data: promptLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['prompt-logs', profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];

      const { data, error } = await supabase
        .from('prompt_logs')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.company_id && isSuperAdmin,
  });

  // Generate code mutation
  const generateCode = useMutation({
    mutationFn: async (params: PromptGeneratorParams) => {
      if (!isSuperAdmin) {
        throw new Error('Acesso negado. Apenas super administradores podem gerar código.');
      }

      const { data, error } = await supabase.functions.invoke('prompt-generator', {
        body: {
          prompt: params.prompt,
          temperature: params.temperature,
          model: params.model,
        }
      });

      if (error) throw error;
      return data as PromptResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prompt-logs'] });
      toast({
        title: 'Código gerado com sucesso',
        description: 'O código foi gerado pela IA. Revise antes de aplicar.',
      });
    },
    onError: (error: any) => {
      console.error('Error generating code:', error);
      toast({
        title: 'Erro ao gerar código',
        description: error.message || 'Erro desconhecido ao gerar código',
        variant: 'destructive',
      });
    },
  });

  // Apply code mutation
  const applyCode = useMutation({
    mutationFn: async (logId: string) => {
      if (!isSuperAdmin) {
        throw new Error('Acesso negado. Apenas super administradores podem aplicar código.');
      }

      const { data, error } = await supabase
        .from('prompt_logs')
        .update({ status: 'applied', applied_at: new Date().toISOString() })
        .eq('id', logId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-logs'] });
      toast({
        title: 'Código aplicado',
        description: 'O código foi aplicado ao projeto com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao aplicar código',
        description: error.message || 'Erro desconhecido ao aplicar código',
        variant: 'destructive',
      });
    },
  });

  // Rollback code mutation
  const rollbackCode = useMutation({
    mutationFn: async (logId: string) => {
      if (!isSuperAdmin) {
        throw new Error('Acesso negado. Apenas super administradores podem fazer rollback.');
      }

      const { data, error } = await supabase
        .from('prompt_logs')
        .update({ status: 'rolled_back', rolled_back_at: new Date().toISOString() })
        .eq('id', logId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-logs'] });
      toast({
        title: 'Código desfeito',
        description: 'O rollback foi executado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao fazer rollback',
        description: error.message || 'Erro desconhecido ao fazer rollback',
        variant: 'destructive',
      });
    },
  });

  return {
    promptLogs,
    isLoadingLogs,
    generateCode: (params: PromptGeneratorParams, callbacks?: { onSuccess?: (data: any) => void; onError?: (error: any) => void }) => {
      generateCode.mutate(params, callbacks);
    },
    applyCode: applyCode.mutate,
    rollbackCode: rollbackCode.mutate,
    isGenerating: generateCode.isPending,
    isApplying: applyCode.isPending,
    isRollingBack: rollbackCode.isPending,
  };
}
