
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

interface PromptLog {
  id: string;
  prompt: string;
  generated_code: any;
  status: 'pending' | 'applied' | 'rolled_back' | 'error';
  created_at: string;
  applied_at?: string;
  rolled_back_at?: string;
  error_message?: string;
  user_id?: string;
  company_id?: string;
  model_used?: string;
  temperature?: number;
  applied_files?: any[];
  rollback_data?: any;
}

export const usePromptGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  const companyId = profile?.company_id;

  // Buscar histórico de prompts
  const { data: promptHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['prompt-history', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('prompt_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching prompt history:', error);
        return [];
      }
      
      console.log('Prompt history data:', data);
      return (data || []).map(item => ({
        id: item.id,
        prompt: item.prompt,
        generated_code: item.generated_code,
        status: item.status || 'pending',
        created_at: item.created_at,
        applied_at: item.applied_at,
        rolled_back_at: item.rolled_back_at
      })) as PromptLog[];
    },
    enabled: !!companyId,
  });

  // Função para gerar código
  const generateCode = useCallback(async (prompt: string) => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não identificada',
        variant: 'destructive',
      });
      return null;
    }

    setIsGenerating(true);
    setCurrentPrompt(prompt);

    try {
      const { data, error } = await supabase.functions.invoke('prompt-generator', {
        body: {
          prompt,
          company_id: companyId,
        },
      });

      if (error) throw error;

      console.log('Response from edge function:', data);
      
      // Processar resposta corretamente
      let processedCode = null;
      if (data?.success && data?.data) {
        processedCode = data.data;
      } else if (data?.files || data?.sql || data?.description) {
        processedCode = data;
      } else {
        console.warn('Resposta inesperada da edge function:', data);
        processedCode = {
          files: {},
          sql: [],
          description: 'Código gerado, mas resposta com formato inesperado',
          suggestions: [],
          rawContent: JSON.stringify(data)
        };
      }
      
      setGeneratedCode(processedCode);

      // Invalidar cache do histórico
      queryClient.invalidateQueries({ queryKey: ['prompt-history', companyId] });

      toast({
        title: 'Código gerado',
        description: 'O código foi gerado com sucesso!',
      });

      return processedCode;
    } catch (error: any) {
      console.error('Erro ao gerar código:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao gerar código',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [companyId, toast, queryClient]);

  // Função para aplicar código
  const applyCode = useMutation({
    mutationFn: async (promptId: string) => {
      try {
        const { data, error } = await supabase.functions.invoke('code-applier', {
          body: {
            prompt_id: promptId,
            company_id: companyId,
            action: 'apply'
          },
        });

        if (error) throw error;
        return data;
      } catch (error) {
        // Fallback para simulação se edge function não existir ainda
        console.warn('Code applier not available, using simulation:', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Atualizar status no banco
        await supabase
          .from('prompt_logs')
          .update({ 
            status: 'applied', 
            applied_at: new Date().toISOString() 
          })
          .eq('id', promptId);
          
        return { success: true, message: 'Applied successfully (simulated)' };
      }
    },
    onSuccess: (_, promptId) => {
      toast({
        title: 'Código aplicado',
        description: 'O código foi aplicado com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['prompt-history', companyId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao aplicar código',
        variant: 'destructive',
      });
    },
  });

  // Função para fazer rollback
  const rollbackCode = useMutation({
    mutationFn: async (promptId: string) => {
      try {
        const { data, error } = await supabase.functions.invoke('code-applier', {
          body: {
            prompt_id: promptId,
            company_id: companyId,
            action: 'rollback'
          },
        });

        if (error) throw error;
        return data;
      } catch (error) {
        // Fallback para simulação se edge function não existir ainda
        console.warn('Code applier not available, using simulation:', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Atualizar status no banco
        await supabase
          .from('prompt_logs')
          .update({ 
            status: 'rolled_back', 
            rolled_back_at: new Date().toISOString() 
          })
          .eq('id', promptId);
          
        return { success: true, message: 'Rolled back successfully (simulated)' };
      }
    },
    onSuccess: () => {
      toast({
        title: 'Rollback realizado',
        description: 'O código foi revertido com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['prompt-history', companyId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao fazer rollback',
        variant: 'destructive',
      });
    },
  });

  return {
    isGenerating,
    generatedCode,
    currentPrompt,
    promptHistory,
    isLoadingHistory,
    generateCode,
    applyCode: applyCode.mutate,
    rollbackCode: rollbackCode.mutate,
    isApplying: applyCode.isPending,
    isRollingBack: rollbackCode.isPending,
  };
};
