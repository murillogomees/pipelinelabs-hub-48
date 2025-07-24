import { useState, useEffect } from 'react';
import { Plus, Search, Settings, Zap, ExternalLink } from 'lucide-react';
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
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar canais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'Nenhum canal encontrado' : 'Nenhum canal cadastrado'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca.' 
                : 'Comece criando seu primeiro canal de marketplace.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleNewChannel}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Canal
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChannels.map((channel) => {
              const connectionStatus = connectionStatuses.get(channel.id);
              
              return (
                <Card key={channel.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {channel.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {channel.name}
                      </CardTitle>
                      
                      <div className="flex items-center gap-1">
                        {channel.status && connectionStatus?.connected && (
                          <Badge variant="default" className="bg-green-600 text-white">
                            Conectado
                          </Badge>
                        )}
                        {channel.status && !connectionStatus?.connected && (
                          <Badge variant="destructive">
                            Desconectado
                          </Badge>
                        )}
                        {!channel.status && (
                          <Badge variant="secondary">
                            Inativo
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {channel.description && (
                      <p className="text-sm text-muted-foreground">
                        {channel.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {connectionStatus?.profile && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Informações da Conta
                        </h4>
                        <div className="space-y-1">
                          {connectionStatus.profile.name && (
                            <p className="text-sm">
                              <span className="font-medium">Nome:</span> {connectionStatus.profile.name}
                            </p>
                          )}
                          {connectionStatus.profile.email && (
                            <p className="text-sm">
                              <span className="font-medium">Email:</span> {connectionStatus.profile.email}
                            </p>
                          )}
                          {connectionStatus.profile.id && (
                            <p className="text-sm">
                              <span className="font-medium">ID:</span> {connectionStatus.profile.id}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {connectionStatus?.error && (
                      <Alert variant="destructive">
                        <AlertDescription className="text-xs">
                          {connectionStatus.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {channel.status && connectionStatus?.connected ? (
                        <>
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(channel)}
                            className="flex-1"
                          >
                            Desconectar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(channel)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleConnect(channel)}
                            size="sm"
                            className="flex-1"
                            disabled={!channel.status}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Conectar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(channel)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(channel.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Settings className="h-4 w-4" />
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