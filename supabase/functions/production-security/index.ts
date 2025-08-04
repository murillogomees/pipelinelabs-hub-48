import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityRequest {
  action: 'check_rate_limit' | 'log_security_event' | 'validate_csrf';
  identifier?: string;
  event_type?: string;
  risk_level?: string;
  token?: string;
  max_requests?: number;
  window_seconds?: number;
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

    const body: SecurityRequest = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log('Security action:', body.action, 'from IP:', clientIP);

    switch (body.action) {
      case 'check_rate_limit': {
        if (!body.identifier) {
          return new Response(
            JSON.stringify({ error: 'identifier is required for rate limit check' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 400 
            }
          );
        }

        const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
          p_identifier: body.identifier,
          p_max_requests: body.max_requests || 60,
          p_window_seconds: body.window_seconds || 60
        });

        if (error) {
          console.error('Rate limit check failed:', error);
          return new Response(
            JSON.stringify({ error: 'Rate limit check failed' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 500 
            }
          );
        }

        if (!allowed) {
          // Log rate limit violation
          try {
            await supabase.rpc('log_security_event', {
              p_event_type: 'rate_limit_exceeded',
              p_user_id: null,
              p_ip_address: clientIP,
              p_user_agent: userAgent,
              p_event_data: JSON.stringify({ identifier: body.identifier }),
              p_risk_level: 'medium'
            });
          } catch (logError) {
            console.warn('Failed to log rate limit violation:', logError);
          }
        }

        return new Response(
          JSON.stringify({ 
            allowed,
            timestamp: new Date().toISOString(),
            identifier: body.identifier
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: allowed ? 200 : 429
          }
        );
      }

      case 'log_security_event': {
        if (!body.event_type) {
          return new Response(
            JSON.stringify({ error: 'event_type is required' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 400 
            }
          );
        }

        const { error } = await supabase.rpc('log_security_event', {
          p_event_type: body.event_type,
          p_user_id: null,
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_event_data: JSON.stringify({ timestamp: new Date().toISOString() }),
          p_risk_level: body.risk_level || 'low'
        });

        if (error) {
          console.error('Failed to log security event:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to log security event' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 500 
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            event_type: body.event_type,
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }

      case 'validate_csrf': {
        if (!body.token) {
          return new Response(
            JSON.stringify({ error: 'token is required for CSRF validation' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 400 
            }
          );
        }

        // Note: CSRF validation would require user context
        // For now, return a basic validation
        const isValid = body.token.length >= 32; // Basic validation

        if (!isValid) {
          // Log invalid CSRF attempt
          try {
            await supabase.rpc('log_security_event', {
              p_event_type: 'invalid_csrf_token',
              p_user_id: null,
              p_ip_address: clientIP,
              p_user_agent: userAgent,
              p_event_data: JSON.stringify({ token_length: body.token.length }),
              p_risk_level: 'high'
            });
          } catch (logError) {
            console.warn('Failed to log CSRF violation:', logError);
          }
        }

        return new Response(
          JSON.stringify({ 
            valid: isValid,
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: isValid ? 200 : 403
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        );
    }

  } catch (error) {
    console.error('Security function error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});