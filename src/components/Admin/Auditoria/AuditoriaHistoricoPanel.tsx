
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuditoriaProjeto } from '@/hooks/useAuditoriaProjeto';
import { AuditoriaDetailsDialog } from './AuditoriaDetailsDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  History, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye,
  Search,
  Filter
} from 'lucide-react';

export function AuditoriaHistoricoPanel() {
  const { historico, isLoading } = useAuditoriaProjeto();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuditoria, setSelectedAuditoria] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredHistorico = historico?.filter(auditoria => 
    auditoria.tipo_auditoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auditoria.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleViewDetails = (auditoria: any) => {
    setSelectedAuditoria(auditoria);
    setShowDetails(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Auditorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por tipo ou status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {!filteredHistorico || filteredHistorico.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma auditoria encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Execute sua primeira auditoria para ver o histórico'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistorico.map((auditoria) => (
                <Card key={auditoria.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(auditoria.status)}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(auditoria.tipo_auditoria)}>
                              {auditoria.tipo_auditoria}
                            </Badge>
                            <span className="font-medium capitalize">{auditoria.status}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(auditoria.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(auditoria)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{auditoria.arquivos_analisados}</p>
                        <p className="text-xs text-muted-foreground">Arquivos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{auditoria.problemas_encontrados}</p>
                        <p className="text-xs text-muted-foreground">Problemas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{auditoria.melhorias_aplicadas.length}</p>
                        <p className="text-xs text-muted-foreground">Melhorias</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{auditoria.tempo_execucao_ms}ms</p>
                        <p className="text-xs text-muted-foreground">Tempo</p>
                      </div>
                    </div>

                    {auditoria.erro_detalhes && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-900">Erro na Execução</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">{auditoria.erro_detalhes}</p>
                      </div>
                    )}

                    {auditoria.sugestoes_limpeza.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Sugestões de Limpeza:</p>
                        <div className="flex flex-wrap gap-2">
                          {auditoria.sugestoes_limpeza.slice(0, 3).map((sugestao: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {sugestao.tipo || 'Sugestão'}
                            </Badge>
                          ))}
                          {auditoria.sugestoes_limpeza.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{auditoria.sugestoes_limpeza.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AuditoriaDetailsDialog
        auditoria={selectedAuditoria}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
}
