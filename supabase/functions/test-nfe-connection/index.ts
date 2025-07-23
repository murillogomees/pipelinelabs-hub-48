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

    // Teste simples primeiro - apenas retornar sucesso para verificar se a edge function funciona
    console.log('Teste básico da edge function funcionando');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Edge function funcionando - teste básico",
        environment,
        test: true
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error(`Erro na edge function test-nfe-connection: ${error.message}`, error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});