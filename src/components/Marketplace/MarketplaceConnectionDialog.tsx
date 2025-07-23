import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const marketplaceConfigs = {
  mercadolivre: {
    name: 'Mercado Livre',
    auth_type: 'oauth',
    fields: [
      { name: 'app_id', label: 'App ID', type: 'text' },
      { name: 'client_secret', label: 'Client Secret', type: 'password' },
      { name: 'refresh_token', label: 'Refresh Token', type: 'password' },
      { name: 'seller_id', label: 'Seller ID', type: 'text' }
    ]
  },
  shopee: {
    name: 'Shopee',
    auth_type: 'apikey',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
      { name: 'secret_key', label: 'Secret Key', type: 'password' },
      { name: 'shop_id', label: 'Shop ID', type: 'text' },
      { name: 'environment', label: 'Ambiente', type: 'select', options: ['sandbox', 'production'] }
    ]
  },
  amazon: {
    name: 'Amazon',
    auth_type: 'apikey',
    fields: [
      { name: 'access_key_id', label: 'Access Key ID', type: 'password' },
      { name: 'secret_access_key', label: 'Secret Access Key', type: 'password' },
      { name: 'marketplace_id', label: 'Marketplace ID', type: 'text' },
      { name: 'seller_id', label: 'Seller ID', type: 'text' }
    ]
  },
  magalu: {
    name: 'Magalu Marketplace',
    auth_type: 'apikey',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
      { name: 'store_id', label: 'Store ID', type: 'text' }
    ]
  },
  b2w: {
    name: 'B2W Marketplace',
    auth_type: 'apikey',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
      { name: 'seller_id', label: 'Seller ID', type: 'text' },
      { name: 'environment', label: 'Ambiente', type: 'select', options: ['sandbox', 'production'] }
    ]
  },
  bling: {
    name: 'Bling',
    auth_type: 'apikey',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
      { name: 'client_id', label: 'Client ID', type: 'text' }
    ]
  }
};

const formSchema = z.object({
  marketplace: z.string().min(1, 'Selecione um marketplace'),
  credentials: z.record(z.string()).optional(),
  auto_sync_enabled: z.boolean().default(true),
  sync_interval_minutes: z.number().min(1).default(5),
  webhook_url: z.string().url().optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface MarketplaceConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const MarketplaceConnectionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading
}: MarketplaceConnectionDialogProps) => {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketplace: '',
      auto_sync_enabled: true,
      sync_interval_minutes: 5,
      webhook_url: ''
    }
  });

  const handleSubmit = (values: FormData) => {
    const config = marketplaceConfigs[selectedMarketplace as keyof typeof marketplaceConfigs];
    
    onSubmit({
      marketplace: values.marketplace,
      auth_type: config?.auth_type || 'apikey',
      credentials: values.credentials || {},
      config: {
        auto_sync_enabled: values.auto_sync_enabled,
        sync_interval_minutes: values.sync_interval_minutes,
        webhook_url: values.webhook_url
      }
    });
  };

  const handleMarketplaceChange = (marketplace: string) => {
    setSelectedMarketplace(marketplace);
    form.setValue('marketplace', marketplace);
  };

  const config = marketplaceConfigs[selectedMarketplace as keyof typeof marketplaceConfigs];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conectar Marketplace</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="marketplace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marketplace</FormLabel>
                  <Select onValueChange={handleMarketplaceChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o marketplace" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(marketplaceConfigs).map(([key, marketplace]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <span>{marketplace.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {marketplace.auth_type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {config && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Credenciais - {config.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.fields.map((field) => (
                    <div key={field.name}>
                      <FormLabel>{field.label}</FormLabel>
                      {field.type === 'select' ? (
                        <Select 
                          onValueChange={(value) => 
                            form.setValue(`credentials.${field.name}` as any, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Selecione ${field.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'textarea' ? (
                        <Textarea
                          placeholder={field.label}
                          {...form.register(`credentials.${field.name}` as any)}
                        />
                      ) : (
                        <Input
                          type={field.type}
                          placeholder={field.label}
                          {...form.register(`credentials.${field.name}` as any)}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações de Sincronização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="sync_interval_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intervalo de Sincronização (minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webhook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Webhook (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="url" 
                          placeholder="https://seudominio.com/webhook"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

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
                {isLoading ? 'Conectando...' : 'Conectar Marketplace'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};