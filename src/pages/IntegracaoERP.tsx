import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Play,
  Pause,
  RefreshCw,
  Database,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error' | 'syncing';
  lastSync?: string;
  icon: React.ReactNode;
  stats?: {
    totalRecords: number;
    lastUpdate: string;
  };
}

const integrations: IntegrationStatus[] = [
  {
    id: 'products',
    name: 'Produtos',
    description: 'Sincronização de catálogo de produtos',
    status: 'active',
    lastSync: '2024-01-15T10:30:00Z',
    icon: <Package className="h-5 w-5" />,
    stats: {
      totalRecords: 1542,
      lastUpdate: '2024-01-15T10:30:00Z'
    }
  },
  {
    id: 'customers',
    name: 'Clientes',
    description: 'Sincronização de informações de clientes',
    status: 'syncing',
    lastSync: '2024-01-15T10:00:00Z',
    icon: <Users className="h-5 w-5" />,
    stats: {
      totalRecords: 876,
      lastUpdate: '2024-01-15T10:00:00Z'
    }
  },
  {
    id: 'orders',
    name: 'Pedidos',
    description: 'Sincronização de pedidos de venda',
    status: 'inactive',
    icon: <ShoppingCart className="h-5 w-5" />,
    stats: {
      totalRecords: 234,
      lastUpdate: '2024-01-14T18:20:00Z'
    }
  },
  {
    id: 'finances',
    name: 'Finanças',
    description: 'Sincronização de dados financeiros',
    status: 'error',
    lastSync: '2024-01-14T12:00:00Z',
    icon: <DollarSign className="h-5 w-5" />,
    stats: {
      totalRecords: 567,
      lastUpdate: '2024-01-14T12:00:00Z'
    }
  },
  {
    id: 'inventory',
    name: 'Estoque',
    description: 'Sincronização de níveis de estoque',
    status: 'active',
    lastSync: '2024-01-15T11:00:00Z',
    icon: <Database className="h-5 w-5" />,
    stats: {
      totalRecords: 987,
      lastUpdate: '2024-01-15T11:00:00Z'
    }
  },
  {
    id: 'calendar',
    name: 'Agenda',
    description: 'Sincronização de compromissos e tarefas',
    status: 'inactive',
    icon: <Calendar className="h-5 w-5" />,
    stats: {
      totalRecords: 345,
      lastUpdate: '2024-01-13T09:15:00Z'
    }
  }
];

export function IntegracaoERP() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Integração ERP</h1>
          <p className="text-muted-foreground">
            Conecte seus dados do ERP para uma visão unificada do seu negócio
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Status das Integrações
          </TabsTrigger>
          <TabsTrigger value="configuracao" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral da Integração</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aqui você pode ver um resumo das suas integrações ERP.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {integrations.map(integration => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {integration.icon}
                        {integration.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                      <Badge variant="secondary" className="mt-2">
                        {integration.status === 'active' && <><CheckCircle className="h-3 w-3 mr-1" /> Ativo</>}
                        {integration.status === 'inactive' && <>Inativo</>}
                        {integration.status === 'error' && <><AlertTriangle className="h-3 w-3 mr-1" /> Erro</>}
                        {integration.status === 'syncing' && <><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Sincronizando</>}
                      </Badge>
                      {integration.stats && (
                        <div className="mt-3">
                          <p className="text-sm">Total de Registros: {integration.stats.totalRecords}</p>
                          <p className="text-sm">Última Atualização: {new Date(integration.stats.lastUpdate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status das Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map(integration => (
                  <div key={integration.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {integration.icon}
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div>
                      {integration.status === 'active' && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                      {integration.status === 'inactive' && (
                        <Badge variant="secondary">
                          Inativo
                        </Badge>
                      )}
                      {integration.status === 'error' && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Erro
                        </Badge>
                      )}
                      {integration.status === 'syncing' && (
                        <Badge variant="outline" className="text-blue-600">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Sincronizando
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Integração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Configure as opções de integração para cada módulo do ERP.
                </p>
                {isAdmin ? (
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Acessar Configurações
                  </Button>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Você não tem permissão para acessar as configurações de integração.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
