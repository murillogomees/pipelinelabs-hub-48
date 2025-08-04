import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheck {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  environment: string;
  services: {
    database: { status: string; response_time_ms?: number };
    auth: { status: string; response_time_ms?: number };
    functions: { status: string; response_time_ms?: number };
  };
  metrics: {
    database_size_mb: number;
    active_connections: number;
    uptime_hours: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting production health check...');

    const healthResult: HealthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: Deno.env.get('ENVIRONMENT') || 'production',
      services: {
        database: { status: 'unknown' },
        auth: { status: 'unknown' },
        functions: { status: 'unknown' }
      },
      metrics: {
        database_size_mb: 0,
        active_connections: 0,
        uptime_hours: 0
      }
    };

    // Test database connectivity
    const dbStart = Date.now();
    try {
      const { data, error } = await supabase.rpc('production_health_check');
      const dbTime = Date.now() - dbStart;
      
      if (error) {
        console.error('Database health check failed:', error);
        healthResult.services.database = { status: 'down', response_time_ms: dbTime };
        healthResult.status = 'down';
      } else {
        healthResult.services.database = { status: 'ok', response_time_ms: dbTime };
        healthResult.metrics = {
          database_size_mb: data.database_size_mb || 0,
          active_connections: data.active_connections || 0,
          uptime_hours: Math.round((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60))
        };
      }
    } catch (error) {
      console.error('Database connection failed:', error);
      healthResult.services.database = { status: 'down' };
      healthResult.status = 'down';
    }

    // Test auth service
    const authStart = Date.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      const authTime = Date.now() - authStart;
      
      healthResult.services.auth = { 
        status: error ? 'degraded' : 'ok', 
        response_time_ms: authTime 
      };
    } catch (error) {
      console.error('Auth service check failed:', error);
      healthResult.services.auth = { status: 'down' };
      if (healthResult.status !== 'down') {
        healthResult.status = 'degraded';
      }
    }

    // Test edge functions (self-test)
    healthResult.services.functions = { status: 'ok', response_time_ms: Date.now() - parseInt(req.headers.get('x-request-start') || '0') };

    // Determine overall status
    const serviceStatuses = Object.values(healthResult.services).map(s => s.status);
    if (serviceStatuses.includes('down')) {
      healthResult.status = 'down';
    } else if (serviceStatuses.includes('degraded')) {
      healthResult.status = 'degraded';
    }

    // Log metrics for monitoring
    try {
      await supabase.rpc('record_performance_metric', {
        p_metric_name: 'health_check_duration',
        p_metric_value: Date.now() - parseInt(req.headers.get('x-request-start') || Date.now().toString()),
        p_metric_unit: 'ms'
      });
    } catch (error) {
      console.warn('Failed to record performance metric:', error);
    }

    console.log('Health check completed:', healthResult.status);

    return new Response(
      JSON.stringify(healthResult),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        status: healthResult.status === 'ok' ? 200 : healthResult.status === 'degraded' ? 206 : 503
      }
    );

  } catch (error) {
    console.error('Health check failed with error:', error);
    
    const errorResponse = {
      status: 'down',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: Deno.env.get('ENVIRONMENT') || 'production'
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503
      }
    );
  }
});