
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
    const { prompt, temperature = 0.7, model = 'gpt-4o-mini', isRevision = false, originalCode = null } = requestBody

    console.log('Dados recebidos:', { prompt: prompt?.substring(0, 100), temperature, model, isRevision })

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

    // Contexto completo do projeto Pipeline Labs
    const projectContext = `
# PIPELINE LABS - CONTEXTO COMPLETO DO PROJETO

## 1. VISÃO GERAL DO PROJETO
- **Nome:** Pipeline Labs
- **Tipo:** Sistema ERP completo para pequenos empreendedores
- **Stack:** React + TypeScript + Tailwind CSS + Supabase + Tanstack Query
- **Arquitetura:** Componentes modulares, hooks customizados, tipos TypeScript bem definidos
- **Padrões:** Shadcn/UI, RLS policies, audit logs, tratamento de erros robusto

## 2. ESTRUTURA DE ARQUIVOS PRINCIPAIS
### Frontend (src/)
- **Components:** src/components/[Feature]/[Component].tsx
- **Hooks:** src/hooks/use[Feature].ts
- **Types:** src/types/[feature].ts
- **Utils:** src/utils/[feature].ts
- **Pages:** src/pages/[Page].tsx
- **Integrations:** src/integrations/supabase/

### Backend (Supabase)
- **Functions:** supabase/functions/[function-name]/index.ts
- **Migrations:** supabase/migrations/
- **Config:** supabase/config.toml

## 3. BANCO DE DADOS SUPABASE - TABELAS PRINCIPAIS
### Tabelas de Usuários e Empresas
- **companies:** id, name, document, email, address, city, state, zipcode, phone, legal_name, trade_name, tax_regime, etc.
- **user_companies:** user_id, company_id, user_type (super_admin, contratante, operador), permissions, is_active
- **profiles:** user_id, email, document, display_name, avatar_url, created_at, updated_at

### Tabelas de Negócio
- **products:** id, company_id, name, description, price, cost_price, stock_quantity, category, barcode, unit, etc.
- **customers:** id, company_id, name, document, email, phone, address, customer_type, is_active
- **suppliers:** id, company_id, name, document, email, phone, address, is_active
- **sales:** id, company_id, customer_id, sale_number, total_amount, status, sale_type, created_at
- **invoices:** id, company_id, customer_id, sale_id, invoice_number, invoice_type, status, total_amount
- **stock_movements:** id, company_id, product_id, movement_type, quantity, unit_cost, notes, created_by

### Tabelas Financeiras
- **financial_transactions:** id, company_id, type, description, amount, status, transaction_date, due_date, payment_date
- **accounts_receivable:** id, company_id, customer_id, sale_id, amount, due_date, status, payment_date
- **accounts_payable:** id, company_id, supplier_id, amount, due_date, status, payment_date
- **bank_accounts:** id, company_id, bank_name, account_number, account_type, current_balance, is_active

### Tabelas do Sistema
- **audit_logs:** id, company_id, user_id, action, resource_type, resource_id, old_values, new_values, created_at
- **prompt_logs:** id, user_id, company_id, prompt, generated_code, model_used, temperature, status, applied_files
- **security_audit_logs:** id, user_id, event_type, ip_address, user_agent, event_data, risk_level, created_at
- **app_versions:** id, version_number, git_sha, git_branch, environment, deployed_at, status
- **system_health_logs:** id, service_name, status, response_time_ms, error_message, created_at

## 4. FUNÇÕES SUPABASE PRINCIPAIS
### Funções de Segurança
- **is_super_admin():** Verifica se usuário é super admin
- **is_contratante(company_id):** Verifica se usuário é contratante da empresa
- **is_operador(company_id):** Verifica se usuário é operador da empresa
- **can_access_company_data(company_id):** Verifica acesso aos dados da empresa
- **can_manage_company_data(company_id):** Verifica permissão de gerenciamento
- **has_specific_permission(permission, company_id):** Verifica permissão específica

### Funções de Negócio
- **generate_sale_number(company_id, sale_type):** Gera número de venda
- **generate_nfe_number(company_id, serie):** Gera número de NFe
- **register_stock_movement(...):** Registra movimentação de estoque
- **create_audit_log(...):** Cria log de auditoria
- **log_security_event(...):** Registra evento de segurança

### Funções de Sistema
- **setup_initial_super_admin(email):** Configura super admin inicial
- **get_system_health():** Obtém status de saúde do sistema
- **automated_security_cleanup():** Limpeza automática de logs de segurança

## 5. EDGE FUNCTIONS DISPONÍVEIS
- **prompt-generator:** Geração de código com OpenAI
- **nfe-io-integration:** Integração com NFe.io
- **marketplace-auth:** Autenticação com marketplaces
- **health-check:** Verificação de saúde do sistema
- **cache-manager:** Gerenciamento de cache
- **send-notification:** Envio de notificações

## 6. SECRETS CONFIGURADOS
- **OPENAI_API_KEY:** Chave da OpenAI para IA
- **NFE_IO_API_KEY:** Chave da NFe.io
- **STRIPE_SECRET_KEY:** Chave secreta do Stripe
- **SENDGRID_API_KEY:** Chave do SendGrid (se configurado)

## 7. TIPOS TYPESCRIPT PRINCIPAIS
### Tipos de Usuário
- **UserType:** 'super_admin' | 'contratante' | 'operador'
- **User:** { id: string; email: string; user_type: UserType; permissions: object }

### Tipos de Negócio
- **Product:** { id: string; company_id: string; name: string; price: number; stock_quantity: number; ... }
- **Customer:** { id: string; company_id: string; name: string; document: string; email: string; ... }
- **Sale:** { id: string; company_id: string; customer_id: string; total_amount: number; status: string; ... }

## 8. PERMISSÕES DO SISTEMA
### Permissões Básicas
- **dashboard:** Acesso ao dashboard
- **vendas:** Gestão de vendas
- **produtos:** Gestão de produtos
- **clientes:** Gestão de clientes
- **estoque:** Gestão de estoque
- **financeiro:** Gestão financeira
- **relatorios:** Acesso a relatórios
- **notas_fiscais:** Emissão de notas fiscais

### Permissões Administrativas
- **admin:** Acesso administrativo
- **usuarios:** Gestão de usuários
- **empresas:** Gestão de empresas
- **sistema:** Configurações do sistema
- **seguranca:** Monitoramento de segurança

## 9. PADRÕES DE DESENVOLVIMENTO
### Componentes
- Usar functional components com hooks
- Implementar tratamento de erros robusto
- Usar Tailwind CSS para estilização
- Seguir padrões do shadcn/ui

### Hooks
- Usar Tanstack Query para operações de dados
- Implementar validação com Zod
- Usar React Hook Form para formulários
- Implementar loading e error states

### Segurança
- Implementar RLS policies sempre
- Criar audit logs para operações críticas
- Validar dados com schemas TypeScript
- Usar funções de permissão do Supabase

## 10. INTEGRAÇÕES EXTERNAS
- **NFe.io:** Emissão de notas fiscais
- **Marketplaces:** Mercado Livre, Shopee, Amazon
- **OpenAI:** Geração de código com IA
- **Stripe:** Pagamentos (se configurado)
- **SendGrid:** Envio de emails (se configurado)
`;

    // Prompt do sistema aprimorado com contexto completo
    const systemPrompt = `Você é um desenvolvedor sênior especialista em React, TypeScript, Tailwind CSS e Supabase, trabalhando no Pipeline Labs - um sistema ERP completo para pequenos empreendedores.

${projectContext}

## INSTRUÇÕES ESPECÍFICAS PARA GERAÇÃO DE CÓDIGO:

1. **FORMATO DE RESPOSTA OBRIGATÓRIO:**
Retorne SEMPRE um JSON válido com esta estrutura exata:
{
  "files": {
    "src/components/Example.tsx": "código completo aqui",
    "src/hooks/useExample.ts": "código completo aqui"
  },
  "sql": ["CREATE TABLE...", "ALTER TABLE..."],
  "description": "Descrição detalhada do que foi implementado",
  "suggestions": [
    {
      "type": "improvement",
      "title": "Sugestão de Melhoria",
      "description": "Descrição da melhoria",
      "code": "código da sugestão"
    }
  ],
  "editable_sections": [
    {
      "id": "section1",
      "title": "Seção Editável",
      "description": "Descrição da seção",
      "content": "conteúdo editável"
    }
  ]
}

2. **REGRAS DE CÓDIGO OBRIGATÓRIAS:**
- Use SEMPRE TypeScript com tipos explícitos
- Siga padrões do React moderno (hooks, functional components)
- Use Tailwind CSS para estilização (classes semânticas quando possível)
- Implemente tratamento de erros robusto
- Use Tanstack Query para operações de dados
- Implemente RLS policies para segurança
- Crie audit logs para operações críticas
- Use componentes do Shadcn/UI quando apropriado

3. **QUALIDADE DO CÓDIGO:**
- Código COMPLETO e funcional, não apenas esqueletos
- Imports corretos e organizados
- Componentes bem estruturados com props tipadas
- Hooks customizados quando apropriado
- Validação de dados com Zod quando necessário
- Tratamento de estados de loading e erro
- Responsividade mobile-first

4. **BANCO DE DADOS:**
- Use PostgreSQL/Supabase
- Implemente RLS policies sempre
- Crie índices para performance
- Use foreign keys para integridade
- Mantenha consistência nos nomes

5. **FUNCIONALIDADES ESPECÍFICAS:**
- Sistema de permissões (super_admin, contratante, operador)
- Audit logs para rastreabilidade
- Validação de documentos (CPF/CNPJ)
- Integração com APIs externas quando necessário
- Sistema de notificações

6. **ESTRUTURA DE ARQUIVOS:**
- Components: src/components/[Feature]/[Component].tsx
- Hooks: src/hooks/use[Feature].ts
- Types: src/types/[feature].ts
- Utils: src/utils/[feature].ts
- Pages: src/pages/[Page].tsx

IMPORTANTE:
- Revisar e verificar cuidadosamente o contexto do projeto, considerando todas as rotas, funções, tabelas, arquivos e secrets existentes.
- Confirmar se a modificação ou nova funcionalidade solicitada já existe ou é parcialmente implementada. Caso exista, você deve otimizar ou corrigir sem sobrescrever desnecessariamente o que já funciona.
- Seja específico e detalhado no código
- Não use placeholders ou comentários "// TODO"
- Implemente funcionalidades completas
- Teste mentalmente o fluxo antes de escrever
- Considere edge cases e validações
- Mantenha consistência com o padrão do projeto
- Use as funções e tabelas Supabase existentes
- Implemente logs de auditoria para operações críticas
- Caso a solicitação esteja incompleta ou ambígua, peça mais detalhes antes de agir.

${isRevision ? `

## MODO REVISÃO ATIVADO:
Você está revisando o código anteriormente gerado. Código original:
${originalCode}

Analise o código original e faça as melhorias/correções solicitadas no prompt do usuário.
` : ''}

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
            content: `Contexto: Você está trabalhando no Pipeline Labs ERP com acesso completo ao projeto. 

Prompt do usuário: ${prompt}

Lembre-se:
- Retorne SEMPRE um JSON válido
- Trabalhe igual um agent do prompt lovable
- Implemente código COMPLETO e funcional
- Use as melhores práticas do React/TypeScript
- Considere segurança e performance
- Seja específico e detalhado
- Use as funções e tabelas Supabase existentes
- Implemente logs de auditoria quando necessário`
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

      // Garantir que suggestions seja um array
      if (!Array.isArray(parsedContent.suggestions)) {
        parsedContent.suggestions = []
      }

      // Garantir que editable_sections seja um array
      if (!Array.isArray(parsedContent.editable_sections)) {
        parsedContent.editable_sections = []
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
          suggestions: [],
          editable_sections: [],
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
