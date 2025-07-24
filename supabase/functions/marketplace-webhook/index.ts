import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  event: string;
  data: any;
  marketplace: string;
  timestamp: string;
}

async function processWebhookEvent(
  supabase: any,
  integration_id: string,
  payload: WebhookPayload
) {
  console.log('Processing webhook event:', {
    integration_id,
    event: payload.event,
    marketplace: payload.marketplace
  });

  // Atualizar última recepção de webhook
  const { error: updateError } = await supabase
    .from('marketplace_integrations')
    .update({
      last_webhook_received: new Date().toISOString(),
      webhook_status: 'active'
    })
    .eq('id', integration_id);

  if (updateError) {
    console.error('Error updating webhook status:', updateError);
  }

  // Log do evento de webhook
  const { error: logError } = await supabase
    .rpc('log_marketplace_sync', {
      p_integration_id: integration_id,
      p_event_type: payload.event,
      p_direction: 'inbound',
      p_status: 'success',
      p_records_processed: 1,
      p_metadata: {
        webhook_data: payload.data,
        processed_at: new Date().toISOString()
      }
    });

  if (logError) {
    console.error('Error logging webhook event:', logError);
  }

  // Processar diferentes tipos de eventos
  switch (payload.event) {
    case 'order.created':
    case 'order.updated':
      await processOrderEvent(supabase, integration_id, payload);
      break;
    
    case 'product.created':
    case 'product.updated':
      await processProductEvent(supabase, integration_id, payload);
      break;
    
    default:
      console.log('Unknown event type:', payload.event);
  }

  return { success: true };
}

async function processOrderEvent(
  supabase: any,
  integration_id: string,
  payload: WebhookPayload
) {
  console.log('Processing order event:', payload.event);
  
  // Em implementação real, aqui criaríamos/atualizaríamos pedidos
  // Por enquanto, apenas logamos o evento
  
  console.log('Order data:', payload.data);
  
  // Criar notificação para o usuário
  const { data: integration } = await supabase
    .from('marketplace_integrations')
    .select('company_id, marketplace')
    .eq('id', integration_id)
    .single();

  if (integration) {
    await supabase
      .from('notifications')
      .insert({
        company_id: integration.company_id,
        title: `Novo pedido ${payload.marketplace}`,
        message: `${payload.event === 'order.created' ? 'Novo pedido recebido' : 'Pedido atualizado'} via ${integration.marketplace}`,
        type: 'info',
        action_url: '/app/vendas',
        created_at: new Date().toISOString()
      });
  }
}

async function processProductEvent(
  supabase: any,
  integration_id: string,
  payload: WebhookPayload
) {
  console.log('Processing product event:', payload.event);
  
  // Em implementação real, aqui sincronizaríamos produtos
  console.log('Product data:', payload.data);
  
  // Criar notificação para o usuário
  const { data: integration } = await supabase
    .from('marketplace_integrations')
    .select('company_id, marketplace')
    .eq('id', integration_id)
    .single();

  if (integration) {
    await supabase
      .from('notifications')
      .insert({
        company_id: integration.company_id,
        title: `Produto ${payload.marketplace}`,
        message: `${payload.event === 'product.created' ? 'Novo produto' : 'Produto atualizado'} via ${integration.marketplace}`,
        type: 'info',
        action_url: '/app/produtos',
        created_at: new Date().toISOString()
      });
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extrair integration_id da URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const integration_id = pathSegments[pathSegments.length - 1];

    if (!integration_id || integration_id.length !== 36) {
      throw new Error('Integration ID inválido');
    }

    // Verificar se a integração existe
    const { data: integration, error: integrationError } = await supabase
      .from('marketplace_integrations')
      .select('id, marketplace, company_id, webhook_status')
      .eq('id', integration_id)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integração não encontrada');
    }

    console.log('Webhook received for integration:', integration_id);

    let payload: WebhookPayload;

    if (req.method === 'POST') {
      // Webhook real
      payload = await req.json();
    } else if (req.method === 'GET') {
      // Teste de webhook / verificação
      return new Response(
        JSON.stringify({
          success: true,
          integration_id: integration_id,
          marketplace: integration.marketplace,
          status: 'webhook_endpoint_active'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      throw new Error('Método não suportado');
    }

    // Processar evento do webhook
    const result = await processWebhookEvent(supabase, integration_id, payload);

    return new Response(
      JSON.stringify({
        success: true,
        integration_id: integration_id,
        event_processed: payload.event,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in marketplace-webhook:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});