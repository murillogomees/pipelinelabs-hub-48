
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  threadId?: string;
}

export function useGPTPipeline() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Buscar conversas do usuário (função simplificada por enquanto)
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      // Por enquanto, retornar array vazio até que a tabela seja reconhecida pelo tipo
      setConversations([]);
    } catch (error: any) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar conversas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Criar nova conversa
  const createConversation = useCallback(async (title: string): Promise<string | null> => {
    try {
      // Por enquanto, criar conversa local
      const newConversation: Conversation = {
        id: `conv_${Date.now()}`,
        title,
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      
      return newConversation.id;
    } catch (error: any) {
      console.error('Erro ao criar conversa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar nova conversa',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Enviar mensagem
  const sendMessage = useCallback(async (content: string, conversationId?: string) => {
    if (!content.trim()) return;

    setIsSending(true);
    
    try {
      let targetConversationId = conversationId;
      
      // Se não há conversa atual, criar uma nova
      if (!targetConversationId && !currentConversation) {
        const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
        targetConversationId = await createConversation(title);
        if (!targetConversationId) return;
      }

      const finalConversationId = targetConversationId || currentConversation?.id;
      if (!finalConversationId) return;

      // Adicionar mensagem do usuário
      const userMessage: Message = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      // Atualizar conversa atual com a mensagem do usuário
      setCurrentConversation(prev => {
        if (!prev || prev.id !== finalConversationId) return prev;
        return {
          ...prev,
          messages: [...prev.messages, userMessage],
        };
      });

      // Chamar a edge function
      const { data, error } = await supabase.functions.invoke('gpt-pipeline-chat', {
        body: {
          message: content,
          conversationId: finalConversationId,
          threadId: currentConversation?.threadId,
        },
      });

      if (error) {
        throw error;
      }

      // Adicionar resposta do assistente
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.response || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date(),
      };

      // Atualizar conversa com a resposta
      setCurrentConversation(prev => {
        if (!prev || prev.id !== finalConversationId) return prev;
        return {
          ...prev,
          threadId: (data as any)?.thread_id || prev.threadId,
          messages: [...prev.messages, assistantMessage],
        };
      });

      // Atualizar lista de conversas
      setConversations(prev => 
        prev.map(conv => 
          conv.id === finalConversationId 
            ? { ...conv, threadId: (data as any)?.thread_id || conv.threadId, messages: [...conv.messages, userMessage, assistantMessage] }
            : conv
        )
      );

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  }, [currentConversation, createConversation, toast]);

  // Selecionar conversa
  const selectConversation = useCallback((conversation: Conversation) => {
    setCurrentConversation(conversation);
  }, []);

  // Deletar conversa
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }

      toast({
        title: 'Sucesso',
        description: 'Conversa deletada com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao deletar conversa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar conversa',
        variant: 'destructive',
      });
    }
  }, [currentConversation, toast]);

  return {
    conversations,
    currentConversation,
    isLoading,
    isSending,
    loadConversations,
    createConversation,
    sendMessage,
    selectConversation,
    deleteConversation,
  };
}
