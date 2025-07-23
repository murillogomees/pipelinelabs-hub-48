import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { checkRateLimit, createRateLimitHeaders } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Apply rate limiting: 20 requests per minute for connection tests
  const rateLimitResponse = await checkRateLimit(req, {
    maxRequests: 20,
    windowMs: 60000,
    message: 'Muitas tentativas de conexão. Tente novamente em alguns instantes.'
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { api_token, environment } = await req.json();
    
    if (!api_token) {
      throw new Error("Token da API NFE.io é obrigatório");
    }

    console.log(`Testando conexão NFE.io - Environment: ${environment}, Token: ${api_token.substring(0, 10)}...`);

    // URLs corretas conforme documentação NFE.io
    const baseUrl = environment === "prod" 
      ? "https://api.nfe.io/v1" 
      : "https://api.sandbox.nfe.io/v1";

    console.log(`URL base: ${baseUrl}`);

    // Testar conexão com NFE.io
    const response = await fetch(`${baseUrl}/companies`, {
      method: 'GET',
      headers: {
        "Authorization": `Token token=${api_token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Pipeline-Labs-ERP/1.0"
      },
      // Adicionar timeout
      signal: AbortSignal.timeout(30000)
    });

    console.log(`Resposta NFE.io: Status ${response.status}, Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na API NFE.io: ${response.status} - ${errorText}`);
      throw new Error(`Erro na conexão com NFE.io: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Dados recebidos: ${JSON.stringify(data)}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Conexão estabelecida com sucesso",
        environment,
        companies: data?.companies?.length || 0,
        data: data
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error(`Erro na edge function test-nfe-connection: ${error.message}`, error);
    
    // Verificar se é um erro de timeout
    if (error.name === 'TimeoutError') {
      return new Response(
        JSON.stringify({ 
          error: "Timeout na conexão com NFE.io. Verifique sua conexão de internet ou tente novamente." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 408 
        }
      );
    }

    // Verificar se é um erro de rede
    if (error.message.includes('error sending request')) {
      return new Response(
        JSON.stringify({ 
          error: "Erro de rede ao conectar com NFE.io. Verifique se o token está correto e se o serviço está disponível." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 503 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});