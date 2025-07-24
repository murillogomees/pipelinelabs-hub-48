import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CallbackRequest {
  integration_id: string;
  authorization_code: string;
  state: string;
}

// Configurações dos tokens dos marketplaces
const MARKETPLACE_TOKEN_CONFIGS = {
  mercadolivre: {
    token_url: 'https://api.mercadolibre.com/oauth/token',
    client_id: Deno.env.get('MERCADOLIVRE_CLIENT_ID'),
    client_secret: Deno.env.get('MERCADOLIVRE_CLIENT_SECRET')
  },
  shopee: {
    token_url: 'https://partner.shopeemobile.com/api/v2/auth/token/get',
    client_id: Deno.env.get('SHOPEE_CLIENT_ID'),
    client_secret: Deno.env.get('SHOPEE_CLIENT_SECRET')
  },
  amazon: {
    token_url: 'https://api.amazon.com/auth/o2/token',
    client_id: Deno.env.get('AMAZON_CLIENT_ID'),
    client_secret: Deno.env.get('AMAZON_CLIENT_SECRET')
  }
}

async function exchangeCodeForTokens(
  marketplace: string,
  authorizationCode: string,
  redirectUri: string
) {
  const config = MARKETPLACE_TOKEN_CONFIGS[marketplace as keyof typeof MARKETPLACE_TOKEN_CONFIGS];
  
  if (!config) {
    throw new Error(`Marketplace ${marketplace} não suportado`);
  }

  console.log(`Exchanging code for tokens: ${marketplace}`);

  const tokenPayload = {
    grant_type: 'authorization_code',
    client_id: config.client_id,
    client_secret: config.client_secret,
    code: authorizationCode,
    redirect_uri: redirectUri
  };

  const response = await fetch(config.token_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams(tokenPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Token exchange failed for ${marketplace}:`, errorText);
    throw new Error(`Falha ao obter tokens do ${marketplace}: ${response.status}`);
  }

  const tokenData = await response.json();
  console.log(`Tokens obtained for ${marketplace}:`, {
    has_access_token: !!tokenData.access_token,
    expires_in: tokenData.expires_in
  });

  return tokenData;
}

async function updateIntegrationWithTokens(
  supabase: any,
  integrationId: string,
  tokenData: any
) {
  console.log('Updating integration with OAuth tokens:', integrationId);

  const expiresAt = tokenData.expires_in 
    ? new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
    : null;

  // Usar a função RPC do banco para atualizar tokens
  const { data, error } = await supabase
    .rpc('process_oauth_callback', {
      p_integration_id: integrationId,
      p_access_token: tokenData.access_token,
      p_refresh_token: tokenData.refresh_token || null,
      p_expires_in: tokenData.expires_in || 3600
    });

  if (error) {
    console.error('Error updating integration tokens:', error);
    throw new Error(`Erro ao salvar tokens: ${error.message}`);
  }

  console.log('Integration updated successfully');
  return data;
}

async function setupIntegrationWebhooks(
  supabase: any,
  integrationId: string,
  marketplace: string,
  accessToken: string
) {
  console.log('Setting up webhooks for integration:', integrationId);

  // Criar webhook no banco
  const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/marketplace-webhook/${integrationId}`;
  
  const { data: webhookId, error } = await supabase
    .rpc('create_marketplace_webhook', {
      p_integration_id: integrationId,
      p_marketplace: marketplace,
      p_webhook_url: webhookUrl
    });

  if (error) {
    console.error('Error creating webhook:', error);
    throw new Error(`Erro ao criar webhook: ${error.message}`);
  }

  // Aqui registraríamos o webhook no marketplace específico
  // Por exemplo, para Mercado Livre:
  // await registerMercadoLivreWebhook(accessToken, webhookUrl);

  console.log('Webhooks configured successfully');
  return webhookId;
}

async function triggerInitialSync(
  supabase: any,
  integrationId: string
) {
  console.log('Triggering initial sync for integration:', integrationId);

  // Log de sincronização inicial
  const { data, error } = await supabase
    .rpc('log_marketplace_sync', {
      p_integration_id: integrationId,
      p_event_type: 'initial_sync',
      p_direction: 'import',
      p_status: 'pending',
      p_records_processed: 0,
      p_metadata: { 
        triggered_by: 'oauth_callback',
        triggered_at: new Date().toISOString()
      }
    });

  if (error) {
    console.error('Error logging initial sync:', error);
    // Não falhar por causa disso, apenas log
  }

  // Em implementação real, dispararia job de sincronização
  console.log('Initial sync scheduled');
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: CallbackRequest = await req.json();

    if (!requestData.integration_id || !requestData.authorization_code) {
      throw new Error('integration_id e authorization_code são obrigatórios');
    }

    console.log('OAuth callback request:', {
      integration_id: requestData.integration_id,
      has_code: !!requestData.authorization_code
    });

    // Buscar integração
    const { data: integration, error: integrationError } = await supabase
      .from('marketplace_integrations')
      .select('*')
      .eq('id', requestData.integration_id)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integração não encontrada');
    }

    // Trocar código por tokens
    const redirectUri = `${Deno.env.get('SITE_URL')}/oauth/callback`;
    const tokenData = await exchangeCodeForTokens(
      integration.marketplace,
      requestData.authorization_code,
      redirectUri
    );

    // Atualizar integração com tokens
    await updateIntegrationWithTokens(
      supabase,
      requestData.integration_id,
      tokenData
    );

    // Configurar webhooks
    await setupIntegrationWebhooks(
      supabase,
      requestData.integration_id,
      integration.marketplace,
      tokenData.access_token
    );

    // Disparar sincronização inicial
    await triggerInitialSync(
      supabase,
      requestData.integration_id
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OAuth callback processado com sucesso',
        integration_id: requestData.integration_id,
        status: 'active'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in marketplace-oauth-callback:', error);
    
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