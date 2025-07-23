import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { company_id } = await req.json();

    // Buscar configuração Stripe
    const { data: stripeConfig } = await supabaseClient
      .from("stripe_config")
      .select("*")
      .is("company_id", null)
      .eq("is_active", true)
      .single();

    if (!stripeConfig) {
      throw new Error("Stripe configuration not found");
    }

    // Buscar assinatura da empresa
    const { data: subscription } = await supabaseClient
      .from("company_subscriptions")
      .select("stripe_customer_id")
      .eq("company_id", company_id)
      .single();

    if (!subscription?.stripe_customer_id) {
      throw new Error("No active subscription found");
    }

    const stripe = new Stripe(stripeConfig.stripe_secret_key_encrypted, {
      apiVersion: "2023-10-16",
    });

    // Criar sessão do portal do cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${req.headers.get("origin")}/app/configuracoes`,
    });

    return new Response(
      JSON.stringify({ url: portalSession.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating portal session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});