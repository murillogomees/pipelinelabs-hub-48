import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MarketplaceChannel } from "@/hooks/useMarketplaceChannels";
import { ShoppingCart, Settings, AlertTriangle, CheckCircle } from "lucide-react";

interface MarketplaceChannelCardProps {
  channel: MarketplaceChannel;
  isEnabled: boolean;
  canManage: boolean;
  onToggle: (channelName: string, enabled: boolean) => void;
  onConnect?: (channelName: string) => void;
  isToggling?: boolean;
}

export const MarketplaceChannelCard = ({
  channel,
  isEnabled,
  canManage,
  onToggle,
  onConnect,
  isToggling = false
}: MarketplaceChannelCardProps) => {
  const getStatusBadge = () => {
    switch (channel.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ativo
        </Badge>;
      case 'maintenance':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Manutenção
        </Badge>;
      default:
        return <Badge variant="outline">Inativo</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (channel.status === 'active' && isEnabled) {
      return "🟢";
    } else if (channel.status === 'maintenance') {
      return "🟡";
    } else {
      return "🔴";
    }
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              {channel.logo_url ? (
                <img 
                  src={channel.logo_url} 
                  alt={channel.display_name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <ShoppingCart className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-xl">{getStatusIcon()}</span>
                {channel.display_name}
              </CardTitle>
              <CardDescription className="text-sm">
                {channel.description || 'Marketplace disponível para integração'}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status da integração */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isEnabled ? 'Integração Ativa' : 'Integração Inativa'}
            </span>
          </div>
          
          {canManage && (
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => onToggle(channel.name, checked)}
              disabled={isToggling || channel.status !== 'active'}
            />
          )}
        </div>

        {/* Recursos necessários */}
        {channel.required_plan_features && channel.required_plan_features.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Recursos necessários:</p>
            <div className="flex flex-wrap gap-1">
              {channel.required_plan_features.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          {isEnabled && onConnect && (
            <Button
              onClick={() => onConnect(channel.name)}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              size="sm"
            >
              <span className="text-lg mr-1">⚡</span>
              Conectar com 1 Clique
            </Button>
          )}
          
          {!isEnabled && channel.status === 'active' && canManage && (
            <Button
              onClick={() => onToggle(channel.name, true)}
              variant="outline"
              className="flex-1"
              size="sm"
              disabled={isToggling}
            >
              {isToggling ? 'Ativando...' : 'Ativar Canal'}
            </Button>
          )}

          {channel.status === 'maintenance' && (
            <Button
              variant="outline"
              className="flex-1"
              size="sm"
              disabled
            >
              Em Manutenção
            </Button>
          )}
        </div>

        {/* Informações adicionais */}
        {isEnabled && (
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded">
            💡 <strong>Próximo passo:</strong> Conecte sua conta do {channel.display_name} para sincronizar produtos e pedidos automaticamente.
          </div>
        )}
      </CardContent>
    </Card>
  );
};