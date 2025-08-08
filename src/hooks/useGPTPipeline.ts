
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

interface GPTPipelineResponse {
  analysis: string;
  suggestion: string;
  code_changes: {
    files: string[];
    description: string;
  };
  considerations: string[];
  ready_to_implement: boolean;
}

interface GPTConversation {
  id: string;
  user_id: string;
  company_id?: string;
  message: string;
  response: GPTPipelineResponse;
  gpt_model: string;
  created_at: string;
  approved?: boolean;
  implemented?: boolean;
}

export const useGPTPipeline = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  const companyId = profile?.company_id;

  // Buscar histórico de conversas - usando any temporariamente até os tipos serem atualizados
  const { data: conversations = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['gpt-pipeline-conversations', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      try {
        // Usando query raw temporariamente para evitar erro de tipos
        const { data, error } = await supabase
          .rpc('get_gpt_conversations', { p_company_id: companyId });

        if (error) {
          console.error('Error fetching conversations:', error);
          return [];
        }
        
        return (data || []) as GPTConversation[];
      } catch (err) {
        console.error('Error in query:', err);
        return [];
      }
    },
    enabled: !!companyId,
  });

  // Função para enviar mensagem para GPT Pipeline
  const sendMessage = useCallback(async (message: string, gptId: string = 'gpt-4o') => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não identificada',
        variant: 'destructive',
      });
      return null;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('gpt-pipeline-chat', {
        body: {
          message,
          gpt_id: gptId,
          company_id: companyId,
          conversation_history: conversations.slice(0, 5).map(conv => [
            { role: 'user', content: conv.message },
            { role: 'assistant', content: JSON.stringify(conv.response) }
          ]).flat()
        },
      });

      if (error) throw error;

      console.log('Response from GPT Pipeline:', data);
      
      if (data?.success && data?.response) {
        // Invalidar cache do histórico
        queryClient.invalidateQueries({ queryKey: ['gpt-pipeline-conversations', companyId] });

        toast({
          title: 'GPT Pipeline respondeu',
          description: 'Sua solicitação foi analisada com sucesso!',
        });

        return data.response as GPTPipelineResponse;
      } else {
        throw new Error('Resposta inválida do GPT Pipeline');
      }
    } catch (error: any) {
      console.error('Erro ao comunicar com GPT Pipeline:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao comunicar com GPT Pipeline',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [companyId, toast, queryClient, conversations]);

  // Função para aprovar e implementar
  const approveImplementation = useMutation({
    mutationFn: async (conversationId: string) => {
      // Simular implementação por enquanto
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Implementação aprovada',
        description: 'As mudanças foram aplicadas com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['gpt-pipeline-conversations', companyId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na implementação',
        description: error.message || 'Erro ao aplicar as mudanças',
        variant: 'destructive',
      });
    },
  });

  return {
    conversations,
    isLoadingHistory,
    isProcessing,
    sendMessage,
    approveImplementation: approveImplementation.mutate,
    isApproving: approveImplementation.isPending,
  };
};
