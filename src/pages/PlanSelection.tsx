import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Users, Zap, Shield, X } from 'lucide-react';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { useCompanySubscription } from '@/hooks/useCompanySubscription';
import { useBillingPlans } from '@/hooks/useBillingPlans';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';

export default function PlanSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: currentCompany } = useCurrentCompany();
  const { subscription, isSubscriptionActive, createCheckout, isCreatingCheckout } = useCompanySubscription(currentCompany?.company_id || '');
  const { plans, isLoading } = useBillingPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Verificar se usuário já tem plano ativo
  useEffect(() => {
    if (isSubscriptionActive && subscription?.status === 'active') {
      navigate('/app/dashboard');
    }
  }, [isSubscriptionActive, subscription, navigate]);

  const handleSelectPlan = async (planId: string) => {
    if (!currentCompany?.company_id) {
      toast({
        title: "Erro",
        description: "Empresa não encontrada. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPlanId(planId);
    
    try {
      await createCheckout(planId);
      toast({
        title: "Redirecionando para pagamento",
        description: "Você será redirecionado para finalizar a assinatura.",
      });
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setSelectedPlanId(null);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    );
  }

  const freePlans = plans?.filter(plan => plan.price === 0) || [];
  const hasFreePlans = freePlans.length > 0;

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
          {!hasFreePlans && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
              <div className="flex items-center space-x-2">
                <X className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  É necessário selecionar um plano para continuar
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans?.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                isPopularPlan(plan.name) 
                  ? 'border-2 border-primary shadow-lg scale-105' 
                  : 'border hover:border-gray-300'
              }`}
            >
              {isPopularPlan(plan.name) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Grátis' : formatCurrency(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-2">
                      /{plan.interval === 'month' ? 'mês' : 'ano'}
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Recursos do plano */}
                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Recursos incluídos:</h4>
                    <ul className="space-y-2">
                      {(plan.features as string[]).map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Limites do plano */}
                {plan.max_users && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">Usuários</span>
                    </div>
                    <Badge variant="outline">
                      {plan.max_users === -1 ? 'Ilimitado' : `${plan.max_users} usuários`}
                    </Badge>
                  </div>
                )}

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCreatingCheckout}
                  className={`w-full h-12 text-lg font-semibold ${
                    isPopularPlan(plan.name)
                      ? 'bg-primary hover:bg-primary/90'
                      : ''
                  }`}
                  size="lg"
                >
                  {selectedPlanId === plan.id && isCreatingCheckout ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processando...</span>
                    </div>
                  ) : plan.price === 0 ? (
                    'Começar Grátis'
                  ) : (
                    'Selecionar Plano'
                  )}
                </Button>
              </CardContent>
            </Card>
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