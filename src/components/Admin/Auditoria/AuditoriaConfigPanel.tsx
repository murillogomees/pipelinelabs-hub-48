import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuditoriaProjeto } from '@/hooks/useAuditoriaProjeto';
import { Settings, Save, XCircle, Database } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

// Importar componentes menores
import { ConfigurationForm } from './components/ConfigurationForm';
import { ScopeConfiguration } from './components/ScopeConfiguration';
import { NotificationSettings } from './components/NotificationSettings';
import { AdvancedSettings } from './components/AdvancedSettings';
import { StatusDisplay } from './components/StatusDisplay';

export function AuditoriaConfigPanel() {
  const { config, updateConfig, isUpdating, configError } = useAuditoriaProjeto();
  
  const [formData, setFormData] = useState({
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
    email_notificacao: '',
    webhook_notificacao: '',
    limite_problemas_alerta: 50,
    manter_historico_dias: 90,
    auto_limpeza_segura: false,
    regras_preservacao: {
      preservar_producao: true,
      preservar_autenticacao: true,
      preservar_paginas_ativas: true,
      preservar_hooks_sistema: true,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Atualizar form quando config carrega
  useEffect(() => {
    if (config) {
      logger.debug('Carregando configuração no formulário', { config_id: config.id });
      setFormData({
        auditoria_ativa: config.auditoria_ativa,
        frequencia_cron: config.frequencia_cron,
        escopo_padrao: config.escopo_padrao,
        notificacoes_ativas: config.notificacoes_ativas,
        email_notificacao: config.email_notificacao || '',
        webhook_notificacao: config.webhook_notificacao || '',
        limite_problemas_alerta: config.limite_problemas_alerta,
        manter_historico_dias: config.manter_historico_dias,
        auto_limpeza_segura: config.auto_limpeza_segura,
        regras_preservacao: config.regras_preservacao,
      });
      setHasChanges(false);
    }
  }, [config]);

  // Detectar mudanças no form
  useEffect(() => {
    if (config) {
      const hasFormChanges = JSON.stringify(formData) !== JSON.stringify({
        auditoria_ativa: config.auditoria_ativa,
        frequencia_cron: config.frequencia_cron,
        escopo_padrao: config.escopo_padrao,
        notificacoes_ativas: config.notificacoes_ativas,
        email_notificacao: config.email_notificacao || '',
        webhook_notificacao: config.webhook_notificacao || '',
        limite_problemas_alerta: config.limite_problemas_alerta,
        manter_historico_dias: config.manter_historico_dias,
        auto_limpeza_segura: config.auto_limpeza_segura,
        regras_preservacao: config.regras_preservacao,
      });
      setHasChanges(hasFormChanges);
    }
  }, [formData, config]);

  const handleSave = async () => {
    try {
      logger.debug('Salvando configuração de auditoria', { formData });
      
      // Validações
      if (formData.limite_problemas_alerta < 1) {
        toast.error('Limite de problemas deve ser maior que 0');
        return;
      }

      if (formData.manter_historico_dias < 1) {
        toast.error('Dias para manter histórico deve ser maior que 0');
        return;
      }

      if (formData.email_notificacao && !isValidEmail(formData.email_notificacao)) {
        toast.error('Email inválido');
        return;
      }

      await updateConfig(formData);
      setHasChanges(false);
      logger.info('Configuração salva com sucesso');
    } catch (error) {
      logger.error('Erro ao salvar configuração', { error });
      toast.error('Erro ao salvar configuração');
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (configError) {
    logger.error('Erro na configuração de auditoria', { error: configError });
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Configuração</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar as configurações de auditoria.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração da Auditoria
          {hasChanges && (
            <Badge variant="outline" className="ml-auto">
              Alterações Pendentes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status de primeira configuração */}
        {!config && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                Primeira Configuração
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Configure a auditoria pela primeira vez para começar.
            </p>
          </div>
        )}

        {/* Componentes modularizados */}
        <ConfigurationForm formData={formData} setFormData={setFormData} />
        <Separator />
        <ScopeConfiguration formData={formData} setFormData={setFormData} />
        <Separator />
        <NotificationSettings formData={formData} setFormData={setFormData} />
        <Separator />
        <AdvancedSettings formData={formData} setFormData={setFormData} />
        <Separator />
        <StatusDisplay config={config} hasChanges={hasChanges} />

        {/* Botão de Salvar */}
        <div className="flex justify-end space-x-2">
          {hasChanges && (
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Cancelar
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isUpdating || !hasChanges}
            className="flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {hasChanges ? 'Salvar Alterações' : 'Salvo'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
