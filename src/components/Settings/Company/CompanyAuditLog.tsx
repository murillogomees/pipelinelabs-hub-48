
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter } from 'lucide-react';
import { useUserCompany } from '@/hooks/useUserCompany';
import { useAuditLogs } from '@/hooks/useAuditLogs';

interface AuditLogFilters {
  user_id?: string;
  action?: string;
  resource_type?: string;
  severity?: string;
  start_date?: string;
  end_date?: string;
}

export const CompanyAuditLog: React.FC = () => {
  const { userCompany, isLoading: isLoadingCompany } = useUserCompany();
  const [filters, setFilters] = useState<AuditLogFilters>({});
  
  const { 
    logs, 
    isLoading: isLoadingLogs, 
    error,
    refetch 
  } = useAuditLogs({
    company_id: userCompany?.company_id,
    ...filters
  });

  if (isLoadingCompany || !userCompany?.company_id) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action">Ação</Label>
              <Input
                id="action"
                placeholder="Ex: user:login"
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
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
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
                  <SelectValue placeholder="Selecione a severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">
              Erro ao carregar logs: {error.message}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum log encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                      <span className="font-medium">{log.action}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Usuário:</span> {log.user_email || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Recurso:</span> {log.resource_type}
                    </div>
                    <div>
                      <span className="font-medium">IP:</span> {log.ip_address || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {log.status}
                    </div>
                  </div>
                  
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Detalhes:</span>
                      <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
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
};
