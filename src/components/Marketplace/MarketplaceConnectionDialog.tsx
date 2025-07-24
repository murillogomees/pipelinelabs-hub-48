import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ExternalLink, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MARKETPLACE_CONFIGS, MarketplaceType } from './constants';
import { OAuthService } from '@/services/oauthService';
import { useToast } from '@/hooks/use-toast';

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
  editingIntegration?: any;
  selectedChannel?: string | null;
}

export const MarketplaceConnectionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  editingIntegration,
  selectedChannel
}: MarketplaceConnectionDialogProps) => {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>(
    selectedChannel || editingIntegration?.marketplace || ''
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketplace: selectedChannel || editingIntegration?.marketplace || '',
      auto_sync_enabled: true,
      sync_interval_minutes: 5,
      webhook_url: ''
    }
  });

  const handleSubmit = async (values: FormData) => {
    const config = MARKETPLACE_CONFIGS[selectedMarketplace as MarketplaceType];
    
    if (!config) {
      toast({
        title: "Erro",
        description: "Marketplace não encontrado",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsConnecting(true);
      const oauthService = OAuthService.getInstance();

      let result;
      if (config.auth_type === 'oauth') {
        // Fluxo OAuth com popup
        result = await oauthService.connectWithOAuth(values.marketplace, {
          auto_sync_enabled: values.auto_sync_enabled,
          sync_interval_minutes: values.sync_interval_minutes,
          webhook_url: values.webhook_url,
          credentials: values.credentials || {}
        });
      } else {
        // Fluxo com credenciais diretas
        result = await oauthService.connectWithCredentials(
          values.marketplace,
          values.credentials || {},
          {
            auto_sync_enabled: values.auto_sync_enabled,
            sync_interval_minutes: values.sync_interval_minutes,
            webhook_url: values.webhook_url
          }
        );
      }

      onSubmit({
        marketplace: values.marketplace,
        auth_type: config.auth_type,
        credentials: values.credentials || {},
        config: {
          auto_sync_enabled: values.auto_sync_enabled,
          sync_interval_minutes: values.sync_interval_minutes,
          webhook_url: values.webhook_url
        },
        integration_result: result
      });
    } catch (error: any) {
      toast({
        title: "Erro na conexão",
        description: error.message || "Não foi possível conectar ao marketplace",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMarketplaceChange = (marketplace: string) => {
    setSelectedMarketplace(marketplace);
    form.setValue('marketplace', marketplace);
  };

  const config = MARKETPLACE_CONFIGS[selectedMarketplace as MarketplaceType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conectar Marketplace</DialogTitle>
          <DialogDescription>
            Configure a conexão com um marketplace para sincronizar produtos e pedidos automaticamente.
          </DialogDescription>
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
                      {Object.entries(MARKETPLACE_CONFIGS).map(([key, marketplace]) => (
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
              <>
                {config.auth_type === 'oauth' && (
                  <Alert className="mb-4">
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Este marketplace usa autenticação OAuth. Clique em "Conectar" para abrir 
                      uma janela de autorização segura do {config.name}.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>Credenciais - {config.name}</span>
                      {config.auth_type === 'oauth' && (
                        <Badge variant="outline" className="text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          OAuth
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {config.auth_type === 'oauth' ? (
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>Configure as credenciais básicas que serão usadas durante o processo de autorização:</p>
                        {config.fields.filter(field => ['client_id', 'app_id'].includes(field.name)).map((field) => (
                          <div key={field.name}>
                            <FormLabel>{field.label}</FormLabel>
                            <Input
                              type={field.type}
                              placeholder={field.label}
                              autoComplete="off"
                              {...form.register(`credentials.${field.name}` as any)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      config.fields.map((field) => (
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
                          ) : (
                             <Input
                               type={field.type}
                               placeholder={field.label}
                               autoComplete={field.type === 'password' ? 'current-password' : 'off'}
                               {...form.register(`credentials.${field.name}` as any)}
                             />
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
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
                      <FormLabel>Intervalo (minutos)</FormLabel>
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
                      <FormLabel>Webhook URL (opcional)</FormLabel>
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
                disabled={isLoading || isConnecting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isConnecting}>
                {isConnecting ? 'Conectando...' : (config?.auth_type === 'oauth' ? 'Autorizar' : 'Conectar')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};