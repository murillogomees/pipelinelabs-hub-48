
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuditoriaProjeto, AuditoriaConfig } from '@/hooks/useAuditoriaProjeto';
import { 
  Settings, 
  Save, 
  Clock, 
  Mail, 
  Shield, 
  AlertTriangle,
  Database,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

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

  const cronOptions = [
    { value: '0 2 * * *', label: 'Diariamente às 2:00' },
    { value: '0 2 * * 1', label: 'Semanalmente (segunda-feira às 2:00)' },
    { value: '0 2 1 * *', label: 'Mensalmente (dia 1 às 2:00)' },
  ];

  const handleEscopoChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      escopo_padrao: {
        ...prev.escopo_padrao,
        [field]: value,
      },
    }));
  };

  const handleRegrasChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      regras_preservacao: {
        ...prev.regras_preservacao,
        [field]: value,
      },
    }));
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
        {/* Status de Salvamento */}
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

        {/* Configurações Gerais */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auditoria-ativa">Auditoria Automática</Label>
              <p className="text-sm text-muted-foreground">
                Ativar execução automática da auditoria
              </p>
            </div>
            <Switch
              id="auditoria-ativa"
              checked={formData.auditoria_ativa}
              onCheckedChange={(value) => 
                setFormData(prev => ({ ...prev, auditoria_ativa: value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequencia">Frequência de Execução</Label>
            <select
              id="frequencia"
              value={formData.frequencia_cron}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, frequencia_cron: e.target.value }))
              }
              className="w-full p-2 border rounded-md bg-background"
            >
              {cronOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Separator />

        {/* Escopo da Auditoria */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <Label>Escopo da Auditoria</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(formData.escopo_padrao).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="capitalize">
                  {key.replace('_', ' ')}
                </Label>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => handleEscopoChange(key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Notificações */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <Label>Notificações</Label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notificacoes-ativas">Notificações Ativas</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações sobre auditorias
              </p>
            </div>
            <Switch
              id="notificacoes-ativas"
              checked={formData.notificacoes_ativas}
              onCheckedChange={(value) => 
                setFormData(prev => ({ ...prev, notificacoes_ativas: value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-notificacao">Email para Notificações</Label>
            <Input
              id="email-notificacao"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.email_notificacao}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, email_notificacao: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-notificacao">Webhook para Notificações</Label>
            <Input
              id="webhook-notificacao"
              type="url"
              placeholder="https://exemplo.com/webhook"
              value={formData.webhook_notificacao}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, webhook_notificacao: e.target.value }))
              }
            />
          </div>
        </div>

        <Separator />

        {/* Configurações Avançadas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <Label>Configurações Avançadas</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limite-problemas">Limite de Problemas para Alerta</Label>
              <Input
                id="limite-problemas"
                type="number"
                min="1"
                value={formData.limite_problemas_alerta}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, limite_problemas_alerta: parseInt(e.target.value) || 1 }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manter-historico">Manter Histórico (dias)</Label>
              <Input
                id="manter-historico"
                type="number"
                min="1"
                value={formData.manter_historico_dias}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, manter_historico_dias: parseInt(e.target.value) || 1 }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-limpeza">Limpeza Automática Segura</Label>
              <p className="text-sm text-muted-foreground">
                Aplicar automaticamente limpezas seguras
              </p>
            </div>
            <Switch
              id="auto-limpeza"
              checked={formData.auto_limpeza_segura}
              onCheckedChange={(value) => 
                setFormData(prev => ({ ...prev, auto_limpeza_segura: value }))
              }
            />
          </div>
        </div>

        <Separator />

        {/* Regras de Preservação */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <Label>Regras de Preservação</Label>
          </div>

          <div className="space-y-3">
            {Object.entries(formData.regras_preservacao).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="capitalize">
                  {key.replace('_', ' ')}
                </Label>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => handleRegrasChange(key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Status da Configuração Atual */}
        {config && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label>Status da Auditoria</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Última Execução</Label>
                <p className="text-sm text-muted-foreground">
                  {config.ultima_execucao 
                    ? new Date(config.ultima_execucao).toLocaleString('pt-BR')
                    : 'Nunca executada'
                  }
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Próxima Execução</Label>
                <p className="text-sm text-muted-foreground">
                  {config.proxima_execucao 
                    ? new Date(config.proxima_execucao).toLocaleString('pt-BR')
                    : 'Não agendada'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={config.auditoria_ativa ? 'default' : 'secondary'}>
                {config.auditoria_ativa ? 'Ativa' : 'Inativa'}
              </Badge>
              {config.notificacoes_ativas && (
                <Badge variant="outline">
                  <Mail className="h-3 w-3 mr-1" />
                  Notificações
                </Badge>
              )}
              {hasChanges && (
                <Badge variant="destructive">
                  Alterações Pendentes
                </Badge>
              )}
            </div>
          </div>
        )}

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
