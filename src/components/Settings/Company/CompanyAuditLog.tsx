
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Download, Eye, Shield, User, Crown } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { DataTable, Column } from '@/components/ui/data-table';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  user_id: string;
  details: any;
  created_at: string;
  severity: string;
  status: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const { isContratante, isSuperAdmin } = usePermissions();

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['company-audit-logs', actionFilter, severityFilter],
    queryFn: async () => {
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
        .order('created_at', { ascending: false });

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: isContratante || isSuperAdmin,
  });

  const getUserTypeIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'contratante':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'operador':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const getVariant = (severity: string) => {
      switch (severity) {
        case 'info':
          return 'default';
        case 'warning':
          return 'secondary';
        case 'error':
        case 'critical':
          return 'destructive';
        default:
          return 'default';
      }
    };
    
    return <Badge variant={getVariant(severity)}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const getVariant = (status: string) => {
      switch (status) {
        case 'success':
          return 'default';
        case 'failed':
          return 'destructive';
        case 'pending':
          return 'secondary';
        default:
          return 'default';
      }
    };
    
    return <Badge variant={getVariant(status)}>{status}</Badge>;
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'created_at',
      header: 'Data/Hora',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleString('pt-BR')}
        </span>
      )
    },
    {
      key: 'profiles',
      header: 'Usuário',
      render: (_value: any, row: AuditLogEntry) => (
        <div className="flex items-center space-x-2">
          {getUserTypeIcon(row.profiles?.access_levels?.name || '')}
          <div>
            <p className="font-medium">{row.profiles?.display_name || 'Usuário Desconhecido'}</p>
            <p className="text-sm text-muted-foreground">{row.profiles?.email || 'Email não disponível'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      header: 'Ação',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'resource_type',
      header: 'Recurso',
      render: (value: string) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      key: 'severity',
      header: 'Severidade',
      render: (value: string) => getSeverityBadge(value)
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => getStatusBadge(value)
    }
  ];

  const actions = [
    {
      label: 'Detalhes',
      icon: Eye,
      onClick: (row: AuditLogEntry) => {
        console.log('View details:', row);
      },
      variant: 'outline' as const
    }
  ];

  const handleExport = () => {
    console.log('Export audit logs');
  };

  if (!isContratante && !isSuperAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Você não tem permissão para visualizar os logs de auditoria.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Log de Auditoria</span>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ação, recurso ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="create">Criar</SelectItem>
              <SelectItem value="update">Atualizar</SelectItem>
              <SelectItem value="delete">Excluir</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as severidades</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <DataTable
          data={filteredLogs}
          columns={columns}
          actions={actions}
          loading={isLoading}
          emptyMessage="Nenhum log de auditoria encontrado"
        />
      </CardContent>
    </Card>
  );
}
