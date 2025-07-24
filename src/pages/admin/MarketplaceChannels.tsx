import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MarketplaceChannelCard } from "@/components/Marketplace/MarketplaceChannelCard";
import { MarketplaceConnectionDialog } from "@/components/Marketplace/MarketplaceConnectionDialog";
import { useMarketplaceChannels } from "@/hooks/useMarketplaceChannels";
import { useMarketplaceIntegrations } from "@/hooks/useMarketplaceIntegrations";
import { ShoppingCart, Settings, Activity, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplaceChannels() {
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  const {
    channels,
    companyConfigs,
    isLoading,
    toggleChannel,
    isTogglingChannel,
    isChannelEnabled,
    canManageChannels
  } = useMarketplaceChannels();

  const {
    integrations,
    createIntegration
  } = useMarketplaceIntegrations();

  useEffect(() => {
    const checkPermissions = async () => {
      const canManageResult = await canManageChannels();
      setCanManage(canManageResult);
    };
    checkPermissions();
  }, [canManageChannels]);

  const handleChannelToggle = (channelName: string, enabled: boolean) => {
    toggleChannel({ channelName, isEnabled: enabled });
  };

  const handleConnectAccount = (channelName: string) => {
    setSelectedChannel(channelName);
    setShowConnectionDialog(true);
  };

  const handleCreateIntegration = async (data: any) => {
    if (!selectedChannel) return;

    createIntegration.mutate({
      marketplace: selectedChannel,
      auth_type: 'apikey',
      credentials: data.credentials,
      config: {
        sync_interval: data.sync_interval,
        webhook_url: data.webhook_url
      }
    }, {
      onSuccess: () => {
        setShowConnectionDialog(false);
        setSelectedChannel(null);
      }
    });
  };

  // Estatísticas
  const activeChannels = channels.filter(c => c.status === 'active').length;
  const enabledChannels = companyConfigs.filter(c => c.is_enabled).length;
  const connectedAccounts = integrations.filter(i => i.status === 'active').length;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Canais de Marketplace"
        description="Gerencie as integrações disponíveis com marketplaces e ative os canais para sua empresa"
      />

      {/* Alert informativo */}
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {canManage ? (
            <>
              <strong>Administrador:</strong> Você pode ativar/desativar canais de marketplace para sua empresa. 
              Operadores e colaboradores só podem conectar suas contas nos canais ativos.
            </>
          ) : (
            <>
              <strong>Operador:</strong> Conecte suas contas nos marketplaces ativos para sincronizar produtos e pedidos. 
              Entre em contato com o administrador para ativar novos canais.
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canais Disponíveis</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeChannels}</div>
            <p className="text-xs text-muted-foreground">
              {channels.length - activeChannels} em manutenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canais Habilitados</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledChannels}</div>
            <p className="text-xs text-muted-foreground">
              Ativados para sua empresa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Conectadas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Sincronizando automaticamente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de marketplaces */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Marketplaces Disponíveis</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              🟢 Ativo
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              🟡 Manutenção
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              🔴 Inativo
            </Badge>
          </div>
        </div>

        {channels.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum marketplace disponível</h3>
              <p className="text-muted-foreground">
                Os canais de marketplace serão carregados automaticamente pelo sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <MarketplaceChannelCard
                key={channel.id}
                channel={channel}
                isEnabled={isChannelEnabled(channel.name)}
                canManage={canManage}
                onToggle={handleChannelToggle}
                onConnect={handleConnectAccount}
                isToggling={isTogglingChannel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog de conexão */}
      <MarketplaceConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
        onSubmit={handleCreateIntegration}
        isLoading={createIntegration.isPending}
      />
    </div>
  );
}