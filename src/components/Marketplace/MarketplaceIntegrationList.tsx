import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMarketplaceIntegration } from '@/hooks/useMarketplaceIntegration';
import { MarketplaceIcon } from './MarketplaceIcon';
import { 
  Play, 
  Pause, 
  TestTube, 
  RefreshCw, 
  Settings, 
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const MarketplaceIntegrationList = () => {
  const {
    integrations,
    updateIntegration,
    deleteIntegration,
    testConnection,
    syncNow,
    isUpdating,
    isDeleting,
    isTesting,
    isSyncing
  } = useMarketplaceIntegration();

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateIntegration({ id, updates: { status: newStatus } });
  };

  const handleDelete = (id: string, marketplace: string) => {
    if (confirm(`Tem certeza que deseja remover a integração com ${marketplace}?`)) {
      deleteIntegration(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Nunca';
    try {
      return formatDistanceToNow(new Date(lastSync), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (integrations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma integração configurada</h3>
          <p className="text-muted-foreground">
            Conecte-se aos marketplaces disponíveis para começar a sincronizar seus dados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <Card key={integration.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MarketplaceIcon name={integration.marketplace} size={32} />
                <div>
                  <CardTitle className="text-lg capitalize">
                    {integration.marketplace}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(integration.status)}
                    <Badge variant="outline" className="text-xs">
                      {integration.auth_type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {integration.webhook_status === 'active' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {integration.status === 'error' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Integration Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Última sincronização:</span>
                <p className="font-medium">{formatLastSync(integration.last_sync)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Criado em:</span>
                <p className="font-medium">
                  {new Date(integration.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Webhook Info */}
            {integration.webhook_url && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm font-medium">Webhook:</span>
                  </div>
                  <Badge 
                    variant={integration.webhook_status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {integration.webhook_status || 'inativo'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {integration.webhook_url}
                </p>
                {integration.last_webhook_received && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Último webhook: {formatLastSync(integration.last_webhook_received)}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={integration.status === 'active' ? "outline" : "default"}
                size="sm"
                onClick={() => handleToggleStatus(integration.id, integration.status)}
                disabled={isUpdating}
              >
                {integration.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnection(integration.id)}
                disabled={isTesting || integration.status !== 'active'}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Testar
              </Button>

              {integration.status === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncNow(integration.id)}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sincronizar
                </Button>
              )}

              <div className="flex-1" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(integration.id, integration.marketplace)}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>

            {/* Auto-sync Status */}
            {integration.config?.auto_sync_enabled && integration.status === 'active' && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Sincronização automática a cada {integration.config.sync_interval_minutes || 5} minutos
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};