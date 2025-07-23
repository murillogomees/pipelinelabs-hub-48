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

    const stripe = new Stripe(stripeConfig.stripe_secret_key_encrypted, {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        stripeConfig.stripe_webhook_secret_encrypted
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("Processing Stripe event:", event.type);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata.company_id;
        const billingPlanId = subscription.metadata.billing_plan_id;

        if (companyId && billingPlanId) {
          await supabaseClient
            .from("company_subscriptions")
            .upsert({
              company_id: companyId,
              billing_plan_id: billingPlanId,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              metadata: { stripe_subscription: subscription },
            });

          // Log do evento
          await supabaseClient
            .from("billing_logs")
            .insert({
              company_id: companyId,
              event_type: event.type,
              status: "success",
              amount: subscription.items.data[0]?.price.unit_amount / 100,
              currency: subscription.currency,
              metadata: { subscription_id: subscription.id },
            });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata.company_id;

        if (companyId) {
          await supabaseClient
            .from("company_subscriptions")
            .update({
              status: "canceled",
              canceled_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);

          await supabaseClient
            .from("billing_logs")
            .insert({
              company_id: companyId,
              event_type: event.type,
              status: "success",
              metadata: { subscription_id: subscription.id },
            });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Buscar assinatura
          const { data: subscription } = await supabaseClient
            .from("company_subscriptions")
            .select("company_id")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (subscription) {
            await supabaseClient
              .from("billing_logs")
              .insert({
                company_id: subscription.company_id,
                event_type: event.type,
                status: "success",
                amount: invoice.amount_paid / 100,
                currency: invoice.currency,
                stripe_invoice_id: invoice.id,
                invoice_url: invoice.hosted_invoice_url,
                metadata: { invoice_id: invoice.id },
              });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const { data: subscription } = await supabaseClient
            .from("company_subscriptions")
            .select("company_id")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (subscription) {
            // Atualizar status da assinatura
            await supabaseClient
              .from("company_subscriptions")
              .update({ status: "past_due" })
              .eq("stripe_subscription_id", subscriptionId);

            await supabaseClient
              .from("billing_logs")
              .insert({
                company_id: subscription.company_id,
                event_type: event.type,
                status: "failed",
                amount: invoice.amount_due / 100,
                currency: invoice.currency,
                stripe_invoice_id: invoice.id,
                error_message: "Payment failed",
                metadata: { invoice_id: invoice.id },
              });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});