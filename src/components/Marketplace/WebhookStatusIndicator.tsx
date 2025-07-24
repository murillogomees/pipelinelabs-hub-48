import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertTriangle, Clock, RefreshCw, Zap } from 'lucide-react';
import { MarketplaceIntegration } from '@/hooks/useMarketplaceIntegration';

interface WebhookStatusIndicatorProps {
  integration: MarketplaceIntegration;
  onTest?: (integrationId: string) => void;
  isTesting?: boolean;
}

export const WebhookStatusIndicator = ({ 
  integration, 
  onTest,
  isTesting = false 
}: WebhookStatusIndicatorProps) => {
  
  const getWebhookStatus = () => {
    const status = integration.webhook_status;
    const lastReceived = integration.last_webhook_received;
    
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Ativo',
          color: 'text-green-600'
        };
      case 'error':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          text: 'Erro',
          color: 'text-red-600'
        };
      case 'inactive':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          text: 'Inativo',
          color: 'text-gray-600'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: Clock,
          text: 'Pendente',
          color: 'text-yellow-600'
        };
    }
  };

  const webhookStatus = getWebhookStatus();
  const IconComponent = webhookStatus.icon;

  const formatLastReceived = () => {
    if (!integration.last_webhook_received) {
      return 'Nenhum webhook recebido';
    }
    
    const date = new Date(integration.last_webhook_received);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else {
      return `${diffDays}d atrás`;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2 cursor-help">
              <IconComponent className={`w-4 h-4 ${webhookStatus.color}`} />
              <Badge variant={webhookStatus.variant}>
                Webhook {webhookStatus.text}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs space-y-1">
              <p><strong>Status:</strong> {webhookStatus.text}</p>
              <p><strong>URL:</strong> {integration.webhook_url || 'Não configurado'}</p>
              <p><strong>Último recebido:</strong> {formatLastReceived()}</p>
            </div>
          </TooltipContent>
        </Tooltip>

        {onTest && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTest(integration.id)}
            disabled={isTesting}
            className="h-6 px-2 text-xs"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 mr-1" />
                Testar
              </>
            )}
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {formatLastReceived()}
      </div>
    </div>
  );
};