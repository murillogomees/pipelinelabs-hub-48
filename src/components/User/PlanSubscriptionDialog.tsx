
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Users, Calendar, CreditCard, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

interface PlanSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanSubscriptionDialog({ open, onOpenChange }: PlanSubscriptionDialogProps) {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { subscription, isTrialActive, trialDaysLeft, daysUntilRenewal } = useSubscription();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'trial':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Período de Teste</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expirado</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="text-orange-600"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getTrialStatus = () => {
    if (!isTrialActive || !subscription?.trial_end_date) return null;
    
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Período de Teste Ativo</p>
              <p className="text-sm text-orange-600">
                {trialDaysLeft > 0 
                  ? `${trialDaysLeft} dias restantes até ${formatDate(subscription.trial_end_date)}`
                  : 'Teste expira hoje!'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>Plano e Assinatura</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isSuperAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Super Administrador</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    <Crown className="w-3 h-3 mr-1" />Super Admin
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Você tem acesso completo a todas as funcionalidades do sistema como super administrador.
                </p>
              </CardContent>
            </Card>
          ) : subscription ? (
            <>
              {/* Trial Status */}
              {getTrialStatus()}

              {/* Current Plan Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {subscription.plans?.is_custom && <Crown className="w-4 h-4 text-yellow-500" />}
                      <span>Plano Atual</span>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome do Plano</p>
                      <p className="font-medium flex items-center space-x-2">
                        <span>{subscription.plans?.name || 'Plano Básico'}</span>
                        {subscription.plans?.is_whitelabel && 
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                            White Label
                          </Badge>
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Pago</p>
                      <p className="font-medium">
                        {subscription.price_paid ? formatCurrency(subscription.price_paid) : 
                         subscription.plans?.price ? formatCurrency(subscription.plans.price) : 'Gratuito'}
                      </p>
                    </div>
                  </div>

                  {subscription.subscription_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Número da Assinatura</p>
                      <p className="font-medium">{subscription.subscription_number}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Início</p>
                      <p className="font-medium">{formatDate(subscription.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {subscription.status === 'trial' ? 'Fim do Teste' : 'Próxima Cobrança'}
                      </p>
                      <p className="font-medium">
                        {subscription.trial_end_date 
                          ? formatDate(subscription.trial_end_date)
                          : subscription.end_date 
                          ? formatDate(subscription.end_date)
                          : 'Não definido'
                        }
                      </p>
                      {daysUntilRenewal > 0 && subscription.status === 'active' && (
                        <p className="text-xs text-muted-foreground">
                          {daysUntilRenewal} dias restantes
                        </p>
                      )}
                    </div>
                  </div>

                  {subscription.payment_method && (
                    <div>
                      <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                      <p className="font-medium flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>{subscription.payment_method}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Plan Features */}
              {subscription.plans?.features && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recursos Incluídos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(subscription.plans.features as string[]).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Plan Limits */}
              {subscription.plans && (
                <Card>
                  <CardHeader>
                    <CardTitle>Limites do Plano</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {subscription.plans.user_limit && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>Usuários</span>
                          </div>
                          <Badge variant="outline">
                            {subscription.plans.user_limit === -1 ? 'Ilimitado' : `${subscription.plans.user_limit} usuários`}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {isAdmin && (
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    Ver Todos os Planos
                  </Button>
                  {subscription.status === 'trial' ? (
                    <Button className="flex-1">
                      <Crown className="w-4 h-4 mr-2" />
                      Ativar Plano
                    </Button>
                  ) : (
                    <Button className="flex-1">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Fazer Upgrade
                    </Button>
                  )}
                </div>
              )}

              {!isAdmin && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Apenas administradores podem alterar o plano da empresa.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Nenhuma assinatura encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Parece que você ainda não tem um plano ativo.
              </p>
              {isAdmin && (
                <Button>
                  <Crown className="w-4 h-4 mr-2" />
                  Escolher Plano
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
