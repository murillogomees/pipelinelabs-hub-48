
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Search, Filter, Download, User, Clock, AlertCircle } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useUserCompany } from '@/hooks/useUserCompany';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLogFilters {
  company_id?: string;
  user_id?: string;
  action?: string;
  resource_type?: string;
  severity?: string;
  start_date?: Date;
  end_date?: Date;
}

export const CompanyAuditLog: React.FC = () => {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: userCompany } = useUserCompany();
  const { data: auditLogs, isLoading, error, refetch } = useAuditLogs({
    ...filters,
    company_id: userCompany?.company_id || '',
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  });

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'blocked':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatAction = (action: string) => {
    return action.split(':').join(' ➤ ').replace(/_/g, ' ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando logs...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Erro ao carregar logs de auditoria</p>
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
            <Calendar className="h-5 w-5" />
            Log de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select onValueChange={(value) => handleFilterChange('action', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as ações</SelectItem>
                <SelectItem value="create">Criar</SelectItem>
                <SelectItem value="update">Atualizar</SelectItem>
                <SelectItem value="delete">Excluir</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange('resource_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Recurso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os recursos</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="company">Empresa</SelectItem>
                <SelectItem value="product">Produto</SelectItem>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="sale">Venda</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange('severity', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Gravidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => refetch()}>
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Logs List */}
          <div className="space-y-4">
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityColor(log.severity) as any}>
                          {log.severity}
                        </Badge>
                        <Badge variant={getStatusColor(log.status) as any}>
                          {log.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatAction(log.action)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{log.user_email || 'Sistema'}</span>
                        <Clock className="h-4 w-4 ml-4" />
                        <span>
                          {formatDistanceToNow(new Date(log.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Recurso:</span> {log.resource_type}
                    {log.resource_id && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="font-medium">ID:</span> {log.resource_id}
                      </>
                    )}
                  </div>

                  {log.ip_address && (
                    <div className="text-sm">
                      <span className="font-medium">IP:</span> {log.ip_address}
                    </div>
                  )}

                  {log.old_values && (
                    <div className="text-sm">
                      <span className="font-medium">Valores anteriores:</span>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.old_values, null, 2)}
                      </pre>
                    </div>
                  )}

                  {log.new_values && (
                    <div className="text-sm">
                      <span className="font-medium">Novos valores:</span>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.new_values, null, 2)}
                      </pre>
                    </div>
                  )}

                  <Separator />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum log de auditoria encontrado</p>
                <p className="text-xs">Ajuste os filtros para ver mais resultados</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {auditLogs && auditLogs.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                {Math.min(currentPage * itemsPerPage, auditLogs.length)} de {auditLogs.length} registros
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm px-3 py-1">
                  Página {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={auditLogs.length < itemsPerPage}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
