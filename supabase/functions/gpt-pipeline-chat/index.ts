
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
    console.log('Iniciando GPT Pipeline chat...')
    
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
    const { message, gpt_id = 'gpt-4o', conversation_history = [] } = requestBody

    console.log('Dados recebidos:', { message: message?.substring(0, 100), gpt_id })

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      console.error('Chave OpenAI não configurada')
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please configure OPENAI_API_KEY environment variable.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Chamando GPT Pipeline...')

    // Construir mensagens com histórico
    const messages = [
      {
        role: 'system',
        content: `Você é o GPT Pipeline especializado em desenvolvimento de aplicações Pipeline Labs ERP.

CONTEXTO DA APLICAÇÃO:
- Pipeline Labs é um ERP completo com gestão de vendas, produtos, clientes, fornecedores, estoque, financeiro
- Usa React + TypeScript + Tailwind CSS + Supabase
- Sistema de permissões com super_admin, contratante e operador
- Arquitetura baseada em componentes modulares

SUAS RESPONSABILIDADES:
1. Analisar comandos do usuário e sugerir implementações
2. Explicar o que será feito antes de implementar
3. Propor melhorias e alternativas quando apropriado
4. Considerar impactos na arquitetura e segurança
5. Sempre responder em português

FORMATO DE RESPOSTA:
Sempre responda em JSON com esta estrutura:
{
  "analysis": "Análise detalhada do que foi solicitado",
  "suggestion": "Sugestão de implementação com justificativa",
  "code_changes": {
    "files": ["lista de arquivos que serão modificados"],
    "description": "Descrição das mudanças propostas"
  },
  "considerations": ["lista de considerações importantes"],
  "ready_to_implement": true/false
}

Se ready_to_implement for true, o usuário poderá aprovar e as mudanças serão aplicadas automaticamente.`
      },
      ...conversation_history,
      {
        role: 'user',
        content: message
      }
    ]

    // Chamar OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: gpt_id,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    console.log('Status da resposta OpenAI:', openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text().catch(() => 'Unknown error')
      console.error('Erro na API OpenAI:', errorText)
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${openaiResponse.status} - ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openaiData = await openaiResponse.json()
    console.log('Resposta recebida da OpenAI')

    const gptResponse = openaiData.choices?.[0]?.message?.content

    if (!gptResponse) {
      console.error('Nenhuma resposta gerada pelo GPT')
      return new Response(JSON.stringify({ error: 'No response generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Tentar fazer parse do JSON da resposta
    let parsedResponse
    try {
      // Extrair JSON se estiver em markdown
      const jsonMatch = gptResponse.match(/```json\s*\n([\s\S]*?)\n\s*```/) || 
                       gptResponse.match(/(\{[\s\S]*\})/)
      
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1])
      } else {
        parsedResponse = JSON.parse(gptResponse)
      }
    } catch (parseError) {
      console.log('Resposta não está em JSON, usando formato de texto:', parseError)
      parsedResponse = {
        analysis: gptResponse,
        suggestion: "Resposta em formato de texto livre",
        code_changes: {
          files: [],
          description: "Análise manual necessária"
        },
        considerations: ["Resposta não estruturada"],
        ready_to_implement: false
      }
    }

    // Salvar conversa no banco
    try {
      await supabaseClient
        .from('gpt_pipeline_conversations')
        .insert({
          user_id: user.id,
          company_id: profile?.company_id || null,
          message: message,
          response: parsedResponse,
          gpt_model: gpt_id,
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('Erro ao salvar conversa:', logError)
    }

    console.log('Processamento concluído com sucesso')

    return new Response(JSON.stringify({
      success: true,
      response: parsedResponse,
      raw_response: gptResponse,
      usage: openaiData.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Erro geral no GPT Pipeline:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
