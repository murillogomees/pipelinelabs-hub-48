
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Calendar,
  Database,
  Trash2,
  Bell
} from 'lucide-react';

export function AuditoriaConfigPanel() {
  const { config, updateConfig, isUpdating } = useAuditoriaProjeto();
  
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

  useEffect(() => {
    if (config) {
      setFormData(prev => ({
        ...prev,
        ...config,
      }));
    }
  }, [config]);

  const handleSave = () => {
    updateConfig(formData);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração da Auditoria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
              className="w-full p-2 border rounded-md"
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
              value={formData.email_notificacao || ''}
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
              value={formData.webhook_notificacao || ''}
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
                  setFormData(prev => ({ ...prev, limite_problemas_alerta: parseInt(e.target.value) }))
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
                  setFormData(prev => ({ ...prev, manter_historico_dias: parseInt(e.target.value) }))
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

        {/* Status */}
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
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isUpdating ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
