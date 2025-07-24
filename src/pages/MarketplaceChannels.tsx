import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { BaseLayout } from '@/components/Base/BaseLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useMarketplaceChannels, MarketplaceChannel } from '@/hooks/useMarketplaceChannels';

export default function MarketplaceChannels() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<MarketplaceChannel | undefined>();
  const [deletingChannelId, setDeletingChannelId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

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
    isDeleting,
  } = useMarketplaceChannels();

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
            <h1 className="text-2xl font-bold tracking-tight">Marketplace Channels</h1>
            <p className="text-muted-foreground">
              Gerencie os canais de marketplace disponíveis no sistema
            </p>
          </div>
          <Button onClick={handleNewChannel}>
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
            {filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={(id, status) => toggleChannelStatus({ id, status })}
                isLoading={isDeleting}
              />
            ))}
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