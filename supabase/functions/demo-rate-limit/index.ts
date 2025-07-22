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

  // Apply rate limiting: 5 requests per minute for demo
  const rateLimitResponse = await checkRateLimit(req, {
    maxRequests: 5,
    windowMs: 60000,
    message: 'Rate limit demo: você fez muitas requisições. Tente novamente em 1 minuto.'
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { message } = await req.json();
    
    // Generate rate limit headers
    const key = req.headers.get('authorization') ? 
      `user:${req.headers.get('authorization')?.split('.')[1]}` : 
      `ip:${req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'}`;
    
    const rateLimitHeaders = createRateLimitHeaders(key, 5, 60000);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Demo processado: ${message || 'Sem mensagem'}`,
        timestamp: new Date().toISOString(),
        clientKey: key
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          ...rateLimitHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Demo error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});