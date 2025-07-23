import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Filter, User, Database, Clock, Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  company_id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: any;
  user_agent: string | null;
  severity: string;
  status: string;
  details: any;
  created_at: string;
}

const AdminAuditLogs = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    action: '',
    resource_type: '',
    severity: '',
    user_search: '',
    start_date: '',
    end_date: '',
  });

  // Verificar se o usuário é admin
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const { data: auditLogs, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async (): Promise<AuditLog[]> => {
      try {
        const { data, error } = await supabase.rpc('get_audit_logs', {
          p_company_id: null,
          p_user_id: null,
          p_action: filters.action || null,
          p_resource_type: filters.resource_type || null,
          p_severity: filters.severity || null,
          p_start_date: filters.start_date ? new Date(filters.start_date).toISOString() : null,
          p_end_date: filters.end_date ? new Date(filters.end_date).toISOString() : null,
          p_limit: 100,
          p_offset: 0,
        });

        if (error) {
          console.error('Erro ao buscar audit logs:', error);
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error('Erro na query de audit logs:', err);
        toast.error('Erro ao carregar logs de auditoria');
        return [];
      }
    },
    enabled: !!user,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getActionBadge = (action: string, status: string) => {
    const baseAction = action.split(':')[0];
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let icon = "📝";

    switch (baseAction) {
      case 'create':
      case 'insert':
        variant = "default";
        icon = "🟢";
        break;
      case 'update':
      case 'edit':
        variant = "secondary";
        icon = "🟡";
        break;
      case 'delete':
      case 'remove':
        variant = "destructive";
        icon = "🔴";
        break;
      case 'login':
      case 'auth':
        variant = "outline";
        icon = "🔐";
        break;
      default:
        variant = "outline";
        icon = "📋";
    }

    return (
      <Badge variant={variant} className="font-mono text-xs">
        {icon} {action}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    
    switch (severity) {
      case 'critical':
        variant = "destructive";
        break;
      case 'warning':
        variant = "secondary";
        break;
      case 'info':
        variant = "outline";
        break;
      default:
        variant = "default";
    }

    return <Badge variant={variant}>{severity}</Badge>;
  };

  const formatChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return '-';
    
    const changes = [];
    
    if (newValues && typeof newValues === 'object') {
      Object.keys(newValues).forEach(key => {
        const oldVal = oldValues?.[key];
        const newVal = newValues[key];
        
        if (oldVal !== newVal) {
          changes.push(`${key}: ${oldVal || 'vazio'} → ${newVal || 'vazio'}`);
        }
      });
    }
    
    return changes.length > 0 ? changes.slice(0, 3).join(', ') + (changes.length > 3 ? '...' : '') : '-';
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Erro ao carregar logs de auditoria</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Logs de Auditoria</h1>
          <p className="text-muted-foreground">
            Rastreamento de ações sensíveis no sistema
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Ação</label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Criação</SelectItem>
                  <SelectItem value="update">Atualização</SelectItem>
                  <SelectItem value="delete">Exclusão</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="auth">Autenticação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Recurso</label>
              <Select value={filters.resource_type} onValueChange={(value) => handleFilterChange('resource_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os recursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="invoice">Nota Fiscal</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severidade</label>
              <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as severidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Usuário</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email ou nome do usuário"
                  value={filters.user_search}
                  onChange={(e) => handleFilterChange('user_search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Logs</p>
                <p className="text-2xl font-bold">{auditLogs?.length || 0}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Únicos</p>
                <p className="text-2xl font-bold">
                  {auditLogs ? new Set(auditLogs.map(log => log.user_id)).size : 0}
                </p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                <p className="text-sm font-medium">
                  {auditLogs?.[0]?.created_at 
                    ? format(new Date(auditLogs[0].created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                    : '-'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando logs...</span>
            </div>
          ) : auditLogs && auditLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Alterações</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{log.user_name || 'Sistema'}</div>
                          <div className="text-xs text-muted-foreground">{log.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action, log.status)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{log.resource_type}</div>
                          {log.resource_id && (
                            <div className="text-xs text-muted-foreground font-mono">
                              ID: {log.resource_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(log.severity)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-xs text-muted-foreground truncate" title={formatChanges(log.old_values, log.new_values)}>
                          {formatChanges(log.old_values, log.new_values)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum log de auditoria encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;