import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useMarketplaceIntegration } from '@/hooks/useMarketplaceIntegration';
import { MarketplaceIcon } from './MarketplaceIcon';
import { 
  ShoppingCart, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';

interface MarketplaceChannelGridProps {
  canManage: boolean;
  onConnect: (channelName: string) => void;
}

export const MarketplaceChannelGrid = ({ canManage, onConnect }: MarketplaceChannelGridProps) => {
  const {
    channels,
    isChannelEnabled,
    isChannelConnected,
    toggleChannel,
    isToggling
  } = useMarketplaceIntegration();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">🟢 Ativo</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">🟡 Manutenção</Badge>;
      default:
        return <Badge variant="secondary">🔴 Inativo</Badge>;
    }
  };

  const getStatusIcon = (channel: any) => {
    const enabled = isChannelEnabled(channel.name);
    const connected = isChannelConnected(channel.name);
    
    if (connected) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (enabled) return <Settings className="h-5 w-5 text-blue-500" />;
    return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
  };

  if (channels.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum marketplace disponível</h3>
          <p className="text-muted-foreground">
            Os canais de marketplace serão carregados automaticamente pelo sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm">Conectado</span>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-blue-500" />
          <span className="text-sm">Habilitado</span>
        </div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Desabilitado</span>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => {
          const enabled = isChannelEnabled(channel.name);
          const connected = isChannelConnected(channel.name);
          
          return (
            <Card 
              key={channel.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                connected ? 'ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-900/10' :
                enabled ? 'ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10' :
                'hover:shadow-sm'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <MarketplaceIcon name={channel.name} size={32} />
                    <div>
                      <CardTitle className="text-lg">{channel.display_name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(channel.status)}
                        {getStatusIcon(channel)}
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {channel.description || 'Marketplace disponível para integração'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Required Features */}
                {channel.required_plan_features && channel.required_plan_features.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recursos necessários:</p>
                    <div className="flex flex-wrap gap-1">
                      {channel.required_plan_features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Integration Status */}
                {canManage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {enabled ? 'Canal habilitado' : 'Canal desabilitado'}
                    </span>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        toggleChannel({ channelName: channel.name, isEnabled: checked })
                      }
                      disabled={isToggling || channel.status !== 'active'}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                  {connected ? (
                    <Button variant="outline" className="w-full" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Conectado
                    </Button>
                  ) : enabled ? (
                    <Button 
                      onClick={() => onConnect(channel.name)}
                      className="w-full"
                      disabled={channel.status !== 'active'}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Conectar Conta
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {canManage ? 'Ative o canal primeiro' : 'Canal não habilitado'}
                    </Button>
                  )}

                  {channel.status === 'maintenance' && (
                    <p className="text-xs text-yellow-600 text-center">
                      Canal em manutenção temporária
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Loading State */}
      {isToggling && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Atualizando configuração...</span>
          </div>
        </div>
      )}
    </div>
  );
};