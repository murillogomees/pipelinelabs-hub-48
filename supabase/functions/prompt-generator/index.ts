
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

    // Verificar se é super admin através do access_level
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

    console.log('Acesso de super admin confirmado')

    const requestBody = await req.json().catch(() => ({}))
    const { prompt, temperature = 0.7, model = 'gpt-4o-mini' } = requestBody

    console.log('Dados recebidos:', { prompt: prompt?.substring(0, 100), temperature, model })

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

    // Prompt do sistema melhorado
    const systemPrompt = `Você é um desenvolvedor sênior especialista em React, TypeScript, Tailwind CSS e Supabase.

INSTRUÇÕES ESPECÍFICAS:

1. **FORMATO DE RESPOSTA OBRIGATÓRIO:**
Retorne SEMPRE um JSON válido com esta estrutura:
{
  "files": {
    "src/components/Example.tsx": "código completo aqui",
    "src/hooks/useExample.ts": "código completo aqui"
  },
  "sql": ["CREATE TABLE...", "ALTER TABLE..."],
  "description": "Descrição do que foi implementado",
  "suggestions": [
    {
      "type": "improvement",
      "title": "Título da sugestão",
      "description": "Descrição detalhada"
    }
  ]
}

2. **REGRAS OBRIGATÓRIAS:**
- Use TypeScript com tipos explícitos
- Use Tailwind CSS para estilização
- Use React hooks modernos
- Implemente tratamento de erros
- Use Supabase para dados quando necessário
- Código COMPLETO e funcional, não esqueletos
- Siga as melhores práticas do React

3. **ANÁLISE DO PROMPT:**
Analise cuidadosamente o prompt do usuário e implemente EXATAMENTE o que foi solicitado.
Não adicione funcionalidades não solicitadas.
Foque em resolver o problema específico mencionado.

PROMPT DO USUÁRIO: ${prompt}

Implemente exatamente o que foi solicitado no prompt, sem adicionar funcionalidades extras.`;

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
            content: systemPrompt
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

    console.log('Conteúdo gerado:', generatedContent.substring(0, 200))

    let parsedContent
    try {
      // Tentar extrair JSON do conteúdo
      const jsonMatch = generatedContent.match(/```json\s*\n([\s\S]*?)\n\s*```/) || 
                       generatedContent.match(/(\{[\s\S]*\})/)
      
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1])
      } else {
        parsedContent = JSON.parse(generatedContent)
      }

      // Validar estrutura
      if (!parsedContent.files || typeof parsedContent.files !== 'object') {
        throw new Error('Invalid JSON structure: missing files object')
      }

      // Garantir campos obrigatórios
      if (!Array.isArray(parsedContent.sql)) {
        parsedContent.sql = []
      }
      if (!parsedContent.description) {
        parsedContent.description = "Código gerado com sucesso"
      }
      if (!Array.isArray(parsedContent.suggestions)) {
        parsedContent.suggestions = []
      }

    } catch (parseError) {
      console.log('Erro ao fazer parse do JSON:', parseError)
      parsedContent = {
        files: {},
        sql: [],
        description: "Erro ao processar resposta da IA",
        suggestions: [],
        rawContent: generatedContent,
        parseError: parseError.message
      }
    }

    // Salvar log no banco
    try {
      await supabaseClient
        .from('prompt_logs')
        .insert({
          user_id: user.id,
          company_id: profile?.company_id || null,
          prompt: prompt,
          generated_code: parsedContent,
          model_used: model,
          temperature: temperature,
          status: 'pending'
        })
    } catch (logError) {
      console.error('Erro ao salvar log:', logError)
    }

    console.log('Processamento concluído com sucesso')

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
