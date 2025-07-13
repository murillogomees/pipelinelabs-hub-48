import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  user_id?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export async function createSystemNotification(data: CreateNotificationData) {
  try {
    // Buscar o company_id do usuário atual
    const { data: companyData } = await supabase.rpc('get_user_company_id');
    
    if (!companyData) {
      console.error('Não foi possível obter company_id para criar notificação');
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        company_id: companyData,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        user_id: data.user_id || null,
        action_url: data.action_url || null,
        metadata: data.metadata || {},
      });

    if (error) {
      console.error('Erro ao criar notificação:', error);
      return;
    }

    console.log('Notificação criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
}

// Funções helper para tipos específicos de notificação
export const NotificationHelpers = {
  // Notificações de vendas
  newSale: (customerName: string, amount: number) => 
    createSystemNotification({
      title: 'Nova venda realizada',
      message: `Venda para ${customerName} no valor de ${new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)}`,
      type: 'success',
      action_url: '/vendas'
    }),

  // Notificações de estoque
  lowStock: (productName: string, currentStock: number, minStock: number) =>
    createSystemNotification({
      title: 'Estoque baixo',
      message: `O produto "${productName}" está com estoque baixo (${currentStock} unidades). Mínimo: ${minStock}`,
      type: 'warning',
      action_url: '/produtos'
    }),

  // Notificações de sistema
  systemMaintenance: (date: string) =>
    createSystemNotification({
      title: 'Manutenção programada',
      message: `Manutenção do sistema programada para ${date}. O sistema pode ficar indisponível por alguns minutos.`,
      type: 'info'
    }),

  // Notificações de integração
  integrationError: (integrationName: string, error: string) =>
    createSystemNotification({
      title: 'Erro de integração',
      message: `Erro na integração com ${integrationName}: ${error}`,
      type: 'error',
      action_url: '/configuracoes/integracoes'
    }),

  integrationSuccess: (integrationName: string) =>
    createSystemNotification({
      title: 'Integração configurada',
      message: `A integração com ${integrationName} foi configurada com sucesso`,
      type: 'success',
      action_url: '/configuracoes/integracoes'
    }),

  // Notificações de produtos
  newProduct: (productName: string) =>
    createSystemNotification({
      title: 'Novo produto cadastrado',
      message: `O produto "${productName}" foi cadastrado com sucesso`,
      type: 'success',
      action_url: '/produtos'
    }),

  // Notificações financeiras
  paymentReceived: (customerName: string, amount: number) =>
    createSystemNotification({
      title: 'Pagamento recebido',
      message: `Pagamento de ${new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)} recebido de ${customerName}`,
      type: 'success',
      action_url: '/financeiro'
    }),

  paymentOverdue: (customerName: string, daysOverdue: number) =>
    createSystemNotification({
      title: 'Pagamento em atraso',
      message: `Pagamento de ${customerName} está ${daysOverdue} dias em atraso`,
      type: 'warning',
      action_url: '/financeiro'
    }),
};

// Função para criar notificações de boas-vindas
export async function createWelcomeNotifications() {
  await createSystemNotification({
    title: 'Bem-vindo ao Pipeline Labs!',
    message: 'Sua conta foi criada com sucesso. Explore todas as funcionalidades do nosso ERP.',
    type: 'success'
  });

  await createSystemNotification({
    title: 'Configure suas integrações',
    message: 'Para aproveitar ao máximo o sistema, configure suas integrações com marketplaces e outras ferramentas.',
    type: 'info',
    action_url: '/configuracoes/integracoes'
  });
}