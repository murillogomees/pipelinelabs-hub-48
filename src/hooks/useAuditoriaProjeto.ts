
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';
import { logger } from '@/utils/logger';

export interface AuditoriaConfig {
  id: string;
  company_id: string;
  auditoria_ativa: boolean;
  frequencia_cron: string;
  escopo_padrao: any;
  notificacoes_ativas: boolean;
  email_notificacao?: string;
  webhook_notificacao?: string;
  limite_problemas_alerta: number;
  manter_historico_dias: number;
  auto_limpeza_segura: boolean;
  regras_preservacao: any;
  ultima_execucao?: string;
  proxima_execucao?: string;
  created_at: string;
  updated_at: string;
}

export function useAuditoriaProjeto() {
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar configuração
  const { 
    data: config, 
    isLoading: isLoadingConfig, 
    error: configError 
  } = useQuery({
    queryKey: ['auditoria-config', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return null;
      
      const { data, error } = await supabase
        .from('auditoria_config')
        .select('*')
        .eq('company_id', currentCompany.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.id
  });

  // Buscar histórico
  const { 
    data: historico, 
    isLoading: isLoadingHistorico 
  } = useQuery({
    queryKey: ['auditoria-historico', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('auditoria_historico')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompany?.id
  });

  // Mutation para atualizar config
  const updateConfigMutation = useMutation({
    mutationFn: async (configData: Partial<AuditoriaConfig>) => {
      if (!currentCompany?.id) throw new Error('Empresa não selecionada');

      const payload = {
        ...configData,
        company_id: currentCompany.id,
      };

      if (config?.id) {
        // Atualizar existente
        const { data, error } = await supabase
          .from('auditoria_config')
          .update(payload)
          .eq('id', config.id)
          .eq('company_id', currentCompany.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar nova
        const { data, error } = await supabase
          .from('auditoria_config')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditoria-config'] });
      toast({
        title: 'Sucesso',
        description: 'Configuração salva com sucesso'
      });
    },
    onError: (error: any) => {
      logger.error('Erro ao salvar configuração', { error });
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração',
        variant: 'destructive'
      });
    }
  });

  // Mutation para executar auditoria
  const executarAuditoriaMutation = useMutation({
    mutationFn: async (escopo?: any) => {
      if (!currentCompany?.id) throw new Error('Empresa não selecionada');
      
      const { data, error } = await supabase.rpc('executar_auditoria_automatica', {
        p_company_id: currentCompany.id
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditoria-historico'] });
      queryClient.invalidateQueries({ queryKey: ['auditoria-config'] });
      toast({
        title: 'Sucesso',
        description: 'Auditoria iniciada com sucesso'
      });
    },
    onError: (error: any) => {
      logger.error('Erro ao executar auditoria', { error });
      toast({
        title: 'Erro',
        description: 'Erro ao executar auditoria',
        variant: 'destructive'
      });
    }
  });

  return {
    config,
    historico,
    isLoading: isLoadingConfig || isLoadingHistorico,
    configError,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
    executarAuditoria: executarAuditoriaMutation.mutate,
    isExecuting: executarAuditoriaMutation.isPending
  };
}
