import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NFeWebhookPayload {
  event_type: string;
  data: {
    id: string;
    status: string;
    access_key?: string;
    protocol_number?: string;
    rejection_reason?: string;
    company_id: string;
    xml_url?: string;
    pdf_url?: string;
  };
  signature?: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Validar webhook (verificação de assinatura)
    const signature = req.headers.get('x-nfe-signature');
    const webhookSecret = Deno.env.get('NFE_IO_WEBHOOK_SECRET');
    
    if (webhookSecret && signature) {
      // Validar assinatura do webhook
      const payload = await req.text();
      
      // Aqui você implementaria a validação da assinatura
      // Por exemplo, usando HMAC SHA256
      const crypto = await import("node:crypto");
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');
      
      if (signature !== `sha256=${expectedSignature}`) {
        console.error('Invalid webhook signature');
        return new Response('Unauthorized', { status: 401 });
      }
      
      const webhookData: NFeWebhookPayload = JSON.parse(payload);
      await processWebhook(supabase, webhookData);
    } else {
      // Se não há secret configurado, processa sem validação (desenvolvimento)
      const webhookData: NFeWebhookPayload = await req.json();
      await processWebhook(supabase, webhookData);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Erro no webhook NFE.io:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

async function processWebhook(supabase: any, webhookData: NFeWebhookPayload) {
  console.log('Processing NFE.io webhook:', webhookData);

  const { event_type, data } = webhookData;
  
  try {
    // Buscar a invoice baseada no ID externo ou chave de acesso
    let invoiceQuery = supabase
      .from('invoices')
      .select('*, nfe_xmls(*)')
      .eq('company_id', data.company_id);

    // Se temos chave de acesso, usar para buscar
    if (data.access_key) {
      const { data: xmlData } = await supabase
        .from('nfe_xmls')
        .select('*, invoices(*)')
        .eq('access_key', data.access_key)
        .single();
      
      if (xmlData?.invoices) {
        await updateInvoiceAndXML(supabase, xmlData.invoices.id, data, xmlData.id);
        return;
      }
    }

    // Buscar por ID externo armazenado em metadata
    const { data: invoices } = await invoiceQuery;
    const invoice = invoices?.find((inv: any) => 
      inv.nfe_xmls?.some((xml: any) => 
        xml.metadata?.nfe_io_id === data.id
      )
    );

    if (invoice) {
      const nfeXml = invoice.nfe_xmls.find((xml: any) => 
        xml.metadata?.nfe_io_id === data.id
      );
      
      await updateInvoiceAndXML(supabase, invoice.id, data, nfeXml?.id);
    } else {
      console.warn(`Invoice not found for NFE.io ID: ${data.id}`);
    }

    // Log do evento
    await supabase.from('audit_logs').insert({
      company_id: data.company_id,
      action: `nfe:webhook_${event_type}`,
      resource_type: 'nfe_webhook',
      resource_id: data.id,
      new_values: {
        event_type,
        status: data.status,
        access_key: data.access_key,
        protocol_number: data.protocol_number
      },
      severity: data.status === 'rejected' ? 'high' : 'info',
      status: 'success'
    });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    
    // Log de erro
    await supabase.from('audit_logs').insert({
      company_id: data.company_id || 'unknown',
      action: `nfe:webhook_error`,
      resource_type: 'nfe_webhook',
      resource_id: data.id,
      new_values: { error: error.message, event_type },
      severity: 'critical',
      status: 'error'
    });
    
    throw error;
  }
}

async function updateInvoiceAndXML(
  supabase: any, 
  invoiceId: string, 
  data: any, 
  xmlId?: string
) {
  // Mapear status da NFE.io para nossos status
  const statusMap: Record<string, string> = {
    'issued': 'issued',
    'authorized': 'approved',
    'cancelled': 'cancelled',
    'rejected': 'error',
    'processing': 'pending',
    'error': 'error'
  };

  const mappedStatus = statusMap[data.status] || data.status;

  // Atualizar invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update({
      status: mappedStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId);

  if (invoiceError) {
    console.error('Error updating invoice:', invoiceError);
    throw invoiceError;
  }

  // Atualizar ou criar XML record
  if (xmlId) {
    const { error: xmlError } = await supabase
      .from('nfe_xmls')
      .update({
        status: mappedStatus,
        access_key: data.access_key || undefined,
        protocol_number: data.protocol_number || undefined,
        rejection_reason: data.rejection_reason || undefined,
        pdf_url: data.pdf_url || undefined,
        updated_at: new Date().toISOString(),
        metadata: {
          nfe_io_id: data.id,
          last_webhook_update: new Date().toISOString(),
          xml_url: data.xml_url
        }
      })
      .eq('id', xmlId);

    if (xmlError) {
      console.error('Error updating NFE XML:', xmlError);
      throw xmlError;
    }
  } else {
    // Criar novo registro XML se não existir
    const { error: createError } = await supabase
      .from('nfe_xmls')
      .insert({
        invoice_id: invoiceId,
        company_id: data.company_id,
        status: mappedStatus,
        access_key: data.access_key,
        protocol_number: data.protocol_number,
        rejection_reason: data.rejection_reason,
        pdf_url: data.pdf_url,
        xml_content: '', // Será preenchido quando baixarmos o XML
        metadata: {
          nfe_io_id: data.id,
          last_webhook_update: new Date().toISOString(),
          xml_url: data.xml_url
        }
      });

    if (createError) {
      console.error('Error creating NFE XML:', createError);
      throw createError;
    }
  }

  console.log(`Successfully updated invoice ${invoiceId} with status ${mappedStatus}`);
}

serve(handler);