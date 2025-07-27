
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, Search, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
  severity: string;
  status: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    email?: string;
    access_levels?: {
      name: string;
      display_name: string;
    };
  };
}

export function CompanyAuditLog() {
  const { currentCompanyId, canAccessCompanyData } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['company-audit-logs', currentCompanyId, searchTerm, actionFilter, severityFilter],
    queryFn: async () => {
      if (!currentCompanyId || !canAccessCompanyData) return [];

      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles!inner (
            display_name,
            email,
            access_levels (
              name,
              display_name
            )
          )
        `)
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%`);
      }

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!currentCompanyId && canAccessCompanyData
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (action.includes('update')) return <Clock className="h-4 w-4 text-blue-600" />;
    if (action.includes('delete')) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    return <User className="h-4 w-4 text-gray-600" />;
  };

  if (!canAccessCompanyData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          Você não tem permissão para visualizar os logs de auditoria desta empresa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Logs de Auditoria da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ação ou recurso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as severidades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de logs */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando logs...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum log de auditoria encontrado</p>
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedEntry(log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActionIcon(log.action)}
                        <h3 className="font-medium">{log.action}</h3>
                        <Badge variant={getSeverityColor(log.severity) as any}>
                          {log.severity}
                        </Badge>
                        <Badge variant={getStatusColor(log.status) as any}>
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Recurso: {log.resource_type} {log.resource_id && `(ID: ${log.resource_id})`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Usuário: {log.profiles?.display_name || log.profiles?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detalhes do log selecionado */}
          {selectedEntry && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/20">
              <h4 className="font-medium mb-2">Detalhes do Log</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Ação:</strong> {selectedEntry.action}
                </div>
                <div>
                  <strong>Recurso:</strong> {selectedEntry.resource_type}
                </div>
                <div>
                  <strong>Usuário:</strong> {selectedEntry.profiles?.display_name || selectedEntry.profiles?.email || 'N/A'}
                </div>
                <div>
                  <strong>Data:</strong> {format(new Date(selectedEntry.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                </div>
              </div>
              
              {selectedEntry.old_values && (
                <div className="mt-3">
                  <strong>Valores anteriores:</strong>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedEntry.old_values, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedEntry.new_values && (
                <div className="mt-3">
                  <strong>Novos valores:</strong>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedEntry.new_values, null, 2)}
                  </pre>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setSelectedEntry(null)}
              >
                Fechar Detalhes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
