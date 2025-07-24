import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  Settings, 
  Activity, 
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useMarketplaceIntegration } from '@/hooks/useMarketplaceIntegration';
import { MarketplaceChannelGrid } from './MarketplaceChannelGrid';
import { MarketplaceIntegrationList } from './MarketplaceIntegrationList';
import { MarketplaceSyncPanel } from './MarketplaceSyncPanel';
import { MarketplaceConnectionDialog } from './MarketplaceConnectionDialog';
import { MarketplaceStatsCards } from './MarketplaceStatsCards';
import { cn } from '@/lib/utils';

interface MarketplaceHubProps {
  className?: string;
}

export const MarketplaceHub = ({ className }: MarketplaceHubProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const {
    channels,
    integrations,
    syncLogs,
    isLoading,
    getChannelStats,
    canManageChannels
  } = useMarketplaceIntegration();

  const [canManage, setCanManage] = useState(false);

  // Check permissions on mount
  React.useEffect(() => {
    const checkPermissions = async () => {
      const result = await canManageChannels();
      setCanManage(result);
    };
    checkPermissions();
  }, [canManageChannels]);

  const stats = getChannelStats();
  const recentActivity = syncLogs.slice(0, 5);

  const handleConnectChannel = (channelName: string) => {
    setSelectedChannel(channelName);
    setIsConnectionDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Central de Marketplaces</h1>
          <p className="text-muted-foreground">
            Gerencie suas integrações e monitore sincronizações em tempo real
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="hidden sm:flex"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          {canManage && (
            <Button onClick={() => setIsConnectionDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Integração
            </Button>
          )}
        </div>
      </div>

      {/* Permission Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {canManage ? (
            <>
              <strong>Administrador:</strong> Você pode ativar canais e gerenciar todas as integrações.
            </>
          ) : (
            <>
              <strong>Operador:</strong> Conecte suas contas nos canais ativos. Entre em contato com o administrador para ativar novos canais.
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <MarketplaceStatsCards stats={stats} recentActivity={recentActivity} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <Activity className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="text-xs sm:text-sm">
            <ShoppingCart className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Canais</span>
            <span className="sm:hidden">Canais</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm">
            <Settings className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Integrações</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Sincronização</span>
            <span className="sm:hidden">Sync</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Status Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Canais Disponíveis</span>
                    <Badge variant="secondary">{stats.active}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Canais Habilitados</span>
                    <Badge variant="secondary">{stats.enabled}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Integrações Conectadas</span>
                    <Badge 
                      variant={stats.connected > 0 ? "default" : "secondary"}
                      className={stats.connected > 0 ? "bg-green-500" : ""}
                    >
                      {stats.connected}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Em Manutenção</span>
                    <Badge variant="outline">{stats.maintenance}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {log.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : log.status === 'error' ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="truncate">{log.event_type}</span>
                        </div>
                        <Badge 
                          variant={
                            log.status === 'success' ? 'default' : 
                            log.status === 'error' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {log.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma atividade recente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse rapidamente as funcionalidades mais utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => setActiveTab('channels')}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm">Gerenciar Canais</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => setIsConnectionDialogOpen(true)}
                  disabled={!canManage}
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">Nova Integração</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => setActiveTab('sync')}
                >
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">Ver Sincronizações</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col space-y-2 p-4"
                  onClick={() => setActiveTab('integrations')}
                >
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">Configurações</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <MarketplaceChannelGrid 
            canManage={canManage}
            onConnect={handleConnectChannel}
          />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <MarketplaceIntegrationList />
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <MarketplaceSyncPanel />
        </TabsContent>
      </Tabs>

      {/* Connection Dialog */}
      <MarketplaceConnectionDialog
        open={isConnectionDialogOpen}
        onOpenChange={setIsConnectionDialogOpen}
        selectedChannel={selectedChannel}
        onSubmit={() => {}}
      />
    </div>
  );
};