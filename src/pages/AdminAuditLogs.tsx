import { useState } from 'react';
import { Shield, AlertTriangle, Info, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuditLogs, AuditLogFilters } from '@/hooks/useAuditLogs';
import { AuditLogsFilters } from '@/components/Admin/AuditLogs/AuditLogsFilters';
import { AuditLogsTable } from '@/components/Admin/AuditLogs/AuditLogsTable';
import { StatsCard } from '@/components/Dashboard/StatsCard';

export default function AdminAuditLogs() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AuditLogFilters>({
    limit: 100,
    offset: 0
  });

  const { logs, isLoading, refetch } = useAuditLogs(filters);

  // Calculate stats
  const totalLogs = logs?.length || 0;
  const criticalCount = logs?.filter(log => log.severity === 'critical').length || 0;
  const errorCount = logs?.filter(log => log.severity === 'error').length || 0;
  const warningCount = logs?.filter(log => log.severity === 'warning').length || 0;

  const handleExport = async () => {
    try {
      if (!logs || logs.length === 0) {
        toast({
          title: 'Nenhum dado para exportar',
          description: 'Não há logs de auditoria para exportar.',
          variant: 'destructive',
        });
        return;
      }

      // Create CSV content
      const headers = [
        'Data/Hora',
        'Usuário',
        'Email',
        'Ação',
        'Recurso',
        'ID do Recurso',
        'Severidade',
        'Status',
        'IP',
        'Detalhes'
      ];

      const csvData = logs.map(log => [
        new Date(log.created_at).toLocaleString('pt-BR'),
        log.user_name || 'N/A',
        log.user_email || 'N/A',
        log.action,
        log.resource_type,
        log.resource_id || 'N/A',
        log.severity,
        log.status,
        log.ip_address || 'N/A',
        JSON.stringify(log.details || {})
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Exportação concluída',
        description: 'Os logs de auditoria foram exportados com sucesso.',
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os logs de auditoria.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
          <p className="text-muted-foreground">
            Rastreamento completo de ações críticas e alterações no sistema
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Shield className="h-4 w-4 mr-1" />
          Segurança
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Logs"
          value={totalLogs.toString()}
          icon={Info}
          color="blue"
        />
        <StatsCard
          title="Críticos"
          value={criticalCount.toString()}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Erros"
          value={errorCount.toString()}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Avisos"
          value={warningCount.toString()}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Pesquisa</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogsFilters
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExport}
          />
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogsTable
            logs={logs || []}
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}