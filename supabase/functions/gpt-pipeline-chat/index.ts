
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

    const { message, gpt_id, company_id, conversation_history } = await req.json();

    console.log('Received request:', { message, gpt_id, company_id });

    // Validar entrada
    if (!message || !company_id) {
      return new Response(
        JSON.stringify({ error: 'Mensagem e company_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chamar OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: gpt_id || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em análise de código e desenvolvimento. 
            Analise a solicitação do usuário e responda sempre em JSON com esta estrutura:
            {
              "analysis": "Sua análise detalhada da solicitação",
              "suggestion": "Sua sugestão de implementação",
              "code_changes": {
                "files": ["lista de arquivos que serão modificados"],
                "description": "Descrição das mudanças"
              },
              "considerations": ["lista de considerações importantes"],
              "ready_to_implement": true/false
            }`
          },
          ...conversation_history || [],
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI response:', openaiData);

    const gptResponse = openaiData.choices[0]?.message?.content;

    if (!gptResponse) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Tentar parsear a resposta JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(gptResponse);
    } catch (parseError) {
      console.error('Erro ao parsear resposta JSON:', parseError);
      // Se não conseguir parsear, criar uma resposta estruturada
      parsedResponse = {
        analysis: "Análise da solicitação recebida",
        suggestion: gptResponse,
        code_changes: {
          files: [],
          description: "Mudanças a serem implementadas"
        },
        considerations: ["Revisar implementação antes de aplicar"],
        ready_to_implement: false
      };
    }

    // Salvar a conversa no banco
    try {
      const { error: insertError } = await supabase.rpc('save_gpt_conversation', {
        p_company_id: company_id,
        p_message: message,
        p_response: parsedResponse,
        p_gpt_model: gpt_id || 'gpt-4o'
      });

      if (insertError) {
        console.error('Erro ao salvar conversa:', insertError);
      }
    } catch (saveError) {
      console.error('Erro ao salvar no banco:', saveError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: parsedResponse
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
