import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useCompanyData } from '@/hooks/useCompanyData';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

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
  tipo_auditoria: string;
  escopo_auditoria: any;
  status: string;
  arquivos_analisados: number;
  problemas_encontrados: number;
  sugestoes_limpeza: any[];
  arquivos_duplicados: any[];
  arquivos_nao_utilizados: any[];
  hooks_nao_utilizados: any[];
  componentes_duplicados: any[];
  tempo_execucao_ms: number;
  score_aprendizado: number;
  padroes_aprendidos: any[];
  melhorias_aplicadas: any[];
  erro_detalhes?: string;
  feedback_usuario?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to transform database data to our interface types
const transformAuditoriaConfig = (data: any): AuditoriaConfig => {
  return {
    ...data,
    escopo_padrao: typeof data.escopo_padrao === 'string' 
      ? JSON.parse(data.escopo_padrao) 
      : data.escopo_padrao,
    regras_preservacao: typeof data.regras_preservacao === 'string'
      ? JSON.parse(data.regras_preservacao)
      : data.regras_preservacao,
  };
};

// Helper function to transform database data to our interface types
const transformAuditoriaHistorico = (data: any): AuditoriaHistorico => {
  return {
    ...data,
    sugestoes_limpeza: typeof data.sugestoes_limpeza === 'string' 
      ? JSON.parse(data.sugestoes_limpeza) 
      : Array.isArray(data.sugestoes_limpeza) ? data.sugestoes_limpeza : [],
    arquivos_duplicados: typeof data.arquivos_duplicados === 'string'
      ? JSON.parse(data.arquivos_duplicados)
      : Array.isArray(data.arquivos_duplicados) ? data.arquivos_duplicados : [],
    arquivos_nao_utilizados: typeof data.arquivos_nao_utilizados === 'string'
      ? JSON.parse(data.arquivos_nao_utilizados)
      : Array.isArray(data.arquivos_nao_utilizados) ? data.arquivos_nao_utilizados : [],
    hooks_nao_utilizados: typeof data.hooks_nao_utilizados === 'string'
      ? JSON.parse(data.hooks_nao_utilizados)
      : Array.isArray(data.hooks_nao_utilizados) ? data.hooks_nao_utilizados : [],
    componentes_duplicados: typeof data.componentes_duplicados === 'string'
      ? JSON.parse(data.componentes_duplicados)
      : Array.isArray(data.componentes_duplicados) ? data.componentes_duplicados : [],
    padroes_aprendidos: typeof data.padroes_aprendidos === 'string'
      ? JSON.parse(data.padroes_aprendidos)
      : Array.isArray(data.padroes_aprendidos) ? data.padroes_aprendidos : [],
    melhorias_aplicadas: typeof data.melhorias_aplicadas === 'string'
      ? JSON.parse(data.melhorias_aplicadas)
      : Array.isArray(data.melhorias_aplicadas) ? data.melhorias_aplicadas : [],
  };
};

