import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

    // Get Stripe configuration
    const { data: stripeConfig, error: configError } = await supabaseClient
      .from("stripe_config")
      .select("*")
      .is("company_id", null)
      .eq("is_active", true)
      .single();

    if (configError || !stripeConfig) {
      throw new Error("Stripe configuration not found");
    }

    const stripe = new Stripe(stripeConfig.stripe_secret_key_encrypted, {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !stripeConfig.stripe_webhook_secret_encrypted) {
      throw new Error("Invalid webhook signature or webhook secret not configured");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeConfig.stripe_webhook_secret_encrypted
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log("Processing Stripe event:", event.type);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get billing plan from metadata or price
        const priceId = subscription.items.data[0]?.price.id;
        const { data: plan } = await supabaseClient
          .from("billing_plans")
          .select("*")
          .eq("stripe_price_id", priceId)
          .single();

        // Update company subscription
        await supabaseClient
          .from("company_subscriptions")
          .upsert({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer,
            billing_plan_id: plan?.id || null,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            metadata: subscription.metadata,
            updated_at: new Date().toISOString(),
          });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabaseClient
          .from("company_subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // Log successful payment
          await supabaseClient
            .from("billing_logs")
            .insert({
              event_type: "payment_succeeded",
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: "completed",
              metadata: {
                customer_id: invoice.customer,
                subscription_id: invoice.subscription,
              },
            });
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // Log failed payment
          await supabaseClient
            .from("billing_logs")
            .insert({
              event_type: "payment_failed",
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_due / 100,
              currency: invoice.currency,
              status: "failed",
              error_message: "Payment failed",
              metadata: {
                customer_id: invoice.customer,
                subscription_id: invoice.subscription,
              },
            });
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