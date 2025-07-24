import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { MarketplaceIntegration } from '@/hooks/useMarketplaceIntegration';

interface TokenRefreshIndicatorProps {
  integration: MarketplaceIntegration;
  onRefresh?: (integrationId: string) => void;
  isRefreshing?: boolean;
}

export const TokenRefreshIndicator = ({ 
  integration, 
  onRefresh, 
  isRefreshing = false 
}: TokenRefreshIndicatorProps) => {
  
  const getTokenStatus = () => {
    if (!integration.token_expires_at) {
      return { status: 'unknown', message: 'Token sem expiração definida', variant: 'secondary' as const };
    }

    const expiresAt = new Date(integration.token_expires_at);
    const now = new Date();
    const diffHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { 
        status: 'expired', 
        message: 'Token expirado', 
        variant: 'destructive' as const,
        icon: AlertTriangle
      };
    } else if (diffHours < 24) {
      return { 
        status: 'expiring', 
        message: `Expira em ${Math.floor(diffHours)}h`, 
        variant: 'destructive' as const,
        icon: Clock
      };
    } else {
      return { 
        status: 'valid', 
        message: `Válido por ${Math.floor(diffHours / 24)} dias`, 
        variant: 'default' as const,
        icon: CheckCircle
      };
    }
  };

  const tokenStatus = getTokenStatus();
  const IconComponent = tokenStatus.icon;

  const shouldShowRefreshButton = tokenStatus.status === 'expired' || tokenStatus.status === 'expiring';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {IconComponent && <IconComponent className="w-4 h-4" />}
          <Badge variant={tokenStatus.variant}>
            {tokenStatus.message}
          </Badge>
        </div>
        
        {shouldShowRefreshButton && onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh(integration.id)}
            disabled={isRefreshing}
            className="h-6 px-2 text-xs"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                Renovar
              </>
            )}
          </Button>
        )}
      </div>

      {tokenStatus.status === 'expired' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Token expirado. Clique em "Renovar" para reautenticar ou reconecte a integração.
          </AlertDescription>
        </Alert>
      )}

      {tokenStatus.status === 'expiring' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Token expirando em breve. Recomendamos renovar para evitar interrupções.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};