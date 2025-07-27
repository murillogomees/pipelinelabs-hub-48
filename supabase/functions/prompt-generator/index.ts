
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

    // Prompt do sistema aprimorado
    const systemPrompt = `Você é um desenvolvedor sênior especialista em React, TypeScript, Tailwind CSS e Supabase, trabalhando no Pipeline Labs - um sistema ERP completo para pequenos empreendedores.

CONTEXTO DO PROJETO:
- Sistema ERP com foco em vendas, produtos, clientes, estoque, financeiro, NFe, integrações
- Stack: React + TypeScript + Tailwind CSS + Supabase + Tanstack Query
- Arquitetura: Components modulares, hooks customizados, tipos TypeScript bem definidos
- Padrões: Shadcn/UI, RLS policies, audit logs, tratamento de erros robusto

INSTRUÇÕES ESPECÍFICAS:
1. SEMPRE retorne um JSON válido com esta estrutura exata:
{
  "files": {
    "src/components/Example.tsx": "código completo aqui",
    "src/hooks/useExample.ts": "código completo aqui"
  },
  "sql": ["CREATE TABLE...", "ALTER TABLE..."],
  "description": "Descrição detalhada do que foi implementado"
}

2. REGRAS DE CÓDIGO:
- Use SEMPRE TypeScript com tipos explícitos
- Siga padrões do React moderno (hooks, functional components)
- Use Tailwind CSS para estilização (classes semânticas quando possível)
- Implemente tratamento de erros robusto
- Use Tanstack Query para operações de dados
- Implemente RLS policies para segurança
- Crie audit logs para operações críticas
- Use componentes do Shadcn/UI quando apropriado

3. ESTRUTURA DE ARQUIVOS:
- Components: src/components/[Feature]/[Component].tsx
- Hooks: src/hooks/use[Feature].ts
- Types: src/types/[feature].ts
- Utils: src/utils/[feature].ts
- Pages: src/pages/[Page].tsx

4. QUALIDADE DO CÓDIGO:
- Código COMPLETO e funcional, não apenas esqueletos
- Imports corretos e organizados
- Componentes bem estruturados com props tipadas
- Hooks customizados quando apropriado
- Validação de dados com Zod quando necessário
- Tratamento de estados de loading e erro
- Responsividade mobile-first

5. BANCO DE DADOS:
- Use PostgreSQL/Supabase
- Implemente RLS policies sempre
- Crie índices para performance
- Use foreign keys para integridade
- Mantenha consistência nos nomes

6. FUNCIONALIDADES ESPECÍFICAS:
- Sistema de permissões (super_admin, contratante, operador)
- Audit logs para rastreabilidade
- Validação de documentos (CPF/CNPJ)
- Integração com APIs externas quando necessário
- Sistema de notificações

IMPORTANTE:
- Seja específico e detalhado no código
- Não use placeholders ou comentários "// TODO"
- Implemente funcionalidades completas
- Teste mentalmente o fluxo antes de escrever
- Considere edge cases e validações
- Mantenha consistência com o padrão do projeto

Agora processe o prompt do usuário e retorne o JSON com o código completo e funcional.`;

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
            content: `Contexto: Você está trabalhando no Pipeline Labs ERP. 

Prompt do usuário: ${prompt}

Lembre-se:
- Retorne SEMPRE um JSON válido
- Implemente código COMPLETO e funcional
- Use as melhores práticas do React/TypeScript
- Considere segurança e performance
- Seja específico e detalhado`
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
      // Tentar extrair JSON do conteúdo com melhor regex
      const jsonMatch = generatedContent.match(/```json\s*\n([\s\S]*?)\n\s*```/) || 
                       generatedContent.match(/(\{[\s\S]*\})/)
      
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1])
      } else {
        parsedContent = JSON.parse(generatedContent)
      }

      // Validar estrutura do JSON
      if (!parsedContent.files || typeof parsedContent.files !== 'object') {
        throw new Error('Invalid JSON structure: missing or invalid files object')
      }

      // Garantir que sql seja um array
      if (!Array.isArray(parsedContent.sql)) {
        parsedContent.sql = parsedContent.sql ? [parsedContent.sql] : []
      }

      // Garantir que description existe
      if (!parsedContent.description) {
        parsedContent.description = "Código gerado com sucesso"
      }

    } catch (parseError) {
      console.log('Erro ao fazer parse do JSON:', parseError)
      
      // Tentar extrair apenas o conteúdo útil
      const cleanContent = generatedContent.replace(/```json\s*\n?/g, '').replace(/\n?\s*```/g, '')
      
      try {
        parsedContent = JSON.parse(cleanContent)
      } catch (secondParseError) {
        console.log('Segundo parse também falhou, usando estrutura padrão')
        parsedContent = {
          files: {},
          sql: [],
          description: "Erro ao processar resposta da IA. Conteúdo bruto disponível.",
          rawContent: generatedContent,
          parseError: parseError.message
        }
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
