import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { sla_id } = await req.json()

    // Get user's company
    const { data: userCompany } = await supabaseClient
      .from('profile')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!userCompany) {
      return new Response(
        JSON.stringify({ error: 'User has no active company' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client IP and user agent
    const ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1'
    const user_agent = req.headers.get('user-agent') || 'Unknown'

    // Call the create_sla_acceptance function
    const { data, error } = await supabaseClient
      .rpc('create_sla_acceptance', {
        p_company_id: userCompany.company_id,
        p_sla_id: sla_id,
        p_ip_address: ip_address,
        p_user_agent: user_agent,
        p_sla_url: `https://pipelinelabs.app/sla`
      })

    if (error) {
      console.error('Error creating SLA acceptance:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, acceptance_id: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-sla-acceptance function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})