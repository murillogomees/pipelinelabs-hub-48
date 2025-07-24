import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  ExternalLink, 
  MoreHorizontal,
  X,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {channels.map((channel) => {
          const connectionStatus = connectionStatuses[channel.slug];
          
          return (
            <Card key={channel.id} className="group hover:shadow-md transition-all duration-300 border-border/40 hover:border-border bg-card/50 backdrop-blur-sm hover:bg-card/80">
              <CardHeader className="pb-4 space-y-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-background to-muted border border-border/50 flex items-center justify-center overflow-hidden shadow-sm">
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
                          className="w-7 h-7 opacity-70"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold truncate text-foreground mb-1">
                        {channel.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground/80 font-medium">
                        {channel.slug}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-all duration-200 hover:bg-muted/50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[170px]">
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(channel.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="py-4 space-y-4">
                {channel.description && (
                  <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
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

              <CardFooter className="pt-0 pb-4">
                <div className="flex gap-2 w-full">
                  {connectionStatus?.status === 'connected' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-xs font-medium hover:bg-muted/50 transition-colors duration-200"
                      onClick={() => onSync(channel.slug)}
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Gerenciar
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 h-9 text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200"
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
        channelId={authDialog.channel?.id}
        onOpenChange={(open) => setAuthDialog({ open })}
      />
    </>
  );
};