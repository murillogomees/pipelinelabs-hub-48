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

    // Embedding desabilitado por solicitação do usuário: não gerar embeddings
    const embedding: number[] | null = null;
    
    // Em vez de salvar no vetor, vamos registrar em audit_logs para manter histórico
    const newValues = {
      namespace,
      metadata,
      content_preview: content.slice(0, 1000),
      embedding_disabled: true,
    };

    const { data: auditId, error: auditErr } = await supabase.rpc('create_audit_log', {
      p_company_id: company_id,
      p_action: 'knowledge:save_no_embedding',
      p_resource_type: 'knowledge',
      p_resource_id: null,
      p_old_values: null,
      p_new_values: newValues,
      p_ip_address: null,
      p_user_agent: null,
      p_severity: 'info',
      p_status: 'success',
      p_details: { note: 'Knowledge salvo sem embedding por configuração do usuário.' },
    });

    if (auditErr) {
      console.error('Erro registrando audit log:', auditErr);
      return new Response(JSON.stringify({ error: auditErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(
      JSON.stringify({ success: true, mode: 'audit_only', audit_log_id: auditId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
