import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetricRequest {
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  environment?: string;
  metadata?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 405 
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: MetricRequest = await req.json();
    
    // Validate required fields
    if (!body.metric_name || typeof body.metric_value !== 'number') {
      return new Response(
        JSON.stringify({ error: 'metric_name and metric_value are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    console.log('Recording metric:', body.metric_name, body.metric_value);

    // Record the metric
    const { data, error } = await supabase.rpc('record_performance_metric', {
      p_metric_name: body.metric_name,
      p_metric_value: body.metric_value,
      p_metric_unit: body.metric_unit || 'count',
      p_environment: body.environment || Deno.env.get('ENVIRONMENT') || 'production'
    });

    if (error) {
      console.error('Failed to record metric:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to record metric', details: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Also log to console for immediate visibility
    console.log(`METRIC: ${body.metric_name}=${body.metric_value}${body.metric_unit || 'count'}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        metric_id: data,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Metrics function error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});