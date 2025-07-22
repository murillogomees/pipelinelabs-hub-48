
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stripe_secret_key } = await req.json();
    
    if (!stripe_secret_key) {
      throw new Error("Stripe secret key é obrigatório");
    }

    // This is a simplified version that just returns mock data
    // In production, you would use the Stripe SDK to fetch real data
    const mockProducts = [
      { id: "prod_basic", name: "Plano Básico", active: true },
      { id: "prod_premium", name: "Plano Premium", active: true },
      { id: "prod_enterprise", name: "Plano Enterprise", active: true }
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        products_synced: mockProducts.length,
        products: mockProducts 
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
