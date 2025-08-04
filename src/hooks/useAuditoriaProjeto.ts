import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export interface AuditoriaConfig {
  id: string;
  company_id: string;
  auditoria_ativa: boolean;
  frequencia_cron: string;
  escopo_padrao: {
    arquivos: boolean;
    hooks: boolean;
    componentes: boolean;
    paginas: boolean;
    estilos: boolean;
    edge_functions: boolean;
    tabelas: boolean;
    rotas: boolean;
  };
  notificacoes_ativas: boolean;
  email_notificacao?: string;
  webhook_notificacao?: string;
  limite_problemas_alerta: number;
  manter_historico_dias: number;
  auto_limpeza_segura: boolean;
  regras_preservacao: {
    preservar_producao: boolean;
    preservar_autenticacao: boolean;
    preservar_paginas_ativas: boolean;
    preservar_hooks_sistema: boolean;
  };
  ultima_execucao?: string;
  proxima_execucao?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditoriaHistorico {
  id: string;
  user_id: string;
  company_id: string;
  tipo_auditoria: 'manual' | 'automatica' | 'agendada';
  escopo_auditoria: any;
  arquivos_analisados: number;
  problemas_encontrados: number;
  sugestoes_limpeza: any[];
  arquivos_duplicados: any[];
  arquivos_nao_utilizados: any[];
  hooks_nao_utilizados: any[];
  componentes_duplicados: any[];
  tempo_execucao_ms: number;
  status: 'executando' | 'concluida' | 'erro' | 'cancelada';
  erro_detalhes?: string;
  melhorias_aplicadas: any[];
  feedback_usuario?: string;
  score_aprendizado: number;
  padroes_aprendidos: any[];
  created_at: string;
  updated_at: string;
}

export const useAuditoriaProjeto = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const permissions = usePermissions();
  // Use profile.company_id as fallback since companyId might not exist
  const currentCompanyId = permissions.profile?.company_id;
  const canManageCompany = permissions.canManageCompany;

  // Buscar configuração de auditoria
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['auditoria-config', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return null;
      
      const { data, error } = await (supabase as any)
        .from('auditoria_config')
        .select('*')
        .eq('company_id', currentCompanyId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching auditoria config:', error);
        return null;
      }

      return data as AuditoriaConfig | null;
    },
    enabled: !!currentCompanyId && canManageCompany,
  });

  // Buscar histórico de auditorias
  const { data: historico, isLoading: historicoLoading } = useQuery({
    queryKey: ['auditoria-historico', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const { data, error } = await (supabase as any)
        .from('auditoria_historico')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching auditoria historico:', error);
        return [];
      }
      
      return data as AuditoriaHistorico[];
    },
    enabled: !!currentCompanyId && canManageCompany,
  });

  // Criar ou atualizar configuração
  const updateConfig = useMutation({
    mutationFn: async (newConfig: Partial<AuditoriaConfig>) => {
      if (!currentCompanyId) throw new Error('Company ID não encontrado');

      const configData = {
        company_id: currentCompanyId,
        ...newConfig,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (config?.id) {
        const { data, error } = await (supabase as any)
          .from('auditoria_config')
          .update(configData)
          .eq('id', config.id)
          .eq('company_id', currentCompanyId)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await (supabase as any)
          .from('auditoria_config')
          .insert([configData])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditoria-config'] });
      toast({
        title: 'Sucesso',
        description: 'Configuração de auditoria atualizada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar configuração',
        variant: 'destructive',
      });
    },
  });

  // Executar auditoria manual
  const executarAuditoria = useMutation({
    mutationFn: async (escopo?: any) => {
      if (!currentCompanyId) throw new Error('Company ID não encontrado');

      // Executar auditoria via Edge Function
      const { data, error } = await supabase.functions.invoke('executar-auditoria', {
        body: {
          company_id: currentCompanyId,
          tipo: 'manual',
          escopo: escopo || config?.escopo_padrao || {},
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditoria-historico'] });
      toast({
        title: 'Auditoria Iniciada',
        description: 'A auditoria foi iniciada com sucesso. Acompanhe o progresso no histórico.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao executar auditoria',
        variant: 'destructive',
      });
    },
  });

  // Aplicar sugestões de limpeza
  const aplicarSugestoes = useMutation({
    mutationFn: async (variables: { auditoriaId: string; sugestoes: any[] }) => {
      const { auditoriaId, sugestoes } = variables;
      
      const { data, error } = await supabase.functions.invoke('aplicar-sugestoes-auditoria', {
        body: {
          auditoria_id: auditoriaId,
          sugestoes_aprovadas: sugestoes,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditoria-historico'] });
      toast({
        title: 'Sugestões Aplicadas',
        description: 'As sugestões de limpeza foram aplicadas com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao aplicar sugestões',
        variant: 'destructive',
      });
    },
  });

  return {
    config,
    historico,
    isLoading: configLoading || historicoLoading,
    updateConfig: updateConfig.mutate,
    executarAuditoria: executarAuditoria.mutate,
    aplicarSugestoes: aplicarSugestoes.mutate,
    isUpdating: updateConfig.isPending,
    isExecuting: executarAuditoria.isPending,
    isApplying: aplicarSugestoes.isPending,
  };
};