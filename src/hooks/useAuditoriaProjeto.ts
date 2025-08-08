
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export interface AuditoriaProjeto {
  id: string;
  projeto_id: string;
  data_auditoria: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  observacoes?: string;
  auditor_id?: string;
  created_at: string;
  updated_at: string;
}

export function useAuditoriaProjeto(projetoId?: string) {
  const queryClient = useQueryClient();

  const {
    data: auditorias,
    isLoading,
    error
  } = useQuery({
    queryKey: ['auditorias-projeto', projetoId],
    queryFn: async () => {
      if (!projetoId) return [];
      
      const { data, error } = await supabase
        .from('auditorias_projeto')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar auditorias do projeto:', error);
        throw error;
      }

      return data as AuditoriaProjeto[];
    },
    enabled: !!projetoId
  });

  const criarAuditoriaMutation = useMutation({
    mutationFn: async (novaAuditoria: Omit<AuditoriaProjeto, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('auditorias_projeto')
        .insert(novaAuditoria)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditorias-projeto'] });
      toast.success('Auditoria criada com sucesso');
    },
    onError: (error) => {
      logger.error('Erro ao criar auditoria:', error);
      toast.error('Erro ao criar auditoria');
    }
  });

  const atualizarAuditoriaMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: Partial<AuditoriaProjeto> }) => {
      const { data, error } = await supabase
        .from('auditorias_projeto')
        .update(dados)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditorias-projeto'] });
      toast.success('Auditoria atualizada com sucesso');
    },
    onError: (error) => {
      logger.error('Erro ao atualizar auditoria:', error);
      toast.error('Erro ao atualizar auditoria');
    }
  });

  return {
    auditorias: auditorias || [],
    isLoading,
    error,
    criarAuditoria: criarAuditoriaMutation.mutate,
    atualizarAuditoria: atualizarAuditoriaMutation.mutate,
    isCreating: criarAuditoriaMutation.isPending,
    isUpdating: atualizarAuditoriaMutation.isPending
  };
}
