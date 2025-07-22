
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  default_price?: string;
  prices?: {
    id: string;
    unit_amount: number;
    currency: string;
    recurring?: {
      interval: string;
      interval_count: number;
    };
  }[];
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get the request body
    const requestData = await req.json();
    const stripeSecretKey = requestData.stripe_secret_key;

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe Secret Key is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Fetch all products
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
      limit: 100,
    });

    // Enhance products with prices
    const enhancedProducts: ProductResponse[] = [];
    
    for (const product of products.data) {
      // Get prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 5,
      });
      
      enhancedProducts.push({
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        active: product.active,
        default_price: typeof product.default_price === 'object' ? product.default_price.id : product.default_price,
        prices: prices.data.map(price => ({
          id: price.id,
          unit_amount: price.unit_amount || 0,
          currency: price.currency,
          recurring: price.recurring ? {
            interval: price.recurring.interval,
            interval_count: price.recurring.interval_count,
          } : undefined,
        })),
      });
    }

    // Return the products
    return new Response(
      JSON.stringify({
        products: enhancedProducts,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
