import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Edge function para sincronizar status NFE.io a cada X minutos via cron
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Buscar NFes pendentes que precisam de sincronização
    const { data: pendingInvoices, error } = await supabase
      .from('invoices')
      .select('*, nfe_xmls(*)')
      .in('status', ['pending', 'sent'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    let syncCount = 0;
    for (const invoice of pendingInvoices || []) {
      if (invoice.nfe_xmls?.[0]?.access_key) {
        try {
          // Consultar status via NFE.io
          const { data: statusData } = await supabase.functions.invoke('nfe-io-integration', {
            body: {
              action: 'query_status',
              nfeId: invoice.nfe_xmls[0].access_key,
              isProduct: invoice.invoice_type === 'NFE'
            }
          });

          // Atualizar status se mudou
          if (statusData?.status && statusData.status !== invoice.status) {
            await supabase
              .from('invoices')
              .update({ status: statusData.status })
              .eq('id', invoice.id);
            
            syncCount++;
          }
        } catch (error) {
          console.error(`Erro ao sincronizar NFe ${invoice.invoice_number}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, synced: syncCount }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});