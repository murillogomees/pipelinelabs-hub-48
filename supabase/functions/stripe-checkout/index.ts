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
    // Criar cliente Supabase com service role
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

    const { billing_plan_id, company_id } = await req.json();

    // Buscar configuração Stripe global
    const { data: stripeConfig } = await supabaseClient
      .from("stripe_config")
      .select("*")
      .is("company_id", null)
      .eq("is_active", true)
      .single();

    if (!stripeConfig) {
      throw new Error("Stripe configuration not found");
    }

    // Buscar dados do plano
    const { data: plan } = await supabaseClient
      .from("billing_plans")
      .select("*")
      .eq("id", billing_plan_id)
      .single();

    if (!plan) {
      throw new Error("Plan not found");
    }

    // Buscar dados da empresa
    const { data: company } = await supabaseClient
      .from("companies")
      .select("*")
      .eq("id", company_id)
      .single();

    if (!company) {
      throw new Error("Company not found");
    }

    // Inicializar Stripe
    const stripe = new Stripe(stripeConfig.stripe_secret_key_encrypted, {
      apiVersion: "2023-10-16",
    });

    // Verificar se já existe customer Stripe
    let customerId = null;
    const existingCustomers = await stripe.customers.list({
      email: company.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      // Criar novo customer
      const customer = await stripe.customers.create({
        email: company.email,
        name: company.name,
        metadata: {
          company_id: company_id,
        },
      });
      customerId = customer.id;
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: stripeConfig.default_currency,
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100), // Converter para centavos
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/app/configuracoes?stripe_success=true`,
      cancel_url: `${req.headers.get("origin")}/app/configuracoes?stripe_canceled=true`,
      metadata: {
        company_id: company_id,
        billing_plan_id: billing_plan_id,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});