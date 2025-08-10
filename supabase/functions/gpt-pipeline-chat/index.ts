
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { message, assistant_id, gpt_id, company_id, conversation_history, embedding_model, conversationId, threadId } = await req.json();

    console.log('Received request:', { message, assistant_id, gpt_id, company_id, conversationId, threadId });
    const DEFAULT_ASSISTANT_ID = 'asst_KW3FyuDgmdSNiCLiygZI2kq4';
    const selectedAssistantId = assistant_id || DEFAULT_ASSISTANT_ID;

    // Validar entrada
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Embeddings desabilitados por solicitação do usuário
    let knowledgeContext = '';
    const embedding = null;

    // Integrar com OpenAI Assistants API (threads v2)
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const oaHeaders = {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    };

    // Criar thread se não fornecida
    let activeThreadId = threadId as string | undefined;
    if (!activeThreadId) {
      const threadRes = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: oaHeaders,
        body: JSON.stringify({})
      });
      if (!threadRes.ok) {
        const err = await threadRes.text();
        console.error('Erro criando thread:', err);
        throw new Error('Falha ao criar thread');
      }
      const threadData = await threadRes.json();
      activeThreadId = threadData.id;
    }

    // Adicionar mensagem do usuário à thread
    const msgRes = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
      method: 'POST',
      headers: oaHeaders,
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    });
    if (!msgRes.ok) {
      const err = await msgRes.text();
      console.error('Erro adicionando mensagem à thread:', err);
      throw new Error('Falha ao adicionar mensagem');
    }

    // Instruções da execução, incluindo o contexto recuperado
    const instructions = `Você é um assistente especializado em análise de código e desenvolvimento.\nResponda SEMPRE em JSON com esta estrutura:\n{\n  \"analysis\": \"Sua análise detalhada da solicitação\",\n  \"suggestion\": \"Sua sugestão de implementação\",\n  \"code_changes\": {\n    \"files\": [\"lista de arquivos que serão modificados\"],\n    \"description\": \"Descrição das mudanças\"\n  },\n  \"considerations\": [\"lista de considerações importantes\"],\n  \"ready_to_implement\": true/false\n}\n\nContexto do projeto recuperado da memória (máx 8):\n${knowledgeContext || 'Sem resultados relevantes'}`;

    // Criar run
    const runRes = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs`, {
      method: 'POST',
      headers: oaHeaders,
      body: JSON.stringify({ assistant_id: selectedAssistantId, instructions })
    });
    if (!runRes.ok) {
      const err = await runRes.text();
      console.error('Erro criando run:', err);
      throw new Error('Falha ao criar run');
    }
    const runData = await runRes.json();
    const runId = runData.id as string;

    // Aguardar conclusão do run (polling simples)
    let status = runData.status as string;
    const terminal = new Set(['completed', 'failed', 'cancelled', 'expired', 'requires_action']);
    for (let i = 0; i < 30 && !terminal.has(status); i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const check = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs/${runId}`, { headers: oaHeaders });
      if (!check.ok) break;
      const chk = await check.json();
      status = chk.status;
      if (terminal.has(status)) break;
    }

    // Buscar última mensagem do assistente
    const histRes = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages?limit=10&order=desc`, { headers: oaHeaders });
    if (!histRes.ok) {
      const err = await histRes.text();
      console.error('Erro buscando mensagens:', err);
      throw new Error('Falha ao buscar mensagens');
    }
    const hist = await histRes.json();
    let assistantText = '';
    const assistantMsg = (hist.data || []).find((m: any) => m.role === 'assistant');
    if (assistantMsg?.content?.length) {
      for (const c of assistantMsg.content) {
        if (c.type === 'text' && c.text?.value) assistantText += c.text.value + '\n';
      }
      assistantText = assistantText.trim();
    }
    if (!assistantText) assistantText = 'Sem resposta do assistente.';

    // Tentar parsear JSON
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(assistantText);
    } catch (_) {
      parsedResponse = {
        analysis: 'Análise da solicitação recebida',
        suggestion: assistantText,
        code_changes: { files: [], description: 'Mudanças a serem implementadas' },
        considerations: ['Revisar implementação antes de aplicar'],
        ready_to_implement: false,
      };
    }

    // Salvar a conversa no banco (opcional, se company_id informado)
    try {
      if (company_id) {
        const { error: insertError } = await supabase.rpc('save_gpt_conversation', {
          p_company_id: company_id,
          p_message: message,
          p_response: parsedResponse,
          p_gpt_model: `assistant:${selectedAssistantId}`
        });

        if (insertError) {
          console.error('Erro ao salvar conversa:', insertError);
        }

        // Persistir memória: guardar a mensagem do usuário como knowledge entry
        if (embedding) {
          const { error: keError } = await supabase
            .from('knowledge_entries')
            .insert([
              {
                company_id,
                namespace: 'ai-engineer',
                content: message,
                metadata: {
                  source: 'gpt-pipeline-chat',
                  gpt_model: `assistant:${selectedAssistantId}`,
                  created_via: 'user_message'
                },
                embedding
              }
            ]);
          if (keError) {
            console.error('Erro ao salvar knowledge entry:', keError);
          }
        }
      } else {
        console.log('company_id ausente - pulando persistência de conversa e knowledge.');
      }
    } catch (saveError) {
      console.error('Erro ao salvar no banco:', saveError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: parsedResponse,
        assistant_text: assistantText,
        thread_id: activeThreadId,
        run_id: typeof runId !== 'undefined' ? runId : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
