import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  Settings, 
  TestTube, 
  RefreshCw, 
  Trash2,
  ExternalLink 
} from 'lucide-react';
import { MarketplaceIntegration } from '@/hooks/useMarketplaceIntegrations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MarketplaceCardProps {
  integration: MarketplaceIntegration;
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void;
  onTest: (id: string) => void;
  onSync: (id: string) => void;
  onEdit: (integration: MarketplaceIntegration) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const marketplaceInfo = {
  mercadolivre: {
    name: 'Mercado Livre',
    color: 'bg-yellow-500',
    url: 'https://mercadolivre.com.br'
  },
  shopee: {
    name: 'Shopee',
    color: 'bg-orange-500',
    url: 'https://shopee.com.br'
  },
  amazon: {
    name: 'Amazon',
    color: 'bg-orange-600',
    url: 'https://amazon.com.br'
  },
  magalu: {
    name: 'Magalu Marketplace',
    color: 'bg-blue-600',
    url: 'https://marketplace.magazineluiza.com.br'
  },
  b2w: {
    name: 'B2W Marketplace',
    color: 'bg-purple-600',
    url: 'https://marketplace.americanas.com'
  },
  bling: {
    name: 'Bling',
    color: 'bg-green-600',
    url: 'https://bling.com.br'
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return '🟢';
    case 'error':
      return '🔴';
    default:
      return '🟡';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-success text-success-foreground';
    case 'error':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-warning text-warning-foreground';
  }
};

export const MarketplaceCard = ({
  integration,
  onToggleStatus,
  onTest,
  onSync,
  onEdit,
  onDelete,
  isLoading
}: MarketplaceCardProps) => {
  const marketplace = marketplaceInfo[integration.marketplace as keyof typeof marketplaceInfo];
  const isActive = integration.status === 'active';

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-3">
          <div 
            className={`w-3 h-3 rounded-full ${marketplace?.color || 'bg-muted'}`}
          />
          <CardTitle className="text-lg">
            {marketplace?.name || integration.marketplace}
          </CardTitle>
          {marketplace?.url && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => window.open(marketplace.url, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Badge className={getStatusColor(integration.status)}>
          {getStatusIcon(integration.status)} {integration.status}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Tipo de Auth:</span>
            <p className="text-muted-foreground capitalize">{integration.auth_type}</p>
          </div>
          <div>
            <span className="font-medium">Última Sync:</span>
            <p className="text-muted-foreground">
              {integration.last_sync 
                ? formatDistanceToNow(new Date(integration.last_sync), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })
                : 'Nunca'
              }
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={isActive ? "destructive" : "default"}
            size="sm"
            onClick={() => onToggleStatus(integration.id, isActive ? 'inactive' : 'active')}
            disabled={isLoading}
          >
            {isActive ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Ativar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(integration.id)}
            disabled={isLoading}
          >
            <TestTube className="h-4 w-4 mr-1" />
            Testar
          </Button>

          {isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSync(integration.id)}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Sincronizar
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(integration)}
            disabled={isLoading}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configurar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(integration.id)}
            disabled={isLoading}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};