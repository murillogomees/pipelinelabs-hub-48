import { useState, useEffect } from 'react';
import { Plus, Search, Settings, Zap, ExternalLink, AlertCircle } from 'lucide-react';
import { BaseLayout } from '@/components/Base/BaseLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChannelDialog } from '@/components/MarketplaceChannels/ChannelDialog';
import { ChannelCard } from '@/components/MarketplaceChannels/ChannelCard';
import { AuthDialog } from '@/components/MarketplaceChannels/AuthDialog';
import { useMarketplaceChannels, MarketplaceChannel } from '@/hooks/useMarketplaceChannels';
import { useMarketplaceAuth } from '@/hooks/useMarketplaceAuth';

export default function MarketplaceChannels() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<MarketplaceChannel | undefined>();
  const [deletingChannelId, setDeletingChannelId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [authDialog, setAuthDialog] = useState<{
    open: boolean;
    marketplace: string;
    channelId?: string;
  }>({ open: false, marketplace: '' });
  const [connectionStatuses, setConnectionStatuses] = useState<Map<string, any>>(new Map());

  const {
    channels,
    isLoading,
    error,
    createChannel,
    updateChannel,
    deleteChannel,
    toggleChannelStatus,
    isCreating,
    isUpdating,
    isDeleting
  } = useMarketplaceChannels();

  const { getConnectionStatus, disconnect } = useMarketplaceAuth();

  // Check connection statuses on mount and when channels change
  useEffect(() => {
    const checkConnections = async () => {
      const statusMap = new Map();
      
      for (const channel of channels) {
        if (channel.slug && channel.status) {
          try {
            const status = await getConnectionStatus(channel.slug);
            statusMap.set(channel.id, status);
          } catch (error) {
            console.error(`Failed to check connection for ${channel.slug}:`, error);
          }
        }
      }
      
      setConnectionStatuses(statusMap);
    };

    if (channels.length > 0) {
      checkConnections();
    }
  }, [channels, getConnectionStatus]);

  // Filtrar canais por termo de busca
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChannel = (data: any) => {
    createChannel(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
      }
    });
  };

  const handleUpdateChannel = (data: any) => {
    updateChannel(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setEditingChannel(undefined);
      }
    });
  };

  const handleSubmit = (data: any) => {
    if (editingChannel) {
      handleUpdateChannel(data);
    } else {
      handleCreateChannel(data);
    }
  };

  const handleEdit = (channel: MarketplaceChannel) => {
    setEditingChannel(channel);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingChannelId(id);
  };

  const confirmDelete = () => {
    if (deletingChannelId) {
      deleteChannel(deletingChannelId, {
        onSuccess: () => {
          setDeletingChannelId('');
        }
      });
    }
  };

  const handleNewChannel = () => {
    setEditingChannel(undefined);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingChannel(undefined);
  };

  const handleConnect = (channel: MarketplaceChannel) => {
    setAuthDialog({
      open: true,
      marketplace: channel.slug,
      channelId: channel.id
    });
  };

  const handleDisconnect = async (channel: MarketplaceChannel) => {
    try {
      await disconnect(channel.slug, channel.id);
      // Refresh connection status
      const status = await getConnectionStatus(channel.slug);
      setConnectionStatuses(prev => new Map(prev.set(channel.id, status)));
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const handleAuthSuccess = () => {
    setAuthDialog({ open: false, marketplace: '' });
    // Refresh connection status for the connected channel
    if (authDialog.channelId) {
      getConnectionStatus(authDialog.marketplace).then(status => {
        setConnectionStatuses(prev => new Map(prev.set(authDialog.channelId!, status)));
      });
    }
  };

  if (error) {
    return (
      <BaseLayout title="Marketplace Channels">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar os canais: {error.message}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Marketplace Channels">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Marketplace Channels</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie os canais de marketplace disponíveis no sistema
            </p>
          </div>
          <Button onClick={handleNewChannel} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Canal
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar canais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              {searchTerm ? 'Nenhum canal encontrado' : 'Nenhum canal cadastrado'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {searchTerm 
                ? 'Tente ajustar os termos de busca para encontrar o canal desejado.' 
                : 'Conecte seus primeiros marketplaces para centralizar a gestão de vendas.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleNewChannel} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Canal
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredChannels.map((channel) => {
              const connectionStatus = connectionStatuses.get(channel.id);
              const isConnected = channel.status && connectionStatus?.connected;
              
              return (
                <Card key={channel.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
                  <CardHeader className="pb-4">
                    {/* Header com avatar, título e status */}
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center shadow-sm ${
                          isConnected ? 'ring-2 ring-green-500/20' : ''
                        }`}>
                          <span className="text-white font-bold text-lg">
                            {channel.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {/* Indicador de status */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                          isConnected 
                            ? 'bg-green-500' 
                            : channel.status 
                              ? 'bg-yellow-500' 
                              : 'bg-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate mb-1">
                          {channel.name}
                        </CardTitle>
                        
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isConnected ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs px-2 py-0.5">
                              <div className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full mr-1.5" />
                              Conectado
                            </Badge>
                          ) : channel.status ? (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs px-2 py-0.5">
                              <div className="w-1.5 h-1.5 bg-yellow-600 dark:bg-yellow-400 rounded-full mr-1.5" />
                              Aguardando
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Descrição */}
                    {channel.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-3">
                        {channel.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    {/* Informações da conta conectada */}
                    {connectionStatus?.profile && (
                      <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Conta Conectada
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {connectionStatus.profile.name && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">Nome:</span>
                              <span className="text-xs font-medium truncate">
                                {connectionStatus.profile.name}
                              </span>
                            </div>
                          )}
                          {connectionStatus.profile.email && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">Email:</span>
                              <span className="text-xs font-medium truncate">
                                {connectionStatus.profile.email}
                              </span>
                            </div>
                          )}
                          {connectionStatus.profile.id && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">ID:</span>
                              <span className="text-xs font-mono font-medium truncate">
                                {connectionStatus.profile.id}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Erro de conexão */}
                    {connectionStatus?.error && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-3 w-3" />
                        <AlertDescription className="text-xs leading-relaxed">
                          {connectionStatus.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Botões de ação */}
                    <div className="flex items-center gap-2 pt-2">
                      {isConnected ? (
                        <>
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(channel)}
                            className="flex-1 h-9 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1.5" />
                            Desconectar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(channel)}
                            className="h-9 w-9 p-0"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleConnect(channel)}
                            size="sm"
                            className="flex-1 h-9 text-xs"
                            disabled={!channel.status}
                          >
                            <Zap className="h-3 w-3 mr-1.5" />
                            Conectar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(channel)}
                            className="h-9 w-9 p-0"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(channel.id)}
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog */}
      <ChannelDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        channel={editingChannel}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialog.open}
        onOpenChange={(open) => setAuthDialog(prev => ({ ...prev, open }))}
        marketplace={authDialog.marketplace}
        channelId={authDialog.channelId}
        onSuccess={handleAuthSuccess}
      />

      {/* Delete Confirmation */}
      <AlertDialog 
        open={!!deletingChannelId} 
        onOpenChange={() => setDeletingChannelId('')}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O canal será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BaseLayout>
  );
}