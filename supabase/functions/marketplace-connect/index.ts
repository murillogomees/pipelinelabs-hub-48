import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConnectRequest {
  marketplace: string;
  company_id: string;
  integration_type: 'oauth' | 'apikey';
  credentials?: Record<string, any>;
  redirect_url?: string;
}

// Configurações dos marketplaces
const MARKETPLACE_CONFIGS = {
  mercadolivre: {
    oauth_url: 'https://auth.mercadolibre.com.ar/authorization',
    token_url: 'https://api.mercadolibre.com/oauth/token',
    scopes: ['read', 'write'],
    webhook_events: ['orders', 'questions', 'claims', 'items']
  },
  shopee: {
    oauth_url: 'https://partner.shopeemobile.com/api/v2/shop/auth_partner',
    token_url: 'https://partner.shopeemobile.com/api/v2/auth/token/get',
    scopes: ['item.base', 'order.base'],
    webhook_events: ['order_status', 'item_promotion']
  },
  amazon: {
    oauth_url: 'https://sellercentral.amazon.com/apps/authorize/consent',
    token_url: 'https://api.amazon.com/auth/o2/token',
    scopes: ['selling_partner_api::orders', 'selling_partner_api::items'],
    webhook_events: ['ORDER_STATUS_CHANGE', 'ITEM_STATUS_CHANGE']
  }
}

async function createMarketplaceIntegration(
  supabase: any,
  request: ConnectRequest,
  user_id: string
) {
  console.log('Creating marketplace integration:', { marketplace: request.marketplace, company_id: request.company_id });
  
  // Criar integração no banco
  const { data: integration, error } = await supabase
    .from('marketplace_integrations')
    .insert({
      company_id: request.company_id,
      marketplace: request.marketplace,
      auth_type: request.integration_type,
      status: 'pending',
      credentials: request.credentials || {},
      config: {
        auto_sync_enabled: true,
        sync_interval_minutes: 5
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating integration:', error);
    throw new Error(`Erro ao criar integração: ${error.message}`);
  }

  console.log('Integration created:', integration.id);
  return integration;
}

async function setupWebhook(
  supabase: any,
  integration_id: string,
  marketplace: string,
  company_id: string
) {
  console.log('Setting up webhook for integration:', integration_id);
  
  const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/marketplace-webhook/${integration_id}`;
  
  // Criar webhook no banco usando a função SQL
  const { data: webhookId, error } = await supabase
    .rpc('create_marketplace_webhook', {
      p_integration_id: integration_id,
      p_marketplace: marketplace,
      p_webhook_url: webhookUrl
    });

  if (error) {
    console.error('Error creating webhook:', error);
    throw new Error(`Erro ao criar webhook: ${error.message}`);
  }

  console.log('Webhook created with ID:', webhookId);
  
  // Simular registro do webhook no marketplace (implementação real variaria por marketplace)
  await simulateWebhookRegistration(marketplace, webhookUrl, integration_id);
  
  return webhookId;
}

async function simulateWebhookRegistration(
  marketplace: string,
  webhookUrl: string,
  integration_id: string
) {
  console.log(`Simulating webhook registration for ${marketplace}`);
  
  // Em implementação real, aqui fariamos as chamadas API para cada marketplace
  // Por exemplo, para Mercado Livre:
  // POST https://api.mercadolibre.com/applications/{app_id}/webhooks
  
  // Para demonstração, apenas logamos
  console.log(`Webhook URL: ${webhookUrl}`);
  console.log(`Integration ID: ${integration_id}`);
  
  return true;
}

async function generateOAuthUrl(
  marketplace: string,
  integration_id: string,
  redirect_url: string
) {
  const config = MARKETPLACE_CONFIGS[marketplace as keyof typeof MARKETPLACE_CONFIGS];
  
  if (!config) {
    throw new Error(`Marketplace ${marketplace} não suportado`);
  }

  // Gerar estado para segurança OAuth
  const state = `${integration_id}_${Date.now()}`;
  
  // Construir URL de autorização
  const authUrl = new URL(config.oauth_url);
  authUrl.searchParams.set('client_id', Deno.env.get(`${marketplace.toUpperCase()}_CLIENT_ID`) || 'demo_client_id');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirect_url);
  authUrl.searchParams.set('scope', config.scopes.join(' '));
  authUrl.searchParams.set('state', state);

  return {
    auth_url: authUrl.toString(),
    state: state
  };
}

async function processApiKeyConnection(
  supabase: any,
  integration: any,
  credentials: Record<string, any>
) {
  console.log('Processing API key connection for integration:', integration.id);
  
  // Atualizar integração com status ativo
  const { error } = await supabase
    .from('marketplace_integrations')
    .update({
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', integration.id);

  if (error) {
    console.error('Error updating integration:', error);
    throw new Error(`Erro ao ativar integração: ${error.message}`);
  }

  // Configurar webhook
  await setupWebhook(supabase, integration.id, integration.marketplace, integration.company_id);

  // Iniciar primeira sincronização
  console.log('Starting initial sync...');
  // Em implementação real, aqui dispararíamos a sincronização inicial
  
  return {
    success: true,
    integration_id: integration.id,
    status: 'active',
    message: 'Integração configurada com sucesso!'
  };
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

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const requestData: ConnectRequest = await req.json();

    // Validar dados da requisição
    if (!requestData.marketplace || !requestData.company_id || !requestData.integration_type) {
      throw new Error('Dados obrigatórios: marketplace, company_id, integration_type');
    }

    console.log('Marketplace connect request:', {
      marketplace: requestData.marketplace,
      type: requestData.integration_type,
      user_id: user.id
    });

    // Criar integração
    const integration = await createMarketplaceIntegration(
      supabase,
      requestData,
      user.id
    );

    let response;

    if (requestData.integration_type === 'oauth') {
      // Fluxo OAuth
      const redirectUrl = requestData.redirect_url || `${Deno.env.get('SITE_URL')}/app/admin/marketplace-channels`;
      const oauthData = await generateOAuthUrl(
        requestData.marketplace,
        integration.id,
        redirectUrl
      );

      response = {
        success: true,
        type: 'oauth',
        auth_url: oauthData.auth_url,
        state: oauthData.state,
        integration_id: integration.id,
        message: 'Redirecionando para autenticação...'
      };

    } else {
      // Fluxo API Key
      response = await processApiKeyConnection(
        supabase,
        integration,
        requestData.credentials || {}
      );
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in marketplace-connect:', error);
    
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