export const useAuditoriaProjeto = () => {
  const { user } = useAuth();
  const { company } = useCompanyData();
  const queryClient = useQueryClient();
  const [isExecuting, setIsExecuting] = useState(false);

  // Query para buscar configuração
  const { data: config, isLoading: configLoading, error: configError } = useQuery({
    queryKey: ['auditoria-config', company?.id],
    queryFn: async (): Promise<AuditoriaConfig | null> => {
      if (!company?.id) {
        logger.warn('Tentativa de buscar config de auditoria sem company_id', { user: user?.id });
        return null;
      }

      logger.debug('Buscando configuração de auditoria', { company_id: company.id });

      const { data, error } = await supabase
        .from('auditoria_config')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle();

      if (error) {
        logger.error('Erro ao buscar configuração de auditoria', { error, company_id: company.id });
        throw error;
      }

      if (!data) {
        logger.info('Nenhuma configuração encontrada', { company_id: company.id });
        return null;
      }

      const transformedData = transformAuditoriaConfig(data);
      logger.info('Configuração de auditoria carregada', { 
        found: !!transformedData, 
        company_id: company.id,
        config_id: transformedData?.id 
      });

      return transformedData;
    },
    enabled: !!company?.id && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Query para buscar histórico
  const { data: historico, isLoading: historicoLoading, error: historicoError } = useQuery({
    queryKey: ['auditoria-historico', company?.id],
    queryFn: async (): Promise<AuditoriaHistorico[]> => {
      if (!company?.id) {
        logger.warn('Tentativa de buscar histórico sem company_id', { user: user?.id });
        return [];
      }

      logger.debug('Buscando histórico de auditoria', { company_id: company.id });

      const { data, error } = await supabase
        .from('auditoria_historico')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Erro ao buscar histórico de auditoria', { error, company_id: company.id });
        throw error;
      }

      const transformedData = (data || []).map(transformAuditoriaHistorico);
      logger.info('Histórico de auditoria carregado', { 
        count: transformedData.length, 
        company_id: company.id 
      });

      return transformedData;
    },
    enabled: !!company?.id && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para atualizar configuração
  const updateConfigMutation = useMutation({
    mutationFn: async (configData: Partial<AuditoriaConfig>) => {
      if (!company?.id || !user?.id) {
        throw new Error('Empresa ou usuário não encontrado');
      }

      logger.debug('Iniciando atualização de configuração', { 
        company_id: company.id, 
        user_id: user.id,
        has_existing_config: !!config?.id 
      });

      // Se já existe configuração, faz update
      if (config?.id) {
        const { data, error } = await supabase
          .from('auditoria_config')
          .update({
            ...configData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id)
          .eq('company_id', company.id)
          .select()
          .single();

        if (error) {
          logger.error('Erro ao atualizar configuração existente', { 
            error, 
            config_id: config.id,
            company_id: company.id 
          });
          throw error;
        }

        logger.info('Configuração atualizada com sucesso', { 
          config_id: config.id,
          company_id: company.id 
        });

        return transformAuditoriaConfig(data);
      } else {
        // Se não existe, cria nova
        const newConfig = {
          company_id: company.id,
          auditoria_ativa: false,
          frequencia_cron: '0 2 * * *',
          escopo_padrao: {
            arquivos: true,
            hooks: true,
            componentes: true,
            paginas: true,
            estilos: true,
            edge_functions: true,
            tabelas: true,
            rotas: true,
          },
          notificacoes_ativas: true,
          limite_problemas_alerta: 50,
          manter_historico_dias: 90,
          auto_limpeza_segura: false,
          regras_preservacao: {
            preservar_producao: true,
            preservar_autenticacao: true,
            preservar_paginas_ativas: true,
            preservar_hooks_sistema: true,
          },
          ...configData,
        };

        const { data, error } = await supabase
          .from('auditoria_config')
          .insert(newConfig)
          .select()
          .single();

        if (error) {
          logger.error('Erro ao criar nova configuração', { 
            error, 
            company_id: company.id 
          });
          throw error;
        }

        logger.info('Nova configuração criada com sucesso', { 
          config_id: data.id,
          company_id: company.id 
        });

        return transformAuditoriaConfig(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditoria-config'] });
      toast.success('Configuração de auditoria salva com sucesso!');
      logger.info('Configuração salva e cache atualizado');
    },
    onError: (error: any) => {
      logger.error('Falha ao salvar configuração', { error });
      toast.error('Erro ao salvar configuração: ' + error.message);
    },
  });

  // Mutation para executar auditoria
  const executarAuditoriaMutation = useMutation({
    mutationFn: async (escopo?: any) => {
      if (!company?.id || !user?.id) {
        throw new Error('Empresa ou usuário não encontrado');
      }

      logger.debug('Iniciando execução de auditoria', { 
        company_id: company.id, 
        user_id: user.id,
        escopo 
      });

      setIsExecuting(true);

      try {
        const { data, error } = await supabase.functions.invoke('executar-auditoria', {
          body: {
            company_id: company.id,
            tipo: 'manual',
            escopo: escopo || config?.escopo_padrao || {
              arquivos: true,
              hooks: true,
              componentes: true,
              paginas: true,
              estilos: true,
              edge_functions: true,
              tabelas: true,
              rotas: true,
            },
          },
        });

        if (error) {
          logger.error('Erro na função de auditoria', { error, company_id: company.id });
          throw error;
        }

        logger.info('Auditoria executada com sucesso', { 
          company_id: company.id,
          auditoria_id: data?.auditoria_id 
        });

        return data;
      } finally {
        setIsExecuting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditoria-historico'] });
      toast.success('Auditoria executada com sucesso!');
      logger.info('Auditoria concluída e histórico atualizado');
    },
    onError: (error: any) => {
      logger.error('Falha na execução da auditoria', { error });
      toast.error('Erro ao executar auditoria: ' + error.message);
      setIsExecuting(false);
    },
  });

  // Log de erros se houver
  useEffect(() => {
    if (configError) {
      logger.error('Erro na query de configuração', { error: configError });
    }
    if (historicoError) {
      logger.error('Erro na query de histórico', { error: historicoError });
    }
  }, [configError, historicoError]);

  return {
    config,
    historico,
    isLoading: configLoading || historicoLoading,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
    executarAuditoria: executarAuditoriaMutation.mutate,
    isExecuting: isExecuting || executarAuditoriaMutation.isPending,
    configError,
    historicoError,
  };
};
