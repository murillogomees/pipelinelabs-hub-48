import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthRequest {
  integration_id: string;
  marketplace: string;
  action: 'validate' | 'refresh' | 'revoke';
}

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

    const { integration_id, marketplace, action }: AuthRequest = await req.json();

    console.log('Marketplace auth request:', { integration_id, marketplace, action });

    let result;
    switch (action) {
      case 'validate':
        result = await validateToken(supabase, integration_id, marketplace);
        break;
      case 'refresh':
        result = await refreshToken(supabase, integration_id, marketplace);
        break;
      case 'revoke':
        result = await revokeToken(supabase, integration_id, marketplace);
        break;
      default:
        throw new Error('Ação não suportada');
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
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