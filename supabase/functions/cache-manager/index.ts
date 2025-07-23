import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Redis } from "https://esm.sh/@upstash/redis@1.35.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CacheRequest {
  action: 'get' | 'set' | 'delete' | 'invalidate' | 'stats' | 'flush';
  key?: string;
  value?: any;
  ttl?: number;
  pattern?: string;
}

let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!redis) {
    try {
      const url = Deno.env.get('UPSTASH_REDIS_REST_URL');
      const token = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');
      
      if (!url || !token) {
        console.warn('Redis credentials not configured');
        return null;
      }
      
      redis = new Redis({ url, token });
      console.log('Redis client initialized');
    } catch (error) {
      console.error('Error initializing Redis:', error);
      return null;
    }
  }
  return redis;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, key, value, ttl, pattern }: CacheRequest = await req.json();
    const redisClient = getRedisClient();

    // Se Redis não disponível, retornar erro
    if (!redisClient) {
      return new Response(
        JSON.stringify({ 
          error: 'Redis not available',
          message: 'Cache service temporarily unavailable'
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    let result: any = null;

    switch (action) {
      case 'get':
        if (!key) throw new Error('Key required for get operation');
        result = await redisClient.get(key);
        break;

      case 'set':
        if (!key || value === undefined) throw new Error('Key and value required for set operation');
        if (ttl) {
          await redisClient.setex(key, ttl, value);
        } else {
          await redisClient.set(key, value);
        }
        result = { success: true };
        break;

      case 'delete':
        if (!key) throw new Error('Key required for delete operation');
        result = await redisClient.del(key);
        break;

      case 'invalidate':
        if (!pattern) throw new Error('Pattern required for invalidate operation');
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
        result = { deleted: keys.length };
        break;

      case 'stats':
        const allKeys = await redisClient.keys('*');
        result = {
          totalKeys: allKeys.length,
          keys: allKeys.slice(0, 100), // Limitar para não sobrecarregar
          redisAvailable: true
        };
        break;

      case 'flush':
        await redisClient.flushall();
        result = { success: true };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Cache manager error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});