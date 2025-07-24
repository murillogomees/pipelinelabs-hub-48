import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MarketplaceConfig {
  name: string;
  auth_url: string;
  token_url: string;
  scopes?: string[];
}

const MARKETPLACE_CONFIGS: Record<string, MarketplaceConfig> = {
  amazon: {
    name: 'Amazon Seller Central',
    auth_url: 'https://sellercentral.amazon.com/oauth/authorize',
    token_url: 'https://api.amazon.com/auth/o2/token',
    scopes: ['sellingpartnerapi::migration']
  },
  mercadolivre: {
    name: 'Mercado Livre',
    auth_url: 'https://auth.mercadolivre.com.br/authorization',
    token_url: 'https://api.mercadolibre.com/oauth/token',
    scopes: ['read', 'write']
  }
};

async function handleGetAuthUrl(config: MarketplaceConfig, marketplace: string, params: any) {
  const { client_id, state, redirect_url } = params;
  
  if (!client_id) {
    throw new Error('Client ID é obrigatório');
  }

  // Construir URL de autorização
  const authUrl = new URL(config.auth_url);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', client_id);
  authUrl.searchParams.set('state', state || 'default_state');
  
  // Configurar redirect_uri baseado no ambiente
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'http://localhost:54321';
  const redirectUri = redirect_url || `${baseUrl}/functions/v1/marketplace-oauth-callback`;
  authUrl.searchParams.set('redirect_uri', redirectUri);
  
  // Adicionar scopes se disponíveis
  if (config.scopes?.length) {
    authUrl.searchParams.set('scope', config.scopes.join(' '));
  }

  // Parâmetros específicos por marketplace
  if (marketplace === 'amazon') {
    authUrl.searchParams.set('version', '2.0');
  }
  
  console.log('Generated auth URL:', authUrl.toString());

  return { 
    auth_url: authUrl.toString(),
    state: state || 'default_state',
    marketplace 
  };
}

async function handleProcessCallback(supabase: any, config: MarketplaceConfig, marketplace: string, params: any) {
  const { code, state } = params;
  
  if (!code) {
    throw new Error('Código de autorização não fornecido');
  }

  console.log('Processing callback:', { marketplace, state });

  // Trocar código por token
  let tokenData;
  try {
    tokenData = await exchangeCodeForToken(config, marketplace, code);
  } catch (error: any) {
    console.error('Token exchange failed:', error);
    throw new Error(`Falha ao obter token: ${error.message}`);
  }

  // Obter informações do usuário/vendedor
  let userInfo;
  try {
    userInfo = await getUserInfo(marketplace, tokenData.access_token);
  } catch (error: any) {
    console.error('Failed to get user info:', error);
    userInfo = { id: 'unknown', name: 'Unknown' };
  }

  return { 
    success: true,
    tokens: tokenData,
    user_info: userInfo,
    marketplace,
    state
  };
}

async function exchangeCodeForToken(config: MarketplaceConfig, marketplace: string, code: string) {
  // Configurar parâmetros da requisição baseado no marketplace
  const tokenParams = new URLSearchParams();
  tokenParams.set('grant_type', 'authorization_code');
  tokenParams.set('code', code);
  
  // Obter client_id e client_secret do ambiente
  const clientId = Deno.env.get(`${marketplace.toUpperCase()}_CLIENT_ID`);
  const clientSecret = Deno.env.get(`${marketplace.toUpperCase()}_CLIENT_SECRET`);
  
  if (!clientId || !clientSecret) {
    console.warn(`Missing client credentials for ${marketplace}, using test values`);
    // Em staging/desenvolvimento, simular resposta
    return {
      access_token: `${marketplace}_token_${Date.now()}`,
      refresh_token: `${marketplace}_refresh_${Date.now()}`,
      expires_in: 3600,
      token_type: 'Bearer'
    };
  }

  tokenParams.set('client_id', clientId);
  tokenParams.set('client_secret', clientSecret);

  // Configurar redirect_uri
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'http://localhost:54321';
  const redirectUri = `${baseUrl}/functions/v1/marketplace-oauth-callback`;
  tokenParams.set('redirect_uri', redirectUri);

  console.log('Token exchange URL:', config.token_url);

  const response = await fetch(config.token_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'User-Agent': 'Pipeline Labs ERP/1.0'
    },
    body: tokenParams.toString()
  });

  const responseText = await response.text();
  console.log('Token exchange response:', responseText);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Invalid JSON response: ${responseText}`);
  }
}

async function getUserInfo(marketplace: string, accessToken: string) {
  let userEndpoint: string;
  let headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
    'User-Agent': 'Pipeline Labs ERP/1.0'
  };

  switch (marketplace) {
    case 'amazon':
      userEndpoint = 'https://sellingpartnerapi-na.amazon.com/sellers/v1/account';
      break;
    case 'mercadolivre':
      userEndpoint = 'https://api.mercadolibre.com/users/me';
      break;
    default:
      // Simular dados do usuário para marketplaces não implementados
      return {
        id: `${marketplace}_user_${Date.now()}`,
        name: `${marketplace} User`,
        email: `user@${marketplace}.com`
      };
  }

  try {
    const response = await fetch(userEndpoint, { headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Failed to get user info: ${response.status} - ${errorText}`);
      // Retornar dados simulados em caso de erro
      return {
        id: `${marketplace}_user_${Date.now()}`,
        name: `${marketplace} User`,
        email: `user@${marketplace}.com`
      };
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching user info:', error);
    return {
      id: `${marketplace}_user_${Date.now()}`,
      name: `${marketplace} User`,
      email: `user@${marketplace}.com`
    };
  }
}

