
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';

import { ConfigurationForm } from './components/ConfigurationForm';
import { ScopeConfiguration } from './components/ScopeConfiguration';
import { NotificationSettings } from './components/NotificationSettings';
import { AdvancedSettings } from './components/AdvancedSettings';
import { StatusDisplay } from './components/StatusDisplay';

interface EscopoPadrao {
  arquivos: boolean;
  hooks: boolean;
  componentes: boolean;
  paginas: boolean;
  estilos: boolean;
  edge_functions: boolean;
  tabelas: boolean;
  rotas: boolean;
}

interface RegrasPreservacao {
  preservar_producao: boolean;
  preservar_autenticacao: boolean;
  preservar_paginas_ativas: boolean;
  preservar_hooks_sistema: boolean;
}

export function AuditoriaConfigPanel() {
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  
  const [formData, setFormData] = useState({
    auditoria_ativa: false,
    frequencia_cron: '0 2 * * *',
    notificacoes_ativas: true,
    email_notificacao: '',
    webhook_notificacao: '',
    limite_problemas_alerta: 50,
    manter_historico_dias: 90,
    auto_limpeza_segura: false,
    escopo_padrao: {
      arquivos: true,
      hooks: true,
      componentes: true,
      paginas: true,
      estilos: true,
      edge_functions: true,
      tabelas: true,
      rotas: true,
    } as EscopoPadrao,
    regras_preservacao: {
      preservar_producao: true,
      preservar_autenticacao: true,
      preservar_paginas_ativas: true,
      preservar_hooks_sistema: true,
    } as RegrasPreservacao,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['auditoria-config', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return null;
      
      const { data, error } = await supabase
        .from('auditoria_config')
        .select('*')
        .eq('company_id', currentCompany.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!currentCompany?.id
  });

  useEffect(() => {
    if (config) {
      setFormData({
        auditoria_ativa: config.auditoria_ativa,
        frequencia_cron: config.frequencia_cron,
        notificacoes_ativas: config.notificacoes_ativas,
        email_notificacao: config.email_notificacao || '',
        webhook_notificacao: config.webhook_notificacao || '',
        limite_problemas_alerta: config.limite_problemas_alerta,
        manter_historico_dias: config.manter_historico_dias,
        auto_limpeza_segura: config.auto_limpeza_segura,
        escopo_padrao: (typeof config.escopo_padrao === 'object' && config.escopo_padrao && !Array.isArray(config.escopo_padrao)) ? 
          config.escopo_padrao as unknown as EscopoPadrao : 
          {
            arquivos: true,
            hooks: true,
            componentes: true,
            paginas: true,
            estilos: true,
            edge_functions: true,
            tabelas: true,
            rotas: true,
          },
        regras_preservacao: (typeof config.regras_preservacao === 'object' && config.regras_preservacao && !Array.isArray(config.regras_preservacao)) ? 
          config.regras_preservacao as unknown as RegrasPreservacao : 
          {
            preservar_producao: true,
            preservar_autenticacao: true,
            preservar_paginas_ativas: true,
            preservar_hooks_sistema: true,
          },
      });
    }
  }, [config]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!currentCompany?.id) {
        throw new Error('Company not found');
      }

      const payload = {
        ...data,
        company_id: currentCompany.id,
        escopo_padrao: data.escopo_padrao as any,
        regras_preservacao: data.regras_preservacao as any,
      };

      if (config?.id) {
        const { error } = await supabase
          .from('auditoria_config')
          .update(payload)
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('auditoria_config')
          .insert(payload);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Configuração salva',
        description: 'As configurações de auditoria foram atualizadas com sucesso.',
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['auditoria-config'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro ao salvar as configurações.',
        variant: 'destructive',
      });
    }
  });

  const handleSave = () => {
    mutation.mutate(formData);
  };

  const handleFormChange = (newData: any) => {
    setFormData(newData);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração da Auditoria</CardTitle>
          <CardDescription>
            Configure como a auditoria do projeto será executada e monitorada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StatusDisplay config={config} hasChanges={hasChanges} />
          
          <Separator />
          
          <ConfigurationForm formData={formData} setFormData={handleFormChange} />
          
          <Separator />
          
          <ScopeConfiguration formData={formData} setFormData={handleFormChange} />
          
          <Separator />
          
          <NotificationSettings formData={formData} setFormData={handleFormChange} />
          
          <Separator />
          
          <AdvancedSettings formData={formData} setFormData={handleFormChange} />
          
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || mutation.isPending}
              className="min-w-[120px]"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
