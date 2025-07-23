import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { checkRateLimit, createRateLimitHeaders } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('Edge function iniciada');
  
  if (req.method === "OPTIONS") {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Método da requisição:', req.method);

  try {
    console.log('Tentando ler o body da requisição...');
    const body = await req.text();
    console.log('Body recebido:', body);
    
    if (!body) {
      throw new Error("Body da requisição está vazio");
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
      console.log('Body parseado:', parsedBody);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      throw new Error(`Erro ao fazer parse do JSON: ${parseError.message}`);
    }

    const { api_token, environment } = parsedBody;
    
    if (!api_token) {
      throw new Error("Token da API NFE.io é obrigatório");
    }

    console.log(`Dados recebidos - Environment: ${environment}, Token length: ${api_token.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Edge function funcionando perfeitamente",
        environment,
        tokenLength: api_token.length,
        test: true
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error(`Erro na edge function: ${error.message}`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});