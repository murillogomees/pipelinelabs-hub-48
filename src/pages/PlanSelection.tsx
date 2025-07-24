import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Users, Zap, Shield, X, RefreshCw } from 'lucide-react';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { useCompanySubscription } from '@/hooks/useCompanySubscription';
import { useBillingPlans } from '@/hooks/useBillingPlans';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanCard } from '@/components/PlanCard';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';

export default function PlanSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscriptionData, loading: subscriptionLoading, checkSubscription, openCustomerPortal } = useSubscription();
  const { plans, isLoading } = useBillingPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Verificar se usuário já tem plano ativo
  useEffect(() => {
    if (subscriptionData.subscribed) {
      // toast({
      //   title: "Você já tem um plano ativo",
      //   description: "Redirecionando para o dashboard...",
      // });
      // navigate('/app/dashboard');
    }
  }, [subscriptionData.subscribed, navigate]);

  const handleRefreshSubscription = async () => {
    await checkSubscription();
    toast({
      title: "Status atualizado",
      description: "Status da assinatura foi verificado.",
    });
  };

  const handleManageSubscription = async () => {
    await openCustomerPortal();
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('básico') || name.includes('basic') || name.includes('starter')) {
      return <Zap className="w-6 h-6 text-blue-600" />;
    }
    if (name.includes('premium') || name.includes('pro')) {
      return <Crown className="w-6 h-6 text-yellow-600" />;
    }
    if (name.includes('enterprise') || name.includes('empresarial')) {
      return <Shield className="w-6 h-6 text-purple-600" />;
    }
    return <Zap className="w-6 h-6 text-blue-600" />;
  };

  const isPopularPlan = (planName: string) => {
    return planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('pro');
  };

  if (isLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    );
  }

  // Mock plans for demonstration - you can configure these in your admin functions
  const mockPlans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 49,
      interval: 'month' as const,
      description: 'Ideal para pequenos negócios',
      features: [
        'Até 5 usuários',
        'Controle de vendas',
        'Estoque básico',
        'Relatórios simples',
        'Suporte por email'
      ],
      max_users: 5,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99,
      interval: 'month' as const,
      description: 'Para empresas em crescimento',
      features: [
        'Até 20 usuários',
        'Todas as funcionalidades básicas',
        'NFe integrada',
        'Relatórios avançados',
        'Integração com marketplaces',
        'Suporte prioritário'
      ],
      max_users: 20,
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      interval: 'month' as const,
      description: 'Solução completa para grandes empresas',
      features: [
        'Usuários ilimitados',
        'Todas as funcionalidades',
        'API personalizada',
        'Relatórios customizados',
        'Integrações avançadas',
        'Suporte 24/7',
        'Treinamento incluído'
      ],
      max_users: -1,
    },
  ];

  const displayPlans = plans && plans.length > 0 ? plans : mockPlans;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecione o plano ideal para sua empresa e comece a transformar sua gestão hoje mesmo.
          </p>

          {/* Status da assinatura atual */}
          {subscriptionData.subscribed && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-800 font-medium">
                    ✅ Plano Ativo: {subscriptionData.subscription_tier}
                  </p>
                  {subscriptionData.subscription_end && (
                    <p className="text-xs text-green-600">
                      Renovação: {new Date(subscriptionData.subscription_end).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshSubscription}
                    disabled={subscriptionLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${subscriptionLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                  >
                    Gerenciar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!subscriptionData.subscribed && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  💡 Selecione um plano para acessar todas as funcionalidades
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshSubscription}
                  disabled={subscriptionLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${subscriptionLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {displayPlans?.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              interval={plan.interval || 'month'}
              description={plan.description}
              features={plan.features as string[] || []}
              maxUsers={plan.max_users}
              isPopular={plan.isPopular || isPopularPlan(plan.name)}
              isCurrentPlan={subscriptionData.subscribed && subscriptionData.subscription_tier === plan.name}
            />
          ))}
        </div>

        {/* Informações adicionais */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Todos os planos incluem suporte técnico e atualizações automáticas
          </p>
          <p className="text-sm text-gray-500">
            Você pode alterar ou cancelar seu plano a qualquer momento
          </p>
        </div>
      </div>
    </div>
  );
}