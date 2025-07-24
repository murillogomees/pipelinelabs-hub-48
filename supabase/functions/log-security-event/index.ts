import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createSecureResponse, securityMiddleware } from "../_shared/security-middleware.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Apply security middleware
    const securityResponse = await securityMiddleware(req, {
      requireAuth: false, // Allow anonymous security logging for some events
      rateLimit: { maxRequests: 100, windowMs: 60000 }, // Higher rate limit for logging
      logSecurityEvents: false // Prevent recursion
    });

    if (securityResponse) {
      return securityResponse;
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const body = await req.json();
    const {
      event_type,
      user_id,
      ip_address,
      user_agent,
      event_data = {},
      risk_level = 'low'
    } = body;

    // Validate required fields
    if (!event_type) {
      return createSecureResponse(
        { error: 'event_type is required' },
        400,
        corsHeaders
      );
    }

    // Get client IP if not provided
    const clientIP = ip_address || req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    // Get user agent if not provided
    const userAgent = user_agent || req.headers.get('user-agent') || 'unknown';

    // Get authenticated user if available
    let authenticatedUserId = user_id;
    if (!authenticatedUserId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        try {
          const { data: { user } } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
          );
          authenticatedUserId = user?.id;
        } catch (error) {
          // Continue without user ID if auth fails
          console.warn('Failed to get authenticated user:', error);
        }
      }
    }

    // Log the security event using the database function
    const { data, error } = await supabase.rpc('log_security_event', {
      p_event_type: event_type,
      p_user_id: authenticatedUserId,
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_event_data: event_data,
      p_risk_level: risk_level
    });

    if (error) {
      console.error('Failed to log security event:', error);
      return createSecureResponse(
        { error: 'Failed to log security event' },
        500,
        corsHeaders
      );
    }

    // For high/critical risk events, create alerts
    if (risk_level === 'high' || risk_level === 'critical') {
      try {
        await supabase.rpc('create_system_alert', {
          p_service_name: 'security_monitoring',
          p_error_message: `High risk security event: ${event_type}`,
          p_metadata: {
            event_type,
            user_id: authenticatedUserId,
            ip_address: clientIP,
            user_agent: userAgent,
            event_data,
            risk_level
          }
        });
      } catch (alertError) {
        console.error('Failed to create security alert:', alertError);
        // Continue execution even if alert creation fails
      }
    }

    return createSecureResponse(
      { 
        success: true,
        event_id: data,
        message: 'Security event logged successfully'
      },
      200,
      corsHeaders
    );

  } catch (error) {
    console.error('Error in log-security-event function:', error);
    
    return createSecureResponse(
      { error: 'Internal server error' },
      500,
      corsHeaders
    );
  }
});