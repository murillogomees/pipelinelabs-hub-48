import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  ExternalLink, 
  MoreHorizontal,
  Trash2,
  Power,
  PowerOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarketplaceChannel } from "@/hooks/useMarketplaceChannels";
import { ConnectionStatus } from "./ConnectionStatus";
import { AuthDialog } from "./AuthDialog";

interface MarketplaceGridProps {
  channels: MarketplaceChannel[];
  connectionStatuses: Record<string, any>;
  onEdit: (channel: MarketplaceChannel) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: boolean) => void;
  onSync: (marketplace: string) => void;
  onReconnect: (marketplace: string) => void;
  isLoading?: boolean;
}

export const MarketplaceGrid = ({
  channels,
  connectionStatuses,
  onEdit,
  onDelete,
  onToggleStatus,
  onSync,
  onReconnect,
  isLoading
}: MarketplaceGridProps) => {
  const [authDialog, setAuthDialog] = useState<{ open: boolean; marketplace?: string; channel?: MarketplaceChannel }>({
    open: false
  });

  const handleConnect = (channel: MarketplaceChannel) => {
    setAuthDialog({
      open: true,
      marketplace: channel.slug,
      channel
    });
  };

  const getMarketplaceImage = (slug: string) => {
    const images: Record<string, string> = {
      'mercado-livre': '/placeholder.svg',
      'shopee': '/placeholder.svg',
      'amazon': '/placeholder.svg',
      'magazine-luiza': '/placeholder.svg',
      'via-varejo': '/placeholder.svg'
    };
    return images[slug] || '/placeholder.svg';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {channels.map((channel) => {
          const connectionStatus = connectionStatuses[channel.slug];
          
          return (
            <Card key={channel.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {channel.logo_url ? (
                        <img 
                          src={channel.logo_url} 
                          alt={channel.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img 
                          src={getMarketplaceImage(channel.slug)} 
                          alt={channel.name}
                          className="w-6 h-6 opacity-60"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {channel.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {channel.slug}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => onEdit(channel)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onToggleStatus(channel.id, !channel.status)}
                      >
                        {channel.status ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(channel.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="py-3">
                {channel.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {channel.description}
                  </p>
                )}
                
                <ConnectionStatus
                  status={connectionStatus?.status || 'disconnected'}
                  lastSync={connectionStatus?.lastSync}
                  onSync={() => onSync(channel.slug)}
                  onReconnect={() => onReconnect(channel.slug)}
                  isLoading={isLoading}
                />
              </CardContent>

              <CardFooter className="pt-0">
                <div className="flex gap-2 w-full">
                  {connectionStatus?.status === 'connected' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => onSync(channel.slug)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Gerenciar
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleConnect(channel)}
                    >
                      Conectar
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <AuthDialog
        open={authDialog.open}
        marketplace={authDialog.marketplace}
        channel={authDialog.channel}
        onOpenChange={(open) => setAuthDialog({ open })}
      />
    </>
  );
};