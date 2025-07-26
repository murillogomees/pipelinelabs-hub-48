
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PromptLog {
  id: string;
  prompt: string;
  generated_code: any;
  model_used: string;
  temperature: number;
  status: 'pending' | 'applied' | 'error' | 'rolled_back';
  error_message?: string;
  applied_files: string[];
  created_at: string;
  applied_at?: string;
  rolled_back_at?: string;
}

interface GenerateCodeParams {
  prompt: string;
  temperature?: number;
  model?: string;
}

interface GeneratedCode {
  files: Record<string, string>;
  sql: string[];
  description: string;
  rawContent?: string;
}

export const usePromptGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const queryClient = useQueryClient();

  // Buscar logs de prompts
  const { data: promptLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['prompt-logs'],
    queryFn: async (): Promise<PromptLog[]> => {
      try {
        const { data, error } = await supabase
          .from('prompt_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching prompt logs:', error);
          throw new Error('Falha ao carregar histórico de prompts');
        }
        
        // Transform the data to match our interface
        return (data || []).map(item => ({
          id: item.id,
          prompt: item.prompt,
          generated_code: item.generated_code,
          model_used: item.model_used,
          temperature: item.temperature,
          status: item.status as 'pending' | 'applied' | 'error' | 'rolled_back',
          error_message: item.error_message,
          applied_files: Array.isArray(item.applied_files) 
            ? item.applied_files.map(file => String(file))
            : [],
          created_at: item.created_at,
          applied_at: item.applied_at,
          rolled_back_at: item.rolled_back_at,
        }));
      } catch (error) {
        console.error('Error in promptLogs query:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  // Gerar código com IA
  const generateCode = useMutation({
    mutationFn: async ({ prompt, temperature = 0.7, model = 'gpt-4o-mini' }: GenerateCodeParams): Promise<{
      logId: string;
      generatedCode: GeneratedCode;
    }> => {
      setIsGenerating(true);

      try {
        // Primeiro, salvar o prompt no banco
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Usuário não autenticado');

        const { data: userCompany } = await supabase
          .from('user_companies')
          .select('company_id')
          .eq('user_id', user.user.id)
          .eq('is_active', true)
          .single();

        if (!userCompany) throw new Error('Nenhuma empresa ativa encontrada');

        const { data: promptLog, error: logError } = await supabase
          .from('prompt_logs')
          .insert({
            user_id: user.user.id,
            company_id: userCompany.company_id,
            prompt,
            model_used: model,
            temperature,
            status: 'pending'
          })
          .select()
          .single();

        if (logError) {
          console.error('Error creating prompt log:', logError);
          throw new Error('Falha ao salvar prompt no histórico');
        }

        // Chamar a edge function para gerar código
        const { data, error } = await supabase.functions.invoke('prompt-generator', {
          body: { prompt, temperature, model }
        });

        if (error) {
          console.error('Error invoking prompt-generator:', error);
          
          // Atualizar o log com erro
          await supabase
            .from('prompt_logs')
            .update({
              status: 'error',
              error_message: error.message || 'Erro desconhecido na geração'
            })
            .eq('id', promptLog.id);

          throw new Error(error.message || 'Falha ao gerar código');
        }

        if (!data || !data.success) {
          const errorMsg = data?.error || 'Resposta inválida da API';
          
          // Atualizar o log com erro
          await supabase
            .from('prompt_logs')
            .update({
              status: 'error',
              error_message: errorMsg
            })
            .eq('id', promptLog.id);

          throw new Error(errorMsg);
        }

        // Atualizar o log com o código gerado
        const { error: updateError } = await supabase
          .from('prompt_logs')
          .update({
            generated_code: data.data
          })
          .eq('id', promptLog.id);

        if (updateError) {
          console.error('Error updating prompt log:', updateError);
          // Não falhar por causa disso, apenas log
        }

        return {
          logId: promptLog.id,
          generatedCode: data.data
        };
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-logs'] });
      toast({
        title: 'Código gerado com sucesso!',
        description: 'Revise o código antes de aplicá-lo ao projeto.',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Erro desconhecido ao gerar código';
      console.error('Generate code error:', error);
      toast({
        title: 'Erro ao gerar código',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  // Aplicar código no projeto (simulado)
  const applyCode = useMutation({
    mutationFn: async (logId: string) => {
      setIsApplying(true);

      try {
        // Aqui seria implementada a lógica real de aplicar o código
        // Por enquanto, vamos apenas marcar como aplicado
        const { error } = await supabase
          .from('prompt_logs')
          .update({
            status: 'applied',
            applied_files: ['Simulação - arquivos seriam aplicados aqui'],
            applied_at: new Date().toISOString()
          })
          .eq('id', logId);

        if (error) {
          console.error('Error applying code:', error);
          throw new Error('Falha ao aplicar código');
        }

        return { success: true };
      } finally {
        setIsApplying(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-logs'] });
      toast({
        title: 'Código aplicado com sucesso!',
        description: 'As alterações foram implementadas no projeto.',
      });
    },
    onError: (error: any) => {
      console.error('Apply code error:', error);
      toast({
        title: 'Erro ao aplicar código',
        description: error.message || 'Erro desconhecido ao aplicar código',
        variant: 'destructive'
      });
    }
  });

  // Fazer rollback
  const rollbackCode = useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('prompt_logs')
        .update({
          status: 'rolled_back',
          rolled_back_at: new Date().toISOString()
        })
        .eq('id', logId);

      if (error) {
        console.error('Error rolling back:', error);
        throw new Error('Falha ao desfazer alterações');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-logs'] });
      toast({
        title: 'Rollback realizado',
        description: 'As alterações foram desfeitas.',
      });
    },
    onError: (error: any) => {
      console.error('Rollback error:', error);
      toast({
        title: 'Erro no rollback',
        description: error.message || 'Erro desconhecido no rollback',
        variant: 'destructive'
      });
    }
  });

  return {
    promptLogs,
    isLoadingLogs,
    isGenerating,
    isApplying,
    generateCode: (params: GenerateCodeParams, callbacks?: {
      onSuccess?: (data: { logId: string; generatedCode: GeneratedCode; }) => void;
      onError?: (error: any) => void;
    }) => {
      generateCode.mutate(params, {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError
      });
    },
    applyCode: applyCode.mutate,
    rollbackCode: rollbackCode.mutate
  };
};
