import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ServiceCheck {
  name: string;
  status: 'ok' | 'partial' | 'down';
  responseTime?: number;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const services: ServiceCheck[] = [];

    // 1. Check Supabase Database
    try {
      const dbStart = Date.now();
      const { error } = await supabase.from('companies').select('id').limit(1);
      const dbTime = Date.now() - dbStart;
      
      services.push({
        name: 'supabase',
        status: error ? 'down' : 'ok',
        responseTime: dbTime,
        error: error?.message
      });
    } catch (error) {
      services.push({
        name: 'supabase',
        status: 'down',
        error: error.message
      });
    }

    // 2. Check Authentication
    try {
      const authStart = Date.now();
      const { data, error } = await supabase.auth.getUser();
      const authTime = Date.now() - authStart;
      
      services.push({
        name: 'auth',
        status: error && error.message !== 'No token' ? 'down' : 'ok',
        responseTime: authTime
      });
    } catch (error) {
      services.push({
        name: 'auth',
        status: 'down',
        error: error.message
      });
    }

    // 3. Check Storage
    try {
      const storageStart = Date.now();
      const { data, error } = await supabase.storage.listBuckets();
      const storageTime = Date.now() - storageStart;
      
      services.push({
        name: 'storage',
        status: error ? 'down' : 'ok',
        responseTime: storageTime,
        error: error?.message
      });
    } catch (error) {
      services.push({
        name: 'storage',
        status: 'down',
        error: error.message
      });
    }

    // 4. Check NFe.io API (if configured)
    const nfeToken = Deno.env.get('NFE_IO_API_TOKEN');
    if (nfeToken) {
      try {
        const nfeStart = Date.now();
        const response = await fetch('https://api.nfe.io/v1/companies', {
          headers: {
            'Authorization': `Bearer ${nfeToken}`,
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        });
        const nfeTime = Date.now() - nfeStart;
        
        services.push({
          name: 'nfe_io',
          status: response.ok ? 'ok' : 'partial',
          responseTime: nfeTime,
          error: response.ok ? undefined : `HTTP ${response.status}`
        });
      } catch (error) {
        services.push({
          name: 'nfe_io',
          status: 'down',
          error: error.message
        });
      }
    }

    // Determine overall status
    const hasDown = services.some(s => s.status === 'down');
    const hasPartial = services.some(s => s.status === 'partial');
    
    let overallStatus: 'ok' | 'partial' | 'down';
    if (hasDown) {
      overallStatus = 'down';
    } else if (hasPartial) {
      overallStatus = 'partial';
    } else {
      overallStatus = 'ok';
    }

    const totalTime = Date.now() - startTime;

    // Log health check results
    for (const service of services) {
      try {
        await supabase.rpc('log_health_check', {
          p_service_name: service.name,
          p_status: service.status,
          p_response_time_ms: service.responseTime || null,
          p_error_message: service.error || null,
          p_error_details: service.error ? { timestamp: new Date().toISOString() } : {}
        });
      } catch (error) {
        console.error(`Failed to log health check for ${service.name}:`, error);
      }
    }

    // Build services object
    const servicesObj = services.reduce((acc, service) => {
      acc[service.name] = {
        status: service.status,
        response_time_ms: service.responseTime,
        error: service.error
      };
      return acc;
    }, {} as Record<string, any>);

    const healthResponse = {
      status: overallStatus,
      uptime: null, // Uptime not available in Deno runtime
      services: servicesObj,
      timestamp: new Date().toISOString(),
      response_time_ms: totalTime
    };

    return new Response(
      JSON.stringify(healthResponse),
      {
        status: overallStatus === 'ok' ? 200 : overallStatus === 'partial' ? 206 : 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );

  } catch (error) {
    console.error('Health check failed:', error);
    
    return new Response(
      JSON.stringify({
        status: 'down',
        error: error.message,
        timestamp: new Date().toISOString(),
        services: {}
      }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});