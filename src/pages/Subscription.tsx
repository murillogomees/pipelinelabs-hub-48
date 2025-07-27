
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useLandingPagePlans } from '@/hooks/useLandingPagePlans';

const Subscription = () => {
  const { profile } = useProfile();
  const { plans, isLoading } = useLandingPagePlans();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = profile?.stripe_customer_id ? 'Premium' : 'Free';

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Escolha seu Plano</h1>
        <p className="text-muted-foreground">
          Selecione o plano ideal para sua empresa
        </p>
      </div>

      {profile?.stripe_customer_id && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Check className="h-5 w-5" />
              Plano Ativo
            </CardTitle>
            <CardDescription className="text-green-600">
              Você já possui uma assinatura ativa
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Plano Gratuito */}
        <Card className={`relative ${currentPlan === 'Free' ? 'border-primary' : ''}`}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Zap className="h-5 w-5" />
              Gratuito
            </CardTitle>
            <CardDescription>Para começar</CardDescription>
            <div className="text-3xl font-bold">R$ 0</div>
            <div className="text-sm text-muted-foreground">/mês</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Dashboard básico</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Até 50 produtos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Relatórios básicos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Suporte por email</span>
              </li>
            </ul>
            {currentPlan === 'Free' && (
              <Badge className="w-full justify-center">Plano Atual</Badge>
            )}
          </CardContent>
        </Card>

        {/* Planos da API */}
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.name;
          const isPopular = plan.name === 'Premium';
          
          return (
            <Card key={plan.id} className={`relative ${isCurrentPlan ? 'border-primary' : ''}`}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.name === 'Premium' && <Star className="h-5 w-5" />}
                  {plan.name === 'Enterprise' && <Crown className="h-5 w-5" />}
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold">
                  R$ {plan.price}
                </div>
                <div className="text-sm text-muted-foreground">
                  /{plan.interval === 'month' ? 'mês' : 'ano'}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isCurrentPlan ? (
                  <Badge className="w-full justify-center">Plano Atual</Badge>
                ) : (
                  <Button className="w-full" disabled={!plan.stripe_price_id}>
                    Escolher Plano
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {profile?.stripe_customer_id && (
        <div className="text-center mt-8">
          <Button variant="outline">
            Gerenciar Assinatura
          </Button>
        </div>
      )}
    </div>
  );
};

export default Subscription;
