import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  company_id: string;
  user_id?: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  action_url?: string;
  action_label?: string;
  metadata?: any;
  expires_at?: string;
  send_email?: boolean;
  send_whatsapp?: boolean;
  whatsapp_number?: string;
  email?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const notificationData: NotificationRequest = await req.json();
    
    console.log('Processando notificação:', notificationData);

    // Criar notificação no banco
    const { data: notification, error: dbError } = await supabase.rpc('create_notification', {
      p_company_id: notificationData.company_id,
      p_user_id: notificationData.user_id || null,
      p_title: notificationData.title,
      p_message: notificationData.message,
      p_type: notificationData.type || 'info',
      p_category: notificationData.category || 'system',
      p_priority: notificationData.priority || 'medium',
      p_action_url: notificationData.action_url || null,
      p_action_label: notificationData.action_label || null,
      p_metadata: notificationData.metadata || {},
      p_expires_at: notificationData.expires_at || null,
      p_send_email: notificationData.send_email || false,
      p_send_whatsapp: notificationData.send_whatsapp || false
    });

    if (dbError) {
      console.error('Erro ao criar notificação:', dbError);
      throw dbError;
    }

    console.log('Notificação criada com ID:', notification);

    const results = {
      notification_id: notification,
      email_sent: false,
      whatsapp_sent: false,
      errors: [] as string[]
    };

    // Enviar por email se solicitado
    if (notificationData.send_email && notificationData.email) {
      try {
        const emailData = {
          to: notificationData.email,
          subject: notificationData.title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">${notificationData.title}</h1>
              </div>
              <div style="padding: 20px; background: #f8f9fa;">
                <p style="color: #333; font-size: 16px; line-height: 1.6;">${notificationData.message}</p>
                ${notificationData.action_url ? `
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${notificationData.action_url}" 
                       style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      ${notificationData.action_label || 'Ver Detalhes'}
                    </a>
                  </div>
                ` : ''}
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
                  <p>Esta é uma notificação automática do sistema Pipeline Labs.</p>
                  <p>Se você não deseja mais receber estas notificações, você pode alterar suas preferências no painel de configurações.</p>
                </div>
              </div>
            </div>
          `
        };

        // Aqui você integraria com seu serviço de email (Resend, SendGrid, etc.)
        // Por enquanto, apenas logamos
        console.log('Email seria enviado:', emailData);
        results.email_sent = true;
        
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        results.errors.push(`Erro no email: ${emailError.message}`);
      }
    }

    // Enviar por WhatsApp se solicitado
    if (notificationData.send_whatsapp && notificationData.whatsapp_number) {
      try {
        const whatsappMessage = `
🔔 *${notificationData.title}*

${notificationData.message}

${notificationData.action_url ? `🔗 Link: ${notificationData.action_url}` : ''}

_Enviado pelo Pipeline Labs_
        `.trim();

        // Aqui você integraria com sua API do WhatsApp
        // Por enquanto, apenas logamos
        console.log('WhatsApp seria enviado para:', notificationData.whatsapp_number);
        console.log('Mensagem:', whatsappMessage);
        results.whatsapp_sent = true;
        
      } catch (whatsappError) {
        console.error('Erro ao enviar WhatsApp:', whatsappError);
        results.errors.push(`Erro no WhatsApp: ${whatsappError.message}`);
      }
    }

    return new Response(
      JSON.stringify(results),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('Erro na função send-notification:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        notification_id: null,
        email_sent: false,
        whatsapp_sent: false
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});