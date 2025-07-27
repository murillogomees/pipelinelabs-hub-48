
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
    console.log('Iniciando prompt-generator...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verificar se o usuário é super admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Erro de autenticação:', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Usuário autenticado:', user.id)

    const { data: userCompany } = await supabaseClient
      .from('user_companies')
      .select('user_type')
      .eq('user_id', user.id)
      .eq('user_type', 'super_admin')
      .eq('is_active', true)
      .single()

    if (!userCompany) {
      console.error('Acesso negado - não é super admin')
      return new Response(JSON.stringify({ error: 'Access denied. Super admin only.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Acesso de super admin confirmado')

    const requestBody = await req.json().catch(() => ({}))
    const { prompt, temperature = 0.7, model = 'gpt-4o-mini' } = requestBody

    console.log('Dados recebidos:', { prompt: prompt?.substring(0, 50), temperature, model })

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verificar se a chave da OpenAI está configurada
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

    console.log('Chamando OpenAI API...')

    // Chamar OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `Você é um desenvolvedor especialista em React, TypeScript, Tailwind CSS e Supabase. 
            Sua tarefa é gerar código baseado no prompt do usuário.
            
            Retorne SEMPRE um JSON com esta estrutura:
            {
              "files": {
                "path/to/file.tsx": "código aqui",
                "path/to/another.ts": "código aqui"
              },
              "sql": ["CREATE TABLE...", "ALTER TABLE..."],
              "description": "Descrição do que foi implementado"
            }
            
            Regras importantes:
            1. Use sempre TypeScript
            2. Siga padrões do React moderno (hooks, functional components)
            3. Use Tailwind CSS para estilização
            4. Para banco de dados, use Supabase/PostgreSQL
            5. Implemente RLS policies quando necessário
            6. Use o padrão de componentes existente no projeto
            7. Crie hooks customizados quando apropriado
            8. NÃO inclua imports desnecessários
            9. Mantenha código limpo e bem estruturado
            10. SEMPRE retorne um JSON válido`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: 4000,
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
    console.log('Dados recebidos da OpenAI:', openaiData)

    const generatedContent = openaiData.choices?.[0]?.message?.content

    if (!generatedContent) {
      console.error('Nenhum conteúdo gerado pela OpenAI')
      return new Response(JSON.stringify({ error: 'No content generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Conteúdo gerado:', generatedContent.substring(0, 100))

    let parsedContent
    try {
      // Tentar extrair JSON do conteúdo
      const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/) || 
                       generatedContent.match(/(\{[\s\S]*\})/)
      
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1])
      } else {
        parsedContent = JSON.parse(generatedContent)
      }
    } catch (parseError) {
      console.log('Erro ao fazer parse do JSON, usando estrutura padrão')
      parsedContent = {
        files: {},
        sql: [],
        description: "Código gerado (formato não estruturado)",
        rawContent: generatedContent
      }
    }

    console.log('Conteúdo processado com sucesso')

    return new Response(JSON.stringify({
      success: true,
      data: parsedContent,
      rawContent: generatedContent,
      usage: openaiData.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Erro geral no prompt-generator:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
