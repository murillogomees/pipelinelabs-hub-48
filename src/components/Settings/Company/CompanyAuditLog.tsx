
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Filter, AlertCircle, User, Clock } from 'lucide-react';
import { useUserCompany } from '@/hooks/useUserCompany';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLogFilters {
  action?: string;
  resource_type?: string;
  severity?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  severity: string;
  status: string;
  details: any;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export const CompanyAuditLog: React.FC = () => {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const { userCompany } = useUserCompany();
  const { data: auditLogs, isLoading, error, refetch } = useAuditLogs(filters);

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Erro ao carregar logs</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Log de Auditoria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="action">Ação</Label>
            <Input
              id="action"
              placeholder="Filtrar por ação..."
              value={filters.action || ''}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource_type">Tipo de Recurso</Label>
            <Select
              value={filters.resource_type || ''}
              onValueChange={(value) => handleFilterChange('resource_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="company">Empresa</SelectItem>
                <SelectItem value="product">Produto</SelectItem>
                <SelectItem value="sale">Venda</SelectItem>
                <SelectItem value="invoice">Nota Fiscal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="severity">Severidade</Label>
            <Select
              value={filters.severity || ''}
              onValueChange={(value) => handleFilterChange('severity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as severidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as severidades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de logs */}
        <div className="space-y-3">
          {auditLogs && auditLogs.length > 0 ? (
            auditLogs.map((entry: AuditLog) => (
              <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{entry.action}</Badge>
                      <Badge variant="outline">{entry.resource_type}</Badge>
                      <Badge className={getSeverityColor(entry.severity)}>
                        {entry.severity}
                      </Badge>
                      <Badge className={getStatusColor(entry.status)}>
                        {entry.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{entry.user_email || 'Sistema'}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>
                
                {entry.details && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <strong>Detalhes:</strong> {JSON.stringify(entry.details)}
                  </div>
                )}
                
                {entry.ip_address && (
                  <div className="text-xs text-muted-foreground">
                    <strong>IP:</strong> {entry.ip_address}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log encontrado</p>
              <p className="text-xs">Ajuste os filtros para ver mais resultados</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => refetch()}>
            <Search className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={() => setFilters({})}>
            <Filter className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
