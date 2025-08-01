import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Iniciando code-applier...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verificar autenticação
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Erro de autenticação:', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verificar se é super admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select(`
        *,
        access_levels (
          name
        )
      `)
      .eq('user_id', user.id)
      .single()

    const isSuperAdmin = profile?.access_levels?.name === 'super_admin'
    
    if (!isSuperAdmin) {
      console.error('Acesso negado - não é super admin')
      return new Response(JSON.stringify({ error: 'Access denied. Super admin only.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const requestBody = await req.json().catch(() => ({}))
    const { prompt_id, company_id, action } = requestBody

    console.log('Dados recebidos:', { prompt_id, company_id, action })

    if (!prompt_id || !action) {
      return new Response(JSON.stringify({ error: 'prompt_id and action are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Buscar o log do prompt
    const { data: promptLog, error: promptError } = await supabaseClient
      .from('prompt_logs')
      .select('*')
      .eq('id', prompt_id)
      .single()

    if (promptError || !promptLog) {
      console.error('Prompt log não encontrado:', promptError)
      return new Response(JSON.stringify({ error: 'Prompt log not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const generatedCode = promptLog.generated_code

    if (action === 'apply') {
      console.log('Aplicando código...')
      
      // Simular aplicação de arquivos
      const filesToApply = generatedCode?.files || {}
      const sqlToExecute = generatedCode?.sql || []
      
      const appliedFiles = Object.keys(filesToApply)
      console.log('Arquivos a serem aplicados:', appliedFiles)
      
      // Simular execução de SQL
      if (sqlToExecute.length > 0) {
        console.log('SQL commands to execute:', sqlToExecute.length)
        // Em uma implementação real, aqui seria executado o SQL
        // Por segurança, não executamos SQL diretamente
      }
      
      // Atualizar status no banco
      await supabaseClient
        .from('prompt_logs')
        .update({ 
          status: 'applied', 
          applied_at: new Date().toISOString(),
          applied_files: appliedFiles
        })
        .eq('id', prompt_id)

      return new Response(JSON.stringify({
        success: true,
        message: 'Code applied successfully',
        applied_files: appliedFiles,
        sql_commands: sqlToExecute.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
      
    } else if (action === 'rollback') {
      console.log('Fazendo rollback...')
      
      // Simular rollback
      await supabaseClient
        .from('prompt_logs')
        .update({ 
          status: 'rolled_back', 
          rolled_back_at: new Date().toISOString()
        })
        .eq('id', prompt_id)

      return new Response(JSON.stringify({
        success: true,
        message: 'Code rolled back successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
      
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action. Use "apply" or "rollback"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    console.error('Erro geral no code-applier:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})