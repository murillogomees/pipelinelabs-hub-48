import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketplaceIntegrationCard } from '@/components/Integrations/MarketplaceIntegrationCard';
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Store, Package, RefreshCw, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function IntegracaoMarketplace() {
  const {
    isLoading,
    isSaving,
    isSyncing,
    testingConnection,
    availableIntegrations,
    companyIntegrations,
    saveIntegration,
    removeIntegration,
    testConnection,
    syncIntegration,
    getIntegrationConfig,
    isIntegrationActive,
    getLastSync
  } = useMarketplaceIntegrations();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const configuredIntegrations = companyIntegrations.map(ci => ci.integration_id);
  const activeIntegrationsCount = companyIntegrations.filter(ci => ci.is_active).length;

  return (
    <MainLayout>
      <PermissionGuard requireCompanyAdmin>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Integrações Marketplace</h1>
              <p className="text-muted-foreground">
                Conecte sua loja com os principais marketplaces para sincronizar produtos, pedidos e estoque automaticamente.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marketplaces Disponíveis</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableIntegrations.length}</div>
                <p className="text-xs text-muted-foreground">
                  Plataformas suportadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Configuradas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{configuredIntegrations.length}</div>
                <p className="text-xs text-muted-foreground">
                  Integrações configuradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativas</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeIntegrationsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Funcionando agora
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {activeIntegrationsCount > 0 ? '✓' : '○'}
                  </div>
                  <Badge variant={activeIntegrationsCount > 0 ? 'default' : 'secondary'}>
                    {activeIntegrationsCount > 0 ? 'Operacional' : 'Inativo'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integrations Grid */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Marketplaces Disponíveis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableIntegrations.map((integration) => {
                  const isConfigured = configuredIntegrations.includes(integration.id);
                  const currentConfig = isConfigured ? getIntegrationConfig(integration.id) : {};
                  const isActive = isIntegrationActive(integration.id);
                  const lastSync = getLastSync(integration.id);

                  return (
                    <MarketplaceIntegrationCard
                      key={integration.id}
                      integration={integration}
                      isConfigured={isConfigured}
                      currentConfig={currentConfig}
                      isActive={isActive}
                      lastSync={lastSync}
                      onSave={saveIntegration}
                      onTest={testConnection}
                      onSync={syncIntegration}
                      onRemove={removeIntegration}
                      isSaving={isSaving}
                      isTesting={testingConnection === integration.id}
                      isSyncing={isSyncing}
                    />
                  );
                })}
              </div>
            </div>

            {availableIntegrations.length === 0 && (
              <Card className="text-center py-12">
                <CardContent className="space-y-4">
                  <Store className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">Nenhum marketplace disponível</h3>
                    <p className="text-muted-foreground">
                      As integrações de marketplace estarão disponíveis em breve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Help Section */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">💡 Dicas para Integração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Shopee</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Acesse o Shopee Partner Center</li>
                    <li>• Obtenha suas credenciais de API</li>
                    <li>• Configure o ambiente (sandbox/produção)</li>
                    <li>• Teste a conexão antes de ativar</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Amazon</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Registre-se no Amazon Developer Portal</li>
                    <li>• Configure o SP-API Access</li>
                    <li>• Obtenha seu Seller ID</li>
                    <li>• Selecione o marketplace correto</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    </MainLayout>
  );
}