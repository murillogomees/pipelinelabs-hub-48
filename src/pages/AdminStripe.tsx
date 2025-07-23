import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SuperAdminGuard } from "@/components/PermissionGuard";
import { StripeConfigDialog } from "@/components/Admin/Stripe/StripeConfigDialog";
import { BillingPlansManager } from "@/components/Admin/Stripe/BillingPlansManager";
import { useStripeConfig } from "@/hooks/useStripeConfig";
import { Settings, CreditCard, Package, Activity, Shield, AlertCircle, CheckCircle, Copy } from "lucide-react";

export default function AdminStripe() {
  const { config } = useStripeConfig();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <SuperAdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configurações Stripe</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Configure sistema de pagamentos e gerencie planos de cobrança
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={config?.is_active ? "default" : "secondary"}>
              {config?.is_active ? "Ativo" : "Inativo"}
            </Badge>
            {config && (
            <Badge variant={config.test_mode ? "outline" : "destructive"}>
              {config.test_mode ? "Teste" : "Produção"}
              </Badge>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {config?.is_active ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-2xl font-bold">
                    {config?.is_active ? "Ativo" : "Inativo"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Modo</p>
                  <p className="text-2xl font-bold">
                    {config?.test_mode ? "Teste" : "Produção"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Webhook</p>
                  <p className="text-2xl font-bold">
                    {config?.stripe_webhook_secret_encrypted ? "OK" : "Pendente"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Moeda</p>
                  <p className="text-2xl font-bold">
                    {config?.default_currency?.toUpperCase() || "BRL"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Logs de Cobrança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status da Integração</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {config?.is_active ? "Configurado" : "Não Configurado"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {config?.is_active 
                      ? "Stripe está ativo e funcional"
                      : "Configure as credenciais do Stripe"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Modo Operacional</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {config?.test_mode ? "Teste" : "Produção"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {config?.test_mode 
                      ? "Modo de desenvolvimento"
                      : "Processando pagamentos reais"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Webhook</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {config?.stripe_webhook_secret_encrypted ? "Configurado" : "Pendente"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {config?.stripe_webhook_secret_encrypted
                      ? "Recebendo eventos do Stripe"
                      : "Configure o webhook secret"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>URL do Webhook</CardTitle>
                <CardDescription>
                  Configure esta URL no painel do Stripe para receber eventos de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  https://ycqinuwrlhuxotypqlfh.supabase.co/functions/v1/stripe-webhook
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Eventos recomendados: customer.subscription.created, customer.subscription.updated, 
                  customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Stripe</CardTitle>
                <CardDescription>
                  Configure as credenciais e parâmetros de integração com o Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                {config?.is_active ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Publishable Key</p>
                       <p className="text-sm text-muted-foreground font-mono">
                         {config.stripe_publishable_key ? 
                           `${config.stripe_publishable_key.substring(0, 12)}...` : 
                           "Não configurado"
                         }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Webhook Secret</p>
                       <p className="text-sm text-muted-foreground">
                         {config.stripe_webhook_secret_encrypted ? "Configurado" : "Não configurado"}
                      </p>
                    </div>
                    <Button onClick={() => setConfigDialogOpen(true)}>
                      Editar Configuração
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Nenhuma configuração do Stripe encontrada
                    </p>
                    <Button onClick={() => setConfigDialogOpen(true)}>
                      Configurar Stripe
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <BillingPlansManager />
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Cobrança</CardTitle>
                <CardDescription>
                  Histórico de eventos e transações processadas pelo Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Funcionalidade em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <StripeConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
        />
      </div>
    </SuperAdminGuard>
  );
}