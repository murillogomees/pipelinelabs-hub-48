
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Trash2,
  Copy,
  Database,
  Palette
} from 'lucide-react';

interface AuditoriaDetailsDialogProps {
  auditoria: any;
  open: boolean;
  onClose: () => void;
}

export function AuditoriaDetailsDialog({ auditoria, open, onClose }: AuditoriaDetailsDialogProps) {
  if (!auditoria) return null;

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manual':
        return 'bg-blue-100 text-blue-800';
      case 'automatica':
        return 'bg-green-100 text-green-800';
      case 'agendada':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSugestaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'arquivo_nao_usado':
        return <FileText className="h-4 w-4" />;
      case 'hook_duplicado':
        return <Code className="h-4 w-4" />;
      case 'componente_duplicado':
        return <Copy className="h-4 w-4" />;
      case 'tabela_vazia':
        return <Database className="h-4 w-4" />;
      case 'estilo_nao_usado':
        return <Palette className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Detalhes da Auditoria
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(auditoria.status)}`} />
                  <Badge className={getTypeColor(auditoria.tipo_auditoria)}>
                    {auditoria.tipo_auditoria}
                  </Badge>
                  <span className="font-medium capitalize">{auditoria.status}</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Iniciado em:</span>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(auditoria.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Tempo de Execução:</span>
                    <p className="text-sm text-muted-foreground">{auditoria.tempo_execucao_ms}ms</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{auditoria.arquivos_analisados}</p>
                  <p className="text-sm text-muted-foreground">Arquivos Analisados</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{auditoria.problemas_encontrados}</p>
                  <p className="text-sm text-muted-foreground">Problemas Encontrados</p>
                </div>
              </div>
            </div>

            {/* Error Details */}
            {auditoria.erro_detalhes && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-900">Erro na Execução</span>
                </div>
                <p className="text-sm text-red-700">{auditoria.erro_detalhes}</p>
              </div>
            )}

            <Separator />

            {/* Detailed Results */}
            <Tabs defaultValue="sugestoes" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sugestoes">Sugestões</TabsTrigger>
                <TabsTrigger value="duplicados">Duplicados</TabsTrigger>
                <TabsTrigger value="nao_usados">Não Usados</TabsTrigger>
                <TabsTrigger value="melhorias">Melhorias</TabsTrigger>
              </TabsList>

              <TabsContent value="sugestoes" className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Sugestões de Limpeza ({auditoria.sugestoes_limpeza.length})</h4>
                  {auditoria.sugestoes_limpeza.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma sugestão encontrada</p>
                  ) : (
                    <div className="space-y-2">
                      {auditoria.sugestoes_limpeza.map((sugestao: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          {getSugestaoIcon(sugestao.tipo)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{sugestao.descricao || 'Sugestão de otimização'}</p>
                            <p className="text-xs text-muted-foreground">{sugestao.arquivo || 'Arquivo não especificado'}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {sugestao.tipo || 'geral'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="duplicados" className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Arquivos Duplicados ({auditoria.arquivos_duplicados.length})</h4>
                  {auditoria.arquivos_duplicados.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum arquivo duplicado encontrado</p>
                  ) : (
                    <div className="space-y-2">
                      {auditoria.arquivos_duplicados.map((arquivo: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                          <Copy className="h-4 w-4 text-orange-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{arquivo.nome || 'Arquivo'}</p>
                            <p className="text-xs text-muted-foreground">{arquivo.caminho || 'Caminho não especificado'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Componentes Duplicados ({auditoria.componentes_duplicados.length})</h4>
                  {auditoria.componentes_duplicados.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum componente duplicado encontrado</p>
                  ) : (
                    <div className="space-y-2">
                      {auditoria.componentes_duplicados.map((componente: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                          <Code className="h-4 w-4 text-orange-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{componente.nome || 'Componente'}</p>
                            <p className="text-xs text-muted-foreground">{componente.similaridade || 'Similaridade detectada'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="nao_usados" className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Arquivos Não Utilizados ({auditoria.arquivos_nao_utilizados.length})</h4>
                  {auditoria.arquivos_nao_utilizados.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum arquivo não utilizado encontrado</p>
                  ) : (
                    <div className="space-y-2">
                      {auditoria.arquivos_nao_utilizados.map((arquivo: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Trash2 className="h-4 w-4 text-gray-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{arquivo.nome || 'Arquivo'}</p>
                            <p className="text-xs text-muted-foreground">{arquivo.caminho || 'Caminho não especificado'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Hooks Não Utilizados ({auditoria.hooks_nao_utilizados.length})</h4>
                  {auditoria.hooks_nao_utilizados.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum hook não utilizado encontrado</p>
                  ) : (
                    <div className="space-y-2">
                      {auditoria.hooks_nao_utilizados.map((hook: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Code className="h-4 w-4 text-gray-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{hook.nome || 'Hook'}</p>
                            <p className="text-xs text-muted-foreground">{hook.caminho || 'Caminho não especificado'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="melhorias" className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Melhorias Aplicadas ({auditoria.melhorias_aplicadas.length})</h4>
                  {auditoria.melhorias_aplicadas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma melhoria foi aplicada ainda</p>
                  ) : (
                    <div className="space-y-2">
                      {auditoria.melhorias_aplicadas.map((melhoria: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{melhoria.descricao || 'Melhoria aplicada'}</p>
                            <p className="text-xs text-muted-foreground">{melhoria.timestamp || 'Timestamp não especificado'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {auditoria.feedback_usuario && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold mb-2">Feedback do Usuário</h5>
                    <p className="text-sm text-muted-foreground">{auditoria.feedback_usuario}</p>
                  </div>
                )}

                {auditoria.score_aprendizado > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h5 className="font-semibold mb-2">Score de Aprendizado</h5>
                    <p className="text-sm text-muted-foreground">
                      Pontuação: {auditoria.score_aprendizado.toFixed(2)}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
