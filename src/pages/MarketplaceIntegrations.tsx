import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BaseLayout } from '@/components/Base/BaseLayout';
import { MarketplaceCard } from '@/components/Marketplace/MarketplaceCard';
import { MarketplaceConnectionDialog } from '@/components/Marketplace/MarketplaceConnectionDialog';
import { 
  useMarketplaceIntegrations, 
  MarketplaceIntegration 
} from '@/hooks/useMarketplaceIntegrations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketplaceIntegrations() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<MarketplaceIntegration | null>(null);

  const {
    integrations,
    isLoading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,
    syncNow
  } = useMarketplaceIntegrations();

  const handleCreateIntegration = (data: any) => {
    createIntegration.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
      }
    });
  };

  const handleToggleStatus = (id: string, newStatus: 'active' | 'inactive') => {
    updateIntegration.mutate({
      id,
      updates: { status: newStatus }
    });
  };

  const handleTest = (id: string) => {
    testConnection.mutate(id);
  };

  const handleSync = (id: string) => {
    syncNow.mutate(id);
  };

  const handleEdit = (integration: MarketplaceIntegration) => {
    setEditingIntegration(integration);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta integração?')) {
      deleteIntegration.mutate(id);
    }
  };

  const handleRefreshAll = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <BaseLayout title="Integrações com Marketplaces">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Integrações com Marketplaces">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Integrações com Marketplaces</h1>
            <p className="text-muted-foreground">
              Conecte sua empresa aos principais marketplaces e sincronize produtos, pedidos e estoque
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Integração
            </Button>
          </div>
        </div>

        {!integrations?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma integração configurada</CardTitle>
              <CardDescription>
                Conecte-se aos principais marketplaces para centralizar suas vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Conectar primeiro marketplace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Resumo das integrações */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {integrations.filter(i => i.status === 'active').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Ativas</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">
                      {integrations.filter(i => i.status === 'inactive').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Inativas</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">
                      {integrations.filter(i => i.status === 'error').length}
                    </div>
                    <p className="text-sm text-muted-foreground">Com Erro</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de integrações */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <MarketplaceCard
                  key={integration.id}
                  integration={integration}
                  onToggleStatus={handleToggleStatus}
                  onTest={handleTest}
                  onSync={handleSync}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isLoading={
                    updateIntegration.isPending || 
                    testConnection.isPending || 
                    syncNow.isPending ||
                    deleteIntegration.isPending
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* Alert para integração de staging */}
        <Alert>
          <AlertDescription>
            💡 <strong>Dica:</strong> Em ambiente de staging, as integrações são simuladas 
            para não afetar os dados reais dos marketplaces.
          </AlertDescription>
        </Alert>

        <MarketplaceConnectionDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingIntegration(null);
          }}
          onSubmit={handleCreateIntegration}
          isLoading={createIntegration.isPending}
        />
      </div>
    </BaseLayout>
  );
}