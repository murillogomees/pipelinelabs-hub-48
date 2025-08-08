
import React from 'react';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { useServiceHealth } from '@/hooks/useServiceHealth';
import { DatabaseOfflineHandler } from '@/components/Auth/DatabaseOfflineHandler';
import { DashboardFallback } from '@/components/Dashboard/DashboardFallback';
import { NetworkStatus } from '@/components/NetworkStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Package, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: currentCompany, isLoading, error, refetch } = useCurrentCompany();
  const { isHealthy, serviceStatus, consecutiveFailures, checkHealth, isChecking } = useServiceHealth();
  
  // Show network status for any errors
  const showNetworkStatus = error || !isHealthy || serviceStatus !== 'healthy';
  
  // Show database offline handler for severe infrastructure errors
  if (error?.code === 'PGRST002' && serviceStatus === 'outage' && consecutiveFailures > 3) {
    return (
      <>
        <DatabaseOfflineHandler
          onRetry={async () => {
            const healthy = await checkHealth();
            if (healthy) {
              refetch();
            }
          }}
          isRetrying={isChecking || isLoading}
          error={error}
          retryCount={consecutiveFailures}
          maxRetries={10}
        />
        <NetworkStatus error={error} retryCount={consecutiveFailures} maxRetries={10} />
      </>
    );
  }
  
  // Show fallback component while loading or if no company data
  if (isLoading || (!currentCompany && !error)) {
    return (
      <>
        <DashboardFallback
          onRetry={refetch}
          isRetrying={isLoading}
          error={error}
        />
        {showNetworkStatus && (
          <NetworkStatus error={error} retryCount={consecutiveFailures} maxRetries={5} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {currentCompany?.company && (
            <p className="text-muted-foreground">
              {currentCompany.company.name}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Vendas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45.231,89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+235</div>
              <p className="text-xs text-muted-foreground">
                +10.5% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produtos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.234</div>
              <p className="text-xs text-muted-foreground">
                +15 novos produtos este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Crescimento
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">
                Crescimento mensal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vendas hoje</span>
                  <span className="font-medium">R$ 2.450,00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pedidos pendentes</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Produtos em estoque</span>
                  <span className="font-medium">1.234</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm">
                  Nova venda
                </button>
                <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm">
                  Adicionar produto
                </button>
                <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm">
                  Cadastrar cliente
                </button>
                <button className="w-full text-left p-2 hover:bg-muted rounded-md text-sm">
                  Ver relatórios
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Network Status - sempre visível quando há problemas */}
      {showNetworkStatus && (
        <NetworkStatus error={error} retryCount={consecutiveFailures} maxRetries={5} />
      )}
    </>
  );
}
