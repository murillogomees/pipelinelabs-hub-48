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

    const baseUrl = environment === "prod" 
      ? "https://api.nfe.io/v1" 
      : "https://sandbox.nfe.io/v1";

    // Testar conexão com NFE.io
    const response = await fetch(`${baseUrl}/companies`, {
      headers: {
        "Authorization": `Token token=${api_token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na conexão: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Conexão estabelecida com sucesso",
        environment,
        companies: data?.companies?.length || 0
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});