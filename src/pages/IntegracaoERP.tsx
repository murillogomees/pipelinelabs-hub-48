
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import { StripeIntegration } from '@/components/Admin/Integrations/StripeIntegration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NFEIntegration } from '@/components/Admin/Integrations/NFEIntegration';

export default function IntegracaoERP() {
  const { isAdmin, canManagePlans } = usePermissions();

  if (!isAdmin && !canManagePlans) {
    return (
      <div className="container mx-auto py-8">
        <Helmet>
          <title>Integrações - Pipeline Labs</title>
        </Helmet>
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Integrações - Pipeline Labs</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrações</h1>
        <p className="text-gray-500">Configure integrações com outros sistemas</p>
      </div>

      <Tabs defaultValue="payment">
        <TabsList className="mb-6">
          <TabsTrigger value="payment">Pagamentos</TabsTrigger>
          <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
          <TabsTrigger value="erp">ERP</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payment">
          <div className="grid grid-cols-1 gap-6">
            <StripeIntegration />
          </div>
        </TabsContent>

        <TabsContent value="fiscal">
          <div className="grid grid-cols-1 gap-6">
            <NFEIntegration />
          </div>
        </TabsContent>
        
        <TabsContent value="erp">
          <Card>
            <CardHeader>
              <CardTitle>Integrações com ERP</CardTitle>
              <CardDescription>
                Configure integrações com sistemas ERP externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Em breve: integrações com sistemas como SAP, Totvs, e outros ERPs populares.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ecommerce">
          <Card>
            <CardHeader>
              <CardTitle>Integrações com E-commerce</CardTitle>
              <CardDescription>
                Configure integrações com plataformas de e-commerce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Em breve: integrações com Shopify, WooCommerce, Magento e outras plataformas.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