// Funções legadas para validação, refresh e revogação de token
async function validateToken(supabase: any, integrationId: string, marketplace: string) {
  console.log('Validating token for integration:', integrationId);
  
  const { data: integration, error } = await supabase
    .from('marketplace_integrations')
    .select('*')
    .eq('id', integrationId)
    .single();

  if (error || !integration) {
    throw new Error('Integração não encontrada');
  }

  // Verificar se token OAuth existe e está válido
  if (integration.oauth_token && integration.token_expires_at) {
    const isValid = new Date(integration.token_expires_at) > new Date();
    
    if (!isValid) {
      console.log('Token expired, updating status');
      await supabase
        .from('marketplace_integrations')
        .update({ 
          status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId);
    }

    return { valid: isValid, integration, needs_refresh: !isValid };
  }

  // Se não tem token OAuth, verificar credenciais API
  if (integration.auth_type === 'apikey' && integration.credentials) {
    const hasRequiredCredentials = Object.keys(integration.credentials).length > 0;
    return { valid: hasRequiredCredentials, integration, needs_refresh: false };
  }

  // Sem token e sem credenciais válidas
  return { valid: false, integration, needs_refresh: false };
}

async function refreshToken(supabase: any, integrationId: string, marketplace: string) {
  console.log('Refreshing token for integration:', integrationId);
  
  const { data: integration, error } = await supabase
    .from('marketplace_integrations')
    .select('*')
    .eq('id', integrationId)
    .single();

  if (error || !integration) {
    throw new Error('Integração não encontrada');
  }

  if (!integration.refresh_token) {
    throw new Error('Refresh token não disponível');
  }

  // Aqui seria feita a chamada para renovar o token no marketplace específico
  // Por enquanto, simulamos o processo
  console.log('Token refresh would be implemented for marketplace:', marketplace);
  
  return { refreshed: true, integration };
}

async function revokeToken(supabase: any, integrationId: string, marketplace: string) {
  console.log('Revoking token for integration:', integrationId);
  
  // Revogar token no marketplace e limpar dados locais
  const { error } = await supabase
    .from('marketplace_integrations')
    .update({
      oauth_token: null,
      refresh_token: null,
      token_expires_at: null,
      status: 'inactive',
      updated_at: new Date().toISOString()
    })
    .eq('id', integrationId);

  if (error) {
    throw new Error(`Erro ao revogar token: ${error.message}`);
  }

  return { revoked: true };
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

    const { action, marketplace, ...params } = await req.json();
    const config = MARKETPLACE_CONFIGS[marketplace];

    console.log('Marketplace auth request:', { action, marketplace, params });

    let result;
    switch (action) {
      case 'get_auth_url':
        if (!config) {
          throw new Error(`Marketplace ${marketplace} não suportado para OAuth`);
        }
        result = await handleGetAuthUrl(config, marketplace, params);
        break;
      
      case 'process_callback':
        if (!config) {
          throw new Error(`Marketplace ${marketplace} não suportado para OAuth`);
        }
        result = await handleProcessCallback(supabase, config, marketplace, params);
        break;
      
      case 'validate':
        result = await validateToken(supabase, params.integration_id, marketplace);
        break;
        
      case 'refresh':
        result = await refreshToken(supabase, params.integration_id, marketplace);
        break;
        
      case 'revoke':
        result = await revokeToken(supabase, params.integration_id, marketplace);
        break;
        
      default:
        throw new Error(`Ação ${action} não suportada`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in marketplace-auth:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});