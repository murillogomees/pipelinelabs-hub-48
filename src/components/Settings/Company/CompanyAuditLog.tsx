
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissions } from '@/hooks/usePermissions';
import { Eye, Filter, Search, Clock, User, FileText } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
  user_id: string;
  company_id: string;
  ip_address: string;
  user_agent: string;
  details: any;
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
  const { currentCompanyId, canAccessAdminPanel } = usePermissions();
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    resource_type: '',
    user_id: '',
    date_from: '',
    date_to: ''
  });

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', currentCompanyId, filters],
    queryFn: async () => {
      if (!currentCompanyId) return [];

      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles (
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

      // Apply filters
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      // Process data to handle potential profile errors
      const processedData = data.map(entry => ({
        ...entry,
        profiles: entry.profiles && typeof entry.profiles === 'object' && !('error' in entry.profiles)
          ? entry.profiles
          : { display_name: 'Usuário não encontrado', email: 'N/A' }
      }));

      return processedData as AuditLogEntry[];
    },
    enabled: !!currentCompanyId && canAccessAdminPanel
  });

  const getActionBadge = (action: string) => {
    const variants = {
      'CREATE': 'default' as const,
      'UPDATE': 'secondary' as const,
      'DELETE': 'destructive' as const,
      'LOGIN': 'outline' as const,
      'LOGOUT': 'outline' as const
    };
    return variants[action as keyof typeof variants] || 'outline' as const;
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'product':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (entry: AuditLogEntry) => {
    setSelectedEntry(entry);
    setIsDetailsOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      resource_type: '',
      user_id: '',
      date_from: '',
      date_to: ''
    });
  };

  if (!canAccessAdminPanel) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Você não tem permissão para visualizar os logs de auditoria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action">Ação</Label>
              <Select
                value={filters.action}
                onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as ações</SelectItem>
                  <SelectItem value="CREATE">Criar</SelectItem>
                  <SelectItem value="UPDATE">Atualizar</SelectItem>
                  <SelectItem value="DELETE">Deletar</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource_type">Tipo de Recurso</Label>
              <Select
                value={filters.resource_type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, resource_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                  <SelectItem value="sale">Venda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_from">Data Inicial</Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Logs de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : auditLogs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log de auditoria encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs?.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getResourceIcon(entry.resource_type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getActionBadge(entry.action)}>
                          {entry.action}
                        </Badge>
                        <span className="text-sm font-medium">{entry.resource_type}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Por: {entry.profiles?.display_name || 'Usuário não encontrado'} ({entry.profiles?.email || 'N/A'})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(entry)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ação</Label>
                  <p className="text-sm">{selectedEntry.action}</p>
                </div>
                <div>
                  <Label>Tipo de Recurso</Label>
                  <p className="text-sm">{selectedEntry.resource_type}</p>
                </div>
                <div>
                  <Label>Usuário</Label>
                  <p className="text-sm">{selectedEntry.profiles?.display_name || 'N/A'}</p>
                </div>
                <div>
                  <Label>Data/Hora</Label>
                  <p className="text-sm">{new Date(selectedEntry.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedEntry.old_values && (
                <div>
                  <Label>Valores Anteriores</Label>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(selectedEntry.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEntry.new_values && (
                <div>
                  <Label>Novos Valores</Label>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(selectedEntry.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEntry.details && (
                <div>
                  <Label>Detalhes Adicionais</Label>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(selectedEntry.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
