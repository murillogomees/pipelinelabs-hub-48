
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuditoriaProjeto } from '@/hooks/useAuditoriaProjeto';
import { Clock, Mail, Webhook, AlertTriangle, Shield } from 'lucide-react';

export function AuditoriaConfigPanel() {
  const { config, updateConfig, isUpdating } = useAuditoriaProjeto();
  const [formData, setFormData] = useState({
    auditoria_ativa: config?.auditoria_ativa || false,
    frequencia_cron: config?.frequencia_cron || '0 2 * * *',
    escopo_padrao: config?.escopo_padrao || {
      arquivos: true,
      hooks: true,
      componentes: true,
      paginas: true,
      estilos: true,
      edge_functions: true,
      tabelas: true,
      rotas: true,
    },
    notificacoes_ativas: config?.notificacoes_ativas || true,
    email_notificacao: config?.email_notificacao || '',
    webhook_notificacao: config?.webhook_notificacao || '',
    limite_problemas_alerta: config?.limite_problemas_alerta || 50,
    manter_historico_dias: config?.manter_historico_dias || 90,
    auto_limpeza_segura: config?.auto_limpeza_segura || false,
    regras_preservacao: config?.regras_preservacao || {
      preservar_producao: true,
      preservar_autenticacao: true,
      preservar_paginas_ativas: true,
      preservar_hooks_sistema: true,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
  };

  const cronOptions = [
    { value: '0 2 * * *', label: 'Diário às 2:00' },
    { value: '0 2 * * 1', label: 'Semanal (Segunda às 2:00)' },
    { value: '0 2 1 * *', label: 'Mensal (Dia 1 às 2:00)' },
    { value: '0 2 * * 0', label: 'Semanal (Domingo às 2:00)' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auditoria_ativa">Auditoria Ativa</Label>
              <p className="text-sm text-muted-foreground">
                Ativar execução automática de auditorias
              </p>
            </div>
            <Switch
              id="auditoria_ativa"
              checked={formData.auditoria_ativa}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, auditoria_ativa: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequencia_cron">Frequência de Execução</Label>
            <Select
              value={formData.frequencia_cron}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, frequencia_cron: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                {cronOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limite_problemas_alerta">Limite para Alertas</Label>
              <Input
                id="limite_problemas_alerta"
                type="number"
                value={formData.limite_problemas_alerta}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, limite_problemas_alerta: parseInt(e.target.value) }))
                }
                min="1"
                max="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manter_historico_dias">Manter Histórico (dias)</Label>
              <Input
                id="manter_historico_dias"
                type="number"
                value={formData.manter_historico_dias}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, manter_historico_dias: parseInt(e.target.value) }))
                }
                min="7"
                max="365"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escopo de Auditoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(formData.escopo_padrao).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      escopo_padrao: { ...prev.escopo_padrao, [key]: checked }
                    }))
                  }
                />
                <Label htmlFor={key} className="text-sm capitalize">
                  {key.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notificacoes_ativas">Notificações Ativas</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações sobre execuções e problemas
              </p>
            </div>
            <Switch
              id="notificacoes_ativas"
              checked={formData.notificacoes_ativas}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, notificacoes_ativas: checked }))
              }
            />
          </div>

          {formData.notificacoes_ativas && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email_notificacao">Email para Notificações</Label>
                <Input
                  id="email_notificacao"
                  type="email"
                  value={formData.email_notificacao}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, email_notificacao: e.target.value }))
                  }
                  placeholder="admin@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_notificacao">Webhook URL</Label>
                <Input
                  id="webhook_notificacao"
                  type="url"
                  value={formData.webhook_notificacao}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, webhook_notificacao: e.target.value }))
                  }
                  placeholder="https://webhook.site/your-endpoint"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Regras de Preservação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto_limpeza_segura">Limpeza Automática Segura</Label>
              <p className="text-sm text-muted-foreground">
                Permitir limpeza automática de arquivos não críticos
              </p>
            </div>
            <Switch
              id="auto_limpeza_segura"
              checked={formData.auto_limpeza_segura}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, auto_limpeza_segura: checked }))
              }
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Sempre Preservar</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.regras_preservacao).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        regras_preservacao: { ...prev.regras_preservacao, [key]: checked }
                      }))
                    }
                  />
                  <Label htmlFor={key} className="text-sm capitalize">
                    {key.replace('preservar_', '').replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </form>
  );
}
