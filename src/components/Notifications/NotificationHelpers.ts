import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationParams {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  action_url?: string;
  action_label?: string;
  user_id?: string;
  expires_in_days?: number;
  send_email?: boolean;
  send_whatsapp?: boolean;
  metadata?: any;
}

/**
 * Helper para criar notificações do sistema
 */
export class NotificationHelpers {
  
  /**
   * Cria uma notificação genérica
   */
  static async createSystemNotification(params: CreateNotificationParams) {
    try {
      const expires_at = params.expires_in_days 
        ? new Date(Date.now() + params.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Se deve enviar por email/WhatsApp, usa a edge function
      if (params.send_email || params.send_whatsapp) {
        const { data, error } = await supabase.functions.invoke('send-notification', {
          body: {
            company_id: await this.getCurrentCompanyId(),
            user_id: params.user_id,
            title: params.title,
            message: params.message,
            type: params.type || 'info',
            category: params.category || 'system',
            priority: params.priority || 'medium',
            action_url: params.action_url,
            action_label: params.action_label,
            metadata: params.metadata || {},
            expires_at,
            send_email: params.send_email,
            send_whatsapp: params.send_whatsapp,
          }
        });

        if (error) throw error;
        return data;
      } else {
        // Apenas criar no banco local
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            company_id: await this.getCurrentCompanyId(),
            user_id: params.user_id || null,
            title: params.title,
            message: params.message,
            type: params.type || 'info',
            category: params.category || 'system',
            priority: params.priority || 'medium',
            action_url: params.action_url || null,
            action_label: params.action_label || null,
            metadata: params.metadata || {},
            expires_at,
            sent_via_email: false,
            sent_via_whatsapp: false,
            status: 'unread'
          });

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  /**
   * Notificação para vendas
   */
  static async createSaleNotification(saleData: any, type: 'created' | 'updated' | 'cancelled') {
    const messages = {
      created: {
        title: '🎉 Nova Venda Realizada',
        message: `Venda ${saleData.sale_number} no valor de R$ ${saleData.total_amount} foi criada com sucesso.`,
        type: 'success' as const
      },
      updated: {
        title: '📝 Venda Atualizada',
        message: `Venda ${saleData.sale_number} foi atualizada.`,
        type: 'info' as const
      },
      cancelled: {
        title: '❌ Venda Cancelada',
        message: `Venda ${saleData.sale_number} foi cancelada.`,
        type: 'warning' as const
      }
    };

    const config = messages[type];
    
    return this.createSystemNotification({
      title: config.title,
      message: config.message,
      type: config.type,
      category: 'vendas',
      priority: type === 'cancelled' ? 'high' : 'medium',
      action_url: `/app/vendas/${saleData.id}`,
      action_label: 'Ver Venda',
      metadata: { sale_id: saleData.id, sale_number: saleData.sale_number }
    });
  }

  /**
   * Notificação para estoque baixo
   */
  static async createLowStockNotification(productData: any) {
    return this.createSystemNotification({
      title: '⚠️ Estoque Baixo',
      message: `O produto "${productData.name}" está com estoque baixo (${productData.stock_quantity} unidades).`,
      type: 'warning',
      category: 'estoque',
      priority: 'high',
      action_url: `/app/produtos/${productData.id}`,
      action_label: 'Ver Produto',
      metadata: { product_id: productData.id, stock_quantity: productData.stock_quantity }
    });
  }

  /**
   * Notificação para produtos sem estoque
   */
  static async createOutOfStockNotification(productData: any) {
    return this.createSystemNotification({
      title: '🚫 Produto Sem Estoque',
      message: `O produto "${productData.name}" ficou sem estoque.`,
      type: 'error',
      category: 'estoque',
      priority: 'critical',
      action_url: `/app/produtos/${productData.id}`,
      action_label: 'Repor Estoque',
      metadata: { product_id: productData.id }
    });
  }

  /**
   * Notificação financeira
   */
  static async createFinanceNotification(data: any, type: 'payment_received' | 'payment_overdue' | 'expense_created') {
    const messages = {
      payment_received: {
        title: '💰 Pagamento Recebido',
        message: `Pagamento de R$ ${data.amount} foi recebido.`,
        type: 'success' as const,
        priority: 'medium' as const
      },
      payment_overdue: {
        title: '⏰ Pagamento Vencido',
        message: `Pagamento de R$ ${data.amount} está vencido há ${data.days_overdue} dias.`,
        type: 'error' as const,
        priority: 'high' as const
      },
      expense_created: {
        title: '💸 Nova Despesa',
        message: `Despesa "${data.description}" no valor de R$ ${data.amount} foi registrada.`,
        type: 'info' as const,
        priority: 'medium' as const
      }
    };

    const config = messages[type];
    
    return this.createSystemNotification({
      title: config.title,
      message: config.message,
      type: config.type,
      category: 'financeiro',
      priority: config.priority,
      action_url: `/app/financeiro`,
      action_label: 'Ver Finanças',
      metadata: data
    });
  }

  /**
   * Notificação para novos clientes
   */
  static async createCustomerNotification(customerData: any, type: 'created' | 'updated') {
    const messages = {
      created: {
        title: '👤 Novo Cliente Cadastrado',
        message: `Cliente "${customerData.name}" foi cadastrado com sucesso.`,
        type: 'success' as const
      },
      updated: {
        title: '📝 Cliente Atualizado',
        message: `Cliente "${customerData.name}" teve seus dados atualizados.`,
        type: 'info' as const
      }
    };

    const config = messages[type];
    
    return this.createSystemNotification({
      title: config.title,
      message: config.message,
      type: config.type,
      category: 'clientes',
      priority: 'low',
      action_url: `/app/clientes/${customerData.id}`,
      action_label: 'Ver Cliente',
      metadata: { customer_id: customerData.id, customer_name: customerData.name }
    });
  }

  /**
   * Notificação para produtos
   */
  static async createProductNotification(productData: any, type: 'created' | 'updated' | 'price_changed') {
    const messages = {
      created: {
        title: '📦 Novo Produto Cadastrado',
        message: `Produto "${productData.name}" foi cadastrado com sucesso.`,
        type: 'success' as const
      },
      updated: {
        title: '📝 Produto Atualizado',
        message: `Produto "${productData.name}" foi atualizado.`,
        type: 'info' as const
      },
      price_changed: {
        title: '💰 Preço Alterado',
        message: `Preço do produto "${productData.name}" foi alterado para R$ ${productData.price}.`,
        type: 'info' as const
      }
    };

    const config = messages[type];
    
    return this.createSystemNotification({
      title: config.title,
      message: config.message,
      type: config.type,
      category: 'produtos',
      priority: 'low',
      action_url: `/app/produtos/${productData.id}`,
      action_label: 'Ver Produto',
      metadata: { product_id: productData.id, product_name: productData.name }
    });
  }

  /**
   * Notificação de sistema
   */
  static async createSystemAlert(title: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    return this.createSystemNotification({
      title: `🔧 ${title}`,
      message,
      type: priority === 'critical' ? 'error' : 'warning',
      category: 'system',
      priority,
      expires_in_days: 7
    });
  }

  /**
   * Obter ID da empresa atual
   */
  private static async getCurrentCompanyId(): Promise<string> {
    const { data } = await supabase.rpc('get_user_company_id');
    return data;
  }
}

/**
 * Função simplificada para criar notificações do sistema
 */
export const createSystemNotification = (params: CreateNotificationParams) => {
  return NotificationHelpers.createSystemNotification(params);
};