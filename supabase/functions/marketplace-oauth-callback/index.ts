import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state');
    const marketplace = url.searchParams.get('marketplace') || 'unknown';

    console.log('OAuth callback received:', { code, error, state, marketplace });

    // Generate callback HTML that communicates with parent window
    const callbackHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Autorização ${marketplace}</title>
    <style>
        body { font-family: system-ui; padding: 40px; text-align: center; background: #667eea; color: white; }
        .container { background: rgba(255,255,255,0.1); padding: 40px; border-radius: 12px; max-width: 400px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        ${error ? `
            <h1>❌ Erro na Autorização</h1>
            <p>Erro: ${error}</p>
        ` : code ? `
            <h1>✅ Autorização Concluída</h1>
            <p>Processando...</p>
        ` : `
            <h1>❌ Autorização Cancelada</h1>
        `}
    </div>
    <script>
        if (window.opener) {
            window.opener.postMessage({
                type: 'OAUTH_CALLBACK',
                success: ${!!code && !error},
                code: '${code || ''}',
                error: '${error || ''}',
                state: '${state || ''}',
                marketplace: '${marketplace}'
            }, '*');
            setTimeout(() => window.close(), 2000);
        }
    </script>
</body>
</html>`;

    return new Response(callbackHtml, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return new Response('Error in OAuth callback', { status: 500, headers: corsHeaders });
  }
});