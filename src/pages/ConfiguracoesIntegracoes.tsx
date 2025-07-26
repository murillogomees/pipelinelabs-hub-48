
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Check, X } from 'lucide-react';
import { useMarketplaceIntegrations } from '@/hooks/useMarketplaceIntegrations';

export default function ConfiguracoesIntegracoes() {
  const { integrations, isLoading } = useMarketplaceIntegrations();
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Inativo</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
          <p className="text-muted-foreground">
            Configure e gerencie suas integrações com marketplaces e sistemas externos
          </p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations?.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {integration.marketplace || 'Integração'}
                </div>
                {getStatusBadge(integration.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Integração com {integration.marketplace}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Configurar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!integrations || integrations.length === 0) && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma integração configurada</h3>
              <p className="text-muted-foreground mb-4">
                Configure integrações para sincronizar seus dados com marketplaces e sistemas externos
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Integração
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
