
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuditoriaProjeto } from '@/hooks/useAuditoriaProjeto';
import { Play, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AuditoriaExecutionPanel() {
  const { config, historico, executarAuditoria, isExecuting } = useAuditoriaProjeto();
  const [customScope, setCustomScope] = useState<any>(null);

  const ultimaAuditoria = historico?.[0];
  const auditoriaAtiva = historico?.find(h => h.status === 'executando');

  const handleExecutarAuditoria = () => {
    executarAuditoria(customScope);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executando':
        return 'bg-blue-500';
      case 'concluida':
        return 'bg-green-500';
      case 'erro':
        return 'bg-red-500';
      case 'cancelada':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'executando':
        return <Clock className="h-4 w-4" />;
      case 'concluida':
        return <CheckCircle className="h-4 w-4" />;
      case 'erro':
        return <XCircle className="h-4 w-4" />;
      case 'cancelada':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!config) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Configuração Necessária</h3>
            <p className="text-muted-foreground mb-4">
              Configure a auditoria primeiro na aba "Configuração"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Execução Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Executar Auditoria Completa</p>
              <p className="text-sm text-muted-foreground">
                Executa uma auditoria completa com base na configuração atual
              </p>
            </div>
            <Button
              onClick={handleExecutarAuditoria}
              disabled={isExecuting || !!auditoriaAtiva}
              className="min-w-[120px]"
            >
              {isExecuting ? 'Executando...' : 'Executar Agora'}
            </Button>
          </div>

          {auditoriaAtiva && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="animate-spin">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-blue-900">
                  Auditoria em Execução
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Iniciada em {format(new Date(auditoriaAtiva.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status da Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auditoria Automática</span>
            <Badge variant={config.auditoria_ativa ? 'default' : 'secondary'}>
              {config.auditoria_ativa ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Frequência</span>
            <span className="text-sm text-muted-foreground">{config.frequencia_cron}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Última Execução</span>
            <span className="text-sm text-muted-foreground">
              {config.ultima_execucao 
                ? format(new Date(config.ultima_execucao), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                : 'Nunca executada'
              }
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Próxima Execução</span>
            <span className="text-sm text-muted-foreground">
              {config.proxima_execucao 
                ? format(new Date(config.proxima_execucao), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                : 'Não agendada'
              }
            </span>
          </div>

          <Separator />

          <div className="space-y-2">
            <span className="text-sm font-medium">Escopo de Auditoria</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(config.escopo_padrao).map(([key, value]) => (
                value && (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key.replace('_', ' ')}
                  </Badge>
                )
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {ultimaAuditoria && (
        <Card>
          <CardHeader>
            <CardTitle>Última Auditoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(ultimaAuditoria.status)}`} />
                <span className="font-medium capitalize">{ultimaAuditoria.status}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(ultimaAuditoria.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{ultimaAuditoria.arquivos_analisados}</p>
                <p className="text-sm text-muted-foreground">Arquivos Analisados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{ultimaAuditoria.problemas_encontrados}</p>
                <p className="text-sm text-muted-foreground">Problemas Encontrados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{ultimaAuditoria.melhorias_aplicadas.length}</p>
                <p className="text-sm text-muted-foreground">Melhorias Aplicadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{ultimaAuditoria.tempo_execucao_ms}ms</p>
                <p className="text-sm text-muted-foreground">Tempo de Execução</p>
              </div>
            </div>

            {ultimaAuditoria.erro_detalhes && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium text-red-900">Erro na Execução</p>
                <p className="text-sm text-red-700 mt-1">{ultimaAuditoria.erro_detalhes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
