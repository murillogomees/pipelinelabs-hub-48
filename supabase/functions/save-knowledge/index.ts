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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') ?? '' },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

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

    // Permissão: precisa ser super admin
    const { data: canBypass, error: canErr } = await supabase.rpc('can_bypass_all_restrictions');
    if (canErr) {
      console.error('Erro checando permissão:', canErr);
    }
    if (!canBypass) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Resolver company_id
    let company_id = providedCompanyId;
    if (!company_id) {
      const { data: cData, error: cErr } = await supabase.rpc('get_user_company_id');
      if (cErr) {
        console.error('Erro buscando company_id:', cErr);
      }
      company_id = cData;
    }
    if (!company_id) {
      return new Response(JSON.stringify({ error: 'company_id não encontrado' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Gerar embedding
    let embedding: number[] | null = null;
    try {
      const embRes = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: embedding_model,
          input: content,
        }),
      });
      if (!embRes.ok) {
        const errText = await embRes.text();
        throw new Error(`Embeddings API error: ${errText}`);
      }
      const embData = await embRes.json();
      embedding = embData.data?.[0]?.embedding || null;
    } catch (e) {
      console.error('Erro gerando embedding:', e);
      return new Response(JSON.stringify({ error: 'Falha ao gerar embedding' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
