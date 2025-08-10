import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Service role client (no JWT required, bypasses RLS via RPC)
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const {
      company_id: providedCompanyId,
      namespace = 'ai-engineer',
      content,
      metadata = {},
      embedding_model = 'text-embedding-3-small'
    } = body ?? {};

    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({ error: 'content é obrigatório' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // company_id deve ser enviado quando público
    const company_id = providedCompanyId;
    if (!company_id) {
      return new Response(JSON.stringify({ error: 'company_id é obrigatório' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Gerar embedding com fallback de modelos
    let embedding: number[] | null = null;
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY não configurada no projeto' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const candidates = Array.from(new Set([
      embedding_model,
      'text-embedding-3-small',
      'text-embedding-3-large',
      'text-embedding-ada-002'
    ].filter(Boolean)));

    let lastErrText: string | null = null;
    for (const model of candidates) {
      try {
        const embRes = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model, input: content }),
        });

        if (!embRes.ok) {
          const errText = await embRes.text();
          lastErrText = errText;
          // Se modelo não encontrado, tenta próximo
          if (errText.includes('model_not_found') || embRes.status === 404) {
            console.warn(`Modelo de embedding não disponível (${model}), tentando próximo...`);
            continue;
          }
          // Se problema de auth, para aqui com mensagem clara
          if (embRes.status === 401 || embRes.status === 403) {
            return new Response(
              JSON.stringify({ error: 'Falha de autenticação com OpenAI. Verifique a OPENAI_API_KEY/Project access.' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          throw new Error(`Embeddings API error: ${errText}`);
        }

        const embData = await embRes.json();
        embedding = embData.data?.[0]?.embedding || null;
        if (embedding) break;
      } catch (e) {
        console.error(`Erro tentando gerar embedding com ${model}:`, e);
        lastErrText = e?.message ?? String(e);
      }
    }

    if (!embedding) {
      console.error('Erro gerando embedding - última causa:', lastErrText);
      return new Response(
        JSON.stringify({ error: 'Falha ao gerar embedding', detail: lastErrText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!embedding) {
      return new Response(JSON.stringify({ error: 'Embedding não gerado' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Inserir conhecimento via RPC para converter embedding -> vector
    const { data: insertId, error: insertError } = await supabase
      .rpc('insert_knowledge_entry', {
        p_company_id: company_id,
        p_namespace: namespace,
        p_content: content,
        p_metadata: metadata,
        p_embedding: embedding
      });

    if (insertError) {
      console.error('Erro inserindo knowledge_entries (RPC):', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, id: insertId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Erro geral save-knowledge:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro inesperado' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
