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

  // Simular validação de token (implementação real dependeria do marketplace)
  const isValid = Date.now() < new Date(integration.token_expires_at || '2024-12-31').getTime();
  
  if (!isValid) {
    await supabase
      .from('marketplace_integrations')
      .update({ 
        status: 'error',
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId);
  }

  return { valid: isValid, integration };
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

    let result;
    switch (action) {
      case 'validate':
        result = await validateToken(supabase, integration_id, marketplace);
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