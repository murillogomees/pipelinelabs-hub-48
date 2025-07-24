import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MarketplaceChannel, CreateMarketplaceChannelData, UpdateMarketplaceChannelData } from '@/hooks/useMarketplaceChannels';

const channelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  slug: z.string()
    .min(1, 'Slug é obrigatório')
    .max(50, 'Slug deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.boolean().default(true),
});

type ChannelFormData = z.infer<typeof channelSchema>;

interface ChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel?: MarketplaceChannel;
  onSubmit: (data: CreateMarketplaceChannelData | UpdateMarketplaceChannelData) => void;
  isLoading?: boolean;
}

export function ChannelDialog({
  open,
  onOpenChange,
  channel,
  onSubmit,
  isLoading = false
}: ChannelDialogProps) {
  const isEditing = !!channel;

  const form = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: channel?.name || '',
      slug: channel?.slug || '',
      description: channel?.description || '',
      logo_url: channel?.logo_url || '',
      status: channel?.status ?? true,
    },
  });

  const handleSubmit = (data: ChannelFormData) => {
    const submitData = {
      ...data,
      logo_url: data.logo_url || undefined,
      description: data.description || undefined,
    };

    if (isEditing) {
      onSubmit({ id: channel.id, ...submitData } as UpdateMarketplaceChannelData);
    } else {
      onSubmit(submitData as CreateMarketplaceChannelData);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início e fim
  };

  const handleNameChange = (value: string) => {
    form.setValue('name', value);
    if (!isEditing || form.getValues('slug') === generateSlug(channel?.name || '')) {
      form.setValue('slug', generateSlug(value));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Canal' : 'Novo Canal'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações do canal do marketplace.'
              : 'Adicione um novo canal de marketplace ao sistema.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Mercado Livre" 
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: mercado-livre" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador único usado em URLs (apenas letras minúsculas, números e hífens)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição do marketplace..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Logo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://exemplo.com/logo.png" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL da imagem do logo do marketplace
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <FormDescription>
                      Canal ativo e disponível no sistema
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}