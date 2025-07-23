import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompanySubscription } from "@/hooks/useCompanySubscription";
import { useBillingPlans } from "@/hooks/useBillingPlans";
import { formatCurrency } from "@/lib/utils";
import { Calendar, CreditCard, Users, Crown, ExternalLink } from "lucide-react";

interface SubscriptionCardProps {
  companyId: string;
}

export function SubscriptionCard({ companyId }: SubscriptionCardProps) {
  const { 
    subscription, 
    isLoading, 
    createCheckout, 
    openPortal, 
    isTrialActive, 
    isSubscriptionActive,
    daysUntilRenewal 
  } = useCompanySubscription(companyId);
  
  const { plans } = useBillingPlans();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>Carregando assinatura...</div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (isTrialActive) {
      return <Badge variant="outline">Período de Teste</Badge>;
    }
    if (isSubscriptionActive) {
      return <Badge variant="default">Ativa</Badge>;
    }
    return <Badge variant="secondary">Inativa</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Assinatura Atual
              </CardTitle>
              <CardDescription>
                Gerencie seu plano e pagamentos
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {subscription.billing_plan?.name || "Plano Personalizado"}
                </h3>
                <p className="text-muted-foreground">
                  {subscription.billing_plan?.description}
                </p>
              </div>

              {subscription.billing_plan && (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {formatCurrency(subscription.billing_plan.price)}
                  </span>
                  <span className="text-muted-foreground">
                    /{subscription.billing_plan.interval === "month" ? "mês" : "ano"}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Próxima cobrança</p>
                    <p className="font-medium">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Usuários</p>
                    <p className="font-medium">Conforme plano</p>
                  </div>
                </div>
              </div>

              {subscription.billing_plan?.features && (
                <div>
                  <p className="font-medium mb-2">Funcionalidades incluídas:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {subscription.billing_plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isTrialActive && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">
                    Período de teste ativo
                  </p>
                  <p className="text-sm text-blue-700">
                    Seu teste termina em {formatDate(subscription.trial_end)}
                  </p>
                </div>
              )}

              {isSubscriptionActive && daysUntilRenewal && daysUntilRenewal <= 7 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-900">
                    Renovação próxima
                  </p>
                  <p className="text-sm text-yellow-700">
                    Sua assinatura será renovada em {daysUntilRenewal} dias
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => openPortal()}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Gerenciar no Stripe
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhuma assinatura ativa</h3>
              <p className="text-muted-foreground mb-4">
                Escolha um plano para começar a usar o sistema
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!subscription && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(plan.price)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.interval === "month" ? "mês" : "ano"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Conforme especificação do plano
                  </div>

                  <div className="space-y-1">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feature}
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <div className="text-sm text-muted-foreground">
                        +{plan.features.length - 4} funcionalidades
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => createCheckout(plan.id)}
                  >
                    Escolher Plano
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}