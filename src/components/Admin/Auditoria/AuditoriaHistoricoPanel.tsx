
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Download, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AuditoriaHistoricoPanel');

export function AuditoriaHistoricoPanel() {
  const { data: historico = [], isLoading } = useQuery({
    queryKey: ['auditoria-historico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auditoria_historico')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching audit history:', error);
        throw error;
      }

      return data || [];
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'erro':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'executando':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'default';
      case 'erro':
        return 'destructive';
      case 'executando':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        <span className="ml-2">Carregando histórico...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Auditorias</CardTitle>
          <CardDescription>
            Visualize as auditorias executadas anteriormente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma auditoria encontrada</h3>
              <p className="mt-2 text-muted-foreground">
                Execute sua primeira auditoria para ver os resultados aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((audit: any) => (
                <div key={audit.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(audit.status)}
                      <Badge variant={getStatusColor(audit.status) as any}>
                        {audit.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(audit.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Baixar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Arquivos:</span>
                      <div className="text-muted-foreground">
                        {audit.arquivos_analisados || 0}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Problemas:</span>
                      <div className="text-muted-foreground">
                        {audit.problemas_encontrados || 0}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Não utilizados:</span>
                      <div className="text-muted-foreground">
                        {Array.isArray(audit.arquivos_nao_utilizados) ? audit.arquivos_nao_utilizados.length : 0}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Tempo:</span>
                      <div className="text-muted-foreground">
                        {audit.tempo_execucao_ms ? `${(audit.tempo_execucao_ms / 1000).toFixed(1)}s` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {audit.sugestoes_limpeza && Array.isArray(audit.sugestoes_limpeza) && audit.sugestoes_limpeza.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Sugestões:</span>
                      <ul className="text-sm text-muted-foreground mt-1">
                        {audit.sugestoes_limpeza.slice(0, 3).map((sugestao: any, index: number) => (
                          <li key={index} className="list-disc list-inside">
                            {typeof sugestao === 'string' ? sugestao : JSON.stringify(sugestao)}
                          </li>
                        ))}
                        {audit.sugestoes_limpeza.length > 3 && (
                          <li className="text-muted-foreground">
                            +{audit.sugestoes_limpeza.length - 3} mais...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
