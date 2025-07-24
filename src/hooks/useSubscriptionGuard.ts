import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { useCompanySubscription } from '@/hooks/useCompanySubscription';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useBillingPlans } from '@/hooks/useBillingPlans';
import { usePermissions } from '@/hooks/usePermissions';

export const useSubscriptionGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const { data: currentCompany } = useCurrentCompany();
  const { subscription, isSubscriptionActive, isLoading: subscriptionLoading } = useCompanySubscription(currentCompany?.company_id || '');
  const { plans } = useBillingPlans();

  useEffect(() => {
    // Administradores têm acesso total - não precisam de empresa ou plano
    if (isAdmin || isSuperAdmin) {
      return;
    }

    // Só verificar se usuário está autenticado e não está na página de planos
    if (!user || !currentCompany || subscriptionLoading || location.pathname === '/planos') {
      return;
    }

    // Verificar se há planos gratuitos disponíveis
    const hasFreePlans = plans?.some(plan => plan.price === 0) || false;

    // Se não há planos gratuitos e não tem assinatura ativa, redirecionar para seleção de planos
    if (!hasFreePlans && !isSubscriptionActive) {
      navigate('/planos', { replace: true });
      return;
    }

    // Se tem planos gratuitos, verificar se tem alguma assinatura (ativa ou trial)
    if (hasFreePlans && !subscription) {
      navigate('/planos', { replace: true });
      return;
    }

    // Se usuário está tentando acessar rotas do app sem plano ativo e não há planos gratuitos
    if (location.pathname.startsWith('/app') && !hasFreePlans && !isSubscriptionActive) {
      navigate('/planos', { replace: true });
      return;
    }
  }, [user, currentCompany, subscription, isSubscriptionActive, subscriptionLoading, location.pathname, navigate, plans, isAdmin, isSuperAdmin]);

  return {
    subscription,
    isSubscriptionActive: isSubscriptionActive || isAdmin || isSuperAdmin,
    isLoading: subscriptionLoading,
    hasAccess: isSubscriptionActive || (plans?.some(plan => plan.price === 0) && subscription) || isAdmin || isSuperAdmin,
  };
};