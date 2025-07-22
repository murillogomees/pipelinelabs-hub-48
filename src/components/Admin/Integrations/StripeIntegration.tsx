
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useStripeIntegration } from '@/hooks/useStripeIntegration';
import { usePermissions } from '@/hooks/usePermissions';
import { usePlans } from '@/hooks/usePlans';

export function StripeIntegration() {
  const { companyId, canManagePlans } = usePermissions();
  const [tab, setTab] = useState('config');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  
  const { 
    stripeSettings, 
    stripeMappings, 
    isLoading,
    saveStripeSettings, 
    syncStripeProducts,
    savePlanMapping,
    deletePlanMapping
  } = useStripeIntegration(companyId || undefined);
  
  const { plans } = usePlans();
  
  const [formData, setFormData] = useState({
    secretKey: '',
    publishableKey: '',
    webhookSecret: ''
  });

  useEffect(() => {
    if (stripeSettings) {
      setFormData({
        secretKey: stripeSettings.secretKey || '',
        publishableKey: stripeSettings.publishableKey || '',
        webhookSecret: stripeSettings.webhookSecret || ''
      });
    }
  }, [stripeSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = () => {
    saveStripeSettings.mutate(formData);
  };

  const handleSyncProducts = () => {
    syncStripeProducts();
  };

  const handleSaveMapping = () => {
    if (!selectedPlan || !selectedProduct) return;
    
    savePlanMapping.mutate({
      planId: selectedPlan,
      stripeProductId: selectedProduct,
      stripePriceId: selectedPrice || selectedProduct // Simplified for demo
    });
    
    // Reset selection
    setSelectedPlan('');
    setSelectedProduct('');
    setSelectedPrice('');
  };

  const handleDeleteMapping = (planId: string) => {
    if (window.confirm('Tem certeza que deseja remover este mapeamento?')) {
      deletePlanMapping.mutate(planId);
    }
  };

  // Get available products from settings
  const stripeProducts = Object.entries(stripeSettings?.products || {})
    .map(([id, product]: [string, any]) => ({
      id,
      name: product.name || id,
    }));

  if (!canManagePlans) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso restrito</AlertTitle>
        <AlertDescription>
          Você não tem permissão para gerenciar integrações com o Stripe.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Integração com Stripe</CardTitle>
        <CardDescription>
          Configure a integração com o Stripe para processar pagamentos de assinaturas e vincular planos aos produtos do Stripe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="config">Configuração API</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="mappings">Vinculação de Planos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secretKey">Chave Secreta (Secret Key)</Label>
                <Input
                  id="secretKey"
                  name="secretKey"
                  value={formData.secretKey}
                  onChange={handleInputChange}
                  placeholder="sk_test_..."
                  type="password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="publishableKey">Chave Publicável (Publishable Key)</Label>
                <Input
                  id="publishableKey"
                  name="publishableKey"
                  value={formData.publishableKey}
                  onChange={handleInputChange}
                  placeholder="pk_test_..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Segredo do Webhook (opcional)</Label>
                <Input
                  id="webhookSecret"
                  name="webhookSecret"
                  value={formData.webhookSecret}
                  onChange={handleInputChange}
                  placeholder="whsec_..."
                  type="password"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products">
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Sincronização de produtos</AlertTitle>
                <AlertDescription>
                  Sincronize os produtos do Stripe para vinculá-los aos planos do sistema.
                </AlertDescription>
              </Alert>
              
              {stripeProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID do Produto</TableHead>
                      <TableHead>Nome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stripeProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.id}</TableCell>
                        <TableCell>{product.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum produto sincronizado. Clique no botão abaixo para sincronizar.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="mappings">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plano</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans?.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stripeProduct">Produto Stripe</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {stripeProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button 
                    onClick={handleSaveMapping}
                    disabled={!selectedPlan || !selectedProduct}
                    className="w-full"
                  >
                    Vincular
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-2">Mapeamentos Atuais</h3>
                {stripeMappings && stripeMappings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plano</TableHead>
                        <TableHead>Produto Stripe</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {stripeMappings.map(mapping => (
                         <TableRow key={mapping.id}>
                           <TableCell>
                             {plans?.find(p => p.id === (mapping as any).plan_id)?.name || (mapping as any).plan_id}
                           </TableCell>
                           <TableCell className="font-mono text-sm">
                             {(mapping as any).stripe_product_id}
                           </TableCell>
                          <TableCell>
                             <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => handleDeleteMapping((mapping as any).plan_id)}
                             >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum mapeamento encontrado.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {tab === 'config' && (
          <Button onClick={handleSaveSettings} disabled={isLoading || saveStripeSettings.isPending}>
            Salvar Configurações
          </Button>
        )}
        
        {tab === 'products' && (
          <Button 
            onClick={handleSyncProducts} 
            disabled={isLoading || !stripeSettings?.secretKey}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar Produtos
          </Button>
        )}
        
        {tab === 'mappings' && (
          <div></div> // Empty div to maintain footer structure
        )}
      </CardFooter>
    </Card>
  );
}
