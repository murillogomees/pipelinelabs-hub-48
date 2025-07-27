
import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { Loader2, CreditCard, Check, X } from 'lucide-react';

const Subscription: React.FC = () => {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const hasActiveSubscription = profile?.stripe_customer_id;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assinatura</h1>
          <p className="text-muted-foreground">
            Gerencie sua assinatura e planos do Pipeline Labs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Status da Assinatura */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Status da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant={hasActiveSubscription ? "default" : "secondary"}>
                  {hasActiveSubscription ? "Ativa" : "Inativa"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {hasActiveSubscription
                    ? "Sua assinatura está ativa e funcionando normalmente"
                    : "Você precisa de uma assinatura ativa para usar o sistema"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Plano Básico */}
          <Card>
            <CardHeader>
              <CardTitle>Plano Básico</CardTitle>
              <CardDescription>
                Ideal para pequenos negócios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-2xl font-bold">
                  R$ 97<span className="text-sm font-normal">/mês</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Até 1.000 produtos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Emissão de NFe
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Controle de estoque
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Relatórios básicos
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Escolher Plano
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plano Pro */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Plano Pro
                <Badge>Recomendado</Badge>
              </CardTitle>
              <CardDescription>
                Para negócios em crescimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-2xl font-bold">
                  R$ 197<span className="text-sm font-normal">/mês</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Produtos ilimitados
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Todas as funcionalidades
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Integrações avançadas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Suporte prioritário
                  </li>
                </ul>
                <Button className="w-full">
                  Escolher Plano
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plano Enterprise */}
          <Card>
            <CardHeader>
              <CardTitle>Plano Enterprise</CardTitle>
              <CardDescription>
                Para grandes empresas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-2xl font-bold">
                  Personalizado
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Solução personalizada
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Múltiplas empresas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    API dedicada
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Suporte 24/7
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Entrar em Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações de Pagamento */}
        {hasActiveSubscription && (
          <Card>
            <CardHeader>
              <CardTitle>Informações de Pagamento</CardTitle>
              <CardDescription>
                Gerencie seus métodos de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Método de pagamento:</span>
                  <span className="text-sm text-muted-foreground">
                    •••• •••• •••• 1234
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Próxima cobrança:</span>
                  <span className="text-sm text-muted-foreground">
                    15 de Fevereiro, 2024
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Alterar Método
                  </Button>
                  <Button size="sm" variant="outline">
                    Cancelar Assinatura
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Subscription;
