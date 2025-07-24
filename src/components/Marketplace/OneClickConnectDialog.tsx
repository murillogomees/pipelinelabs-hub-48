import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceChannel } from '@/hooks/useMarketplaceChannels';
import { ShoppingCart, Key, Link, Shield, Zap, CheckCircle } from 'lucide-react';

const oauthSchema = z.object({
  integration_type: z.literal('oauth'),
  redirect_url: z.string().url().optional()
});

const apikeySchema = z.object({
  integration_type: z.literal('apikey'),
  credentials: z.record(z.string()).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Pelo menos uma credencial é obrigatória' }
  )
});

const formSchema = z.discriminatedUnion('integration_type', [oauthSchema, apikeySchema]);

type FormData = z.infer<typeof formSchema>;

interface OneClickConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: MarketplaceChannel | null;
  companyId: string;
  onConnect: (data: {
    marketplace: string;
    company_id: string;
    integration_type: 'oauth' | 'apikey';
    credentials?: Record<string, any>;
    redirect_url?: string;
  }) => void;
  isLoading?: boolean;
}

export const OneClickConnectDialog = ({
  open,
  onOpenChange,
  channel,
  companyId,
  onConnect,
  isLoading = false
}: OneClickConnectDialogProps) => {
  const [selectedType, setSelectedType] = useState<'oauth' | 'apikey'>('oauth');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      integration_type: 'oauth'
    }
  });

  const handleSubmit = (values: FormData) => {
    if (!channel) return;

    onConnect({
      marketplace: channel.name,
      company_id: companyId,
      integration_type: values.integration_type,
      credentials: values.integration_type === 'apikey' ? values.credentials : undefined,
      redirect_url: values.integration_type === 'oauth' ? values.redirect_url : undefined
    });
  };

  const handleTypeChange = (type: string) => {
    const newType = type as 'oauth' | 'apikey';
    setSelectedType(newType);
    form.setValue('integration_type', newType);
  };

  if (!channel) return null;

  const config = channel.config_schema;
  const hasOAuth = channel.oauth_config && Object.keys(channel.oauth_config).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              {channel.logo_url ? (
                <img 
                  src={channel.logo_url} 
                  alt={channel.display_name}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </div>
            Conectar {channel.display_name}
          </DialogTitle>
          <DialogDescription>
            Conecte sua conta e comece a sincronizar produtos e pedidos em segundos.
          </DialogDescription>
        </DialogHeader>

        {/* Benefícios da conexão */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-green-800 dark:text-green-200">
              <Zap className="w-4 h-4" />
              O que acontece após conectar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              <span>Webhooks configurados automaticamente</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              <span>Sincronização de produtos e pedidos em tempo real</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              <span>Credenciais armazenadas com criptografia segura</span>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Seleção do tipo de integração */}
            <Tabs value={selectedType} onValueChange={handleTypeChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="oauth" disabled={!hasOAuth}>
                  <Link className="w-4 h-4 mr-2" />
                  OAuth (Recomendado)
                </TabsTrigger>
                <TabsTrigger value="apikey">
                  <Key className="w-4 h-4 mr-2" />
                  API Key
                </TabsTrigger>
              </TabsList>

              <TabsContent value="oauth" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      Conexão Segura via OAuth
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Mais seguro:</strong> Você será redirecionado para a autenticação oficial do {channel.display_name}. 
                        Suas credenciais nunca passam pelo nosso sistema.
                      </p>
                    </div>

                    {hasOAuth && (
                      <FormField
                        control={form.control}
                        name="redirect_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL de Retorno (opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="url" 
                                placeholder={`${window.location.origin}/app/admin/marketplace-channels`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="apikey" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Credenciais - {channel.display_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {config?.fields?.map((field: any) => (
                      <div key={field.name}>
                        <FormLabel>{field.label}</FormLabel>
                        <Input
                          type={field.type === 'password' ? 'password' : 'text'}
                          placeholder={field.label}
                          {...form.register(`credentials.${field.name}` as any)}
                        />
                      </div>
                    ))}

                    <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Segurança:</strong> Suas credenciais serão criptografadas automaticamente 
                        antes de serem armazenadas no banco de dados.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Conectar Agora
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};