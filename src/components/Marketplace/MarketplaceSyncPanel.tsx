import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketplaceIntegration } from '@/hooks/useMarketplaceIntegration';
import { 
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Filter,
  Search,
  Download,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const MarketplaceSyncPanel = () => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const {
    syncLogs,
    integrations,
    isSyncLogsLoading,
    getRecentSyncLogs
  } = useMarketplaceIntegration();

  const filteredLogs = syncLogs.filter(log => {
    const matchesFilter = filter === 'all' || log.status === filter;
    const matchesSearch = search === '' || 
      log.event_type.toLowerCase().includes(search.toLowerCase()) ||
      log.integration_id.includes(search);
    
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDirectionBadge = (direction: string) => {
    return (
      <Badge variant="outline" className="text-xs">
        {direction === 'import' ? '⬇️ Import' : '⬆️ Export'}
      </Badge>
    );
  };

  const formatDuration = (durationMs: number | null) => {
    if (!durationMs) return '-';
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(1)}s`;
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getIntegrationName = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    return integration?.marketplace || 'Desconhecido';
  };

  // Calculate stats
  const stats = {
    total: syncLogs.length,
    success: syncLogs.filter(log => log.status === 'success').length,
    error: syncLogs.filter(log => log.status === 'error').length,
    pending: syncLogs.filter(log => log.status === 'pending').length
  };

  const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;

  if (isSyncLogsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sucessos</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erros</p>
                <p className="text-2xl font-bold text-red-600">{stats.error}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">{successRate}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por evento ou ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sincronizações</CardTitle>
          <CardDescription>
            Últimas {filteredLogs.length} operações de sincronização
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma sincronização encontrada</h3>
              <p className="text-muted-foreground">
                {search || filter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'As sincronizações aparecerão aqui quando executadas.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {getStatusIcon(log.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium truncate">{log.event_type}</p>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {getIntegrationName(log.integration_id)}
                        </Badge>
                        {getDirectionBadge(log.direction)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatTime(log.created_at)}</span>
                        {log.records_processed > 0 && (
                          <span>{log.records_processed} registros</span>
                        )}
                        {log.duration_ms && (
                          <span>{formatDuration(log.duration_ms)}</span>
                        )}
                      </div>
                      {log.error_message && (
                        <p className="text-sm text-red-600 mt-1 truncate">
                          {log.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(log.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};