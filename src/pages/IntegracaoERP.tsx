import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Eye, EyeOff, RefreshCw, Settings, DollarSign, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface IntegrationSettings {
  id?: string;
  stripe_secret_key?: string;
  stripe_products?: Record<string, string>;
  nfe_api_token?: string;
  nfe_environment?: 'dev' | 'prod';
  nfe_cnpj?: string;
  last_sync?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  stripe_product_id?: string;
}

export function IntegracaoERP() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [showNfeToken, setShowNfeToken] = useState(false);
  const [stripeSettings, setStripeSettings] = useState<IntegrationSettings>({});
  const [nfeSettings, setNfeSettings] = useState<IntegrationSettings>({});

  // Verificar se usuário é admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Acesso Negado</h3>
          <p className="text-muted-foreground">Apenas administradores podem acessar esta funcionalidade.</p>
        </div>
      </div>
    );
  }

  // Buscar configurações das integrações
  const { data: integrationSettings, isLoading } = useQuery({
    queryKey: ['integration-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Carregar dados quando recebidos
  useEffect(() => {
    if (integrationSettings) {
      setStripeSettings({
        stripe_secret_key: integrationSettings.stripe_secret_key || '',
        stripe_products: (typeof integrationSettings.stripe_products === 'object' && integrationSettings.stripe_products) 
          ? integrationSettings.stripe_products as Record<string, string>
          : {}
      });
      setNfeSettings({
        nfe_api_token: integrationSettings.nfe_api_token || '',
        nfe_environment: (integrationSettings.nfe_environment === 'prod' || integrationSettings.nfe_environment === 'dev') 
          ? integrationSettings.nfe_environment 
          : 'dev',
        nfe_cnpj: integrationSettings.nfe_cnpj || ''
      });
    }
  }, [integrationSettings]);

  // Buscar planos do sistema
  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true);
      
      if (error) throw error;
      return data as Plan[];
    }
  });

  // Salvar configurações
  const saveIntegrationSettings = useMutation({
    mutationFn: async (settings: Partial<IntegrationSettings>) => {
      const { data: userCompany } = await supabase.rpc('get_user_company_id');
      if (!userCompany) throw new Error('Empresa não encontrada');

      const { data, error } = await supabase
        .from('company_settings')
        .upsert({
          company_id: userCompany,
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'company_id'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
      toast({
        title: 'Configurações salvas',
        description: 'As configurações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Sincronizar com Stripe
  const syncStripe = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('sync-stripe-products', {
        body: { stripe_secret_key: stripeSettings.stripe_secret_key }
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
      toast({
        title: 'Sincronização concluída',
        description: `${data?.products_synced || 0} produtos sincronizados com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na sincronização',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Testar conexão NFE.io
  const testNfeConnection = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('test-nfe-connection', {
        body: { 
          api_token: nfeSettings.nfe_api_token,
          environment: nfeSettings.nfe_environment 
        }
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Conexão válida',
        description: 'A conexão com a NFE.io foi estabelecida com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na conexão',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSaveStripe = () => {
    saveIntegrationSettings.mutate({
      stripe_secret_key: stripeSettings.stripe_secret_key,
      stripe_products: stripeSettings.stripe_products
    });
  };

  const handleSaveNfe = () => {
    saveIntegrationSettings.mutate({
      nfe_api_token: nfeSettings.nfe_api_token,
      nfe_environment: nfeSettings.nfe_environment,
      nfe_cnpj: nfeSettings.nfe_cnpj
    });
  };

  const updatePlanStripeId = (planId: string, stripeProductId: string) => {
    const newProducts = { ...stripeSettings.stripe_products, [planId]: stripeProductId };
    setStripeSettings(prev => ({ ...prev, stripe_products: newProducts }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrações ERP</h1>
        <p className="text-muted-foreground">
          Configure as integrações técnicas do sistema com serviços externos
        </p>
      </div>

      <Tabs defaultValue="stripe" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stripe" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Stripe (Pagamentos)
          </TabsTrigger>
          <TabsTrigger value="nfe" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            NFE.io (Notas Fiscais)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stripe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Configuração Stripe
              </CardTitle>
              <CardDescription>
                Configure a integração com o Stripe para processamento de pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Token Secreto da Stripe (API Secret Key)</Label>
                <div className="relative">
                  <Input
                    id="stripe-key"
                    type={showStripeKey ? "text" : "password"}
                    placeholder="sk_live_..."
                    value={stripeSettings.stripe_secret_key || ''}
                    onChange={(e) => setStripeSettings(prev => ({
                      ...prev,
                      stripe_secret_key: e.target.value
                    }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowStripeKey(!showStripeKey)}
                  >
                    {showStripeKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Obtenha sua chave secreta no <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Dashboard do Stripe</a>
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveStripe} disabled={saveIntegrationSettings.isPending}>
                  {saveIntegrationSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Configuração
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => syncStripe.mutate()}
                  disabled={!stripeSettings.stripe_secret_key || syncStripe.isPending}
                >
                  {syncStripe.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar Planos
                </Button>
              </div>

              {integrationSettings?.updated_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Última atualização: {new Date(integrationSettings.updated_at).toLocaleString('pt-BR')}
                </div>
              )}
            </CardContent>
          </Card>

          {plans && plans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mapeamento de Planos</CardTitle>
                <CardDescription>
                  Associe os planos do ERP com os produtos correspondentes no Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          R$ {plan.price.toFixed(2)}/mês
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Código do Produto no Stripe"
                          className="w-64"
                          value={stripeSettings.stripe_products?.[plan.id] || ''}
                          onChange={(e) => updatePlanStripeId(plan.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="nfe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Configuração NFE.io
              </CardTitle>
              <CardDescription>
                Configure a integração com a NFE.io para emissão de notas fiscais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nfe-token">Token da API NFE.io</Label>
                <div className="relative">
                  <Input
                    id="nfe-token"
                    type={showNfeToken ? "text" : "password"}
                    placeholder="seu-token-da-api"
                    value={nfeSettings.nfe_api_token || ''}
                    onChange={(e) => setNfeSettings(prev => ({
                      ...prev,
                      nfe_api_token: e.target.value
                    }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNfeToken(!showNfeToken)}
                  >
                    {showNfeToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Obtenha seu token no <a href="https://app.nfe.io/docs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Painel da NFE.io</a>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Ambiente</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={nfeSettings.nfe_environment === 'prod'}
                      onCheckedChange={(checked) => setNfeSettings(prev => ({
                        ...prev,
                        nfe_environment: checked ? 'prod' : 'dev'
                      }))}
                    />
                    <div className="flex items-center gap-2">
                      {nfeSettings.nfe_environment === 'prod' ? (
                        <>
                          <Badge className="bg-green-100 text-green-800">
                            ✅ Produção
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Badge className="bg-orange-100 text-orange-800">
                            ⚠️ Desenvolvimento
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nfe-cnpj">CNPJ Padrão do Emissor (Opcional)</Label>
                <Input
                  id="nfe-cnpj"
                  placeholder="00.000.000/0000-00"
                  value={nfeSettings.nfe_cnpj || ''}
                  onChange={(e) => setNfeSettings(prev => ({
                    ...prev,
                    nfe_cnpj: e.target.value
                  }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveNfe} disabled={saveIntegrationSettings.isPending}>
                  {saveIntegrationSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Integração
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => testNfeConnection.mutate()}
                  disabled={!nfeSettings.nfe_api_token || testNfeConnection.isPending}
                >
                  {testNfeConnection.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Settings className="mr-2 h-4 w-4" />
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}