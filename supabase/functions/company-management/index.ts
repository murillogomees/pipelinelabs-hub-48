import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompanyData {
  name: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  legal_name?: string;
  trade_name?: string;
}

// Validação avançada de CNPJ
function validateCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  let sum = 0;
  let pos = 5;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(cnpj.charAt(12))) return false;
  
  sum = 0;
  pos = 6;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  return result === parseInt(cnpj.charAt(13));
}

// Validação avançada de CPF
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.charAt(10));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      throw new Error('Invalid token');
    }

    const { action, companyData, companyId } = await req.json();

    switch (action) {
      case 'validate_document': {
        const { document } = companyData;
        const cleanDoc = document.replace(/[^\d]/g, '');
        
        let isValid = false;
        let documentType = '';
        
        if (cleanDoc.length === 14) {
          isValid = validateCNPJ(cleanDoc);
          documentType = 'CNPJ';
        } else if (cleanDoc.length === 11) {
          isValid = validateCPF(cleanDoc);
          documentType = 'CPF';
        }

        // Verificar duplicatas
        const { data: existing } = await supabase
          .from('companies')
          .select('id, name')
          .eq('document', cleanDoc)
          .neq('id', companyId || '');

        return new Response(JSON.stringify({
          success: true,
          isValid,
          documentType,
          isDuplicate: existing && existing.length > 0,
          existingCompany: existing?.[0]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create_company': {
        const cleanDoc = companyData.document.replace(/[^\d]/g, '');
        
        // Validar documento
        const isValidDoc = cleanDoc.length === 14 ? validateCNPJ(cleanDoc) : validateCPF(cleanDoc);
        if (!isValidDoc) {
          throw new Error('Documento inválido');
        }

        // Verificar duplicatas
        const { data: existing } = await supabase
          .from('companies')
          .select('id')
          .eq('document', cleanDoc);

        if (existing && existing.length > 0) {
          throw new Error('Documento já cadastrado');
        }

        // Criar empresa
        const { data: company, error } = await supabase
          .from('companies')
          .insert({
            ...companyData,
            document: cleanDoc,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;

        // Criar associação user_companies
        await supabase
          .from('user_companies')
          .insert({
            user_id: user.id,
            company_id: company.id,
            role: 'contratante',
            is_active: true
          });

        // Log de auditoria
        await supabase.functions.invoke('log-security-event', {
          body: {
            event_type: 'company_created',
            user_id: user.id,
            company_id: company.id,
            metadata: { company_name: company.name },
            severity: 'medium'
          }
        });

        return new Response(JSON.stringify({
          success: true,
          company
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_company': {
        if (!companyId) throw new Error('Company ID required for update');

        const cleanDoc = companyData.document.replace(/[^\d]/g, '');
        
        // Validar documento
        const isValidDoc = cleanDoc.length === 14 ? validateCNPJ(cleanDoc) : validateCPF(cleanDoc);
        if (!isValidDoc) {
          throw new Error('Documento inválido');
        }

        // Verificar duplicatas (excluindo a própria empresa)
        const { data: existing } = await supabase
          .from('companies')
          .select('id')
          .eq('document', cleanDoc)
          .neq('id', companyId);

        if (existing && existing.length > 0) {
          throw new Error('Documento já cadastrado');
        }

        // Buscar dados antigos para auditoria
        const { data: oldCompany } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        // Atualizar empresa
        const { data: company, error } = await supabase
          .from('companies')
          .update({
            ...companyData,
            document: cleanDoc,
            updated_at: new Date().toISOString()
          })
          .eq('id', companyId)
          .select()
          .single();

        if (error) throw error;

        // Log de auditoria
        await supabase.functions.invoke('create-audit-log', {
          body: {
            company_id: companyId,
            action: 'company_updated',
            resource_type: 'company',
            resource_id: companyId,
            old_values: oldCompany,
            new_values: company,
            severity: 'info'
          }
        });

        return new Response(JSON.stringify({
          success: true,
          company
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_company_analytics': {
        if (!companyId) throw new Error('Company ID required');

        // Buscar métricas da empresa
        const [
          { data: customers, count: customersCount },
          { data: products, count: productsCount },
          { data: sales, count: salesCount },
          { data: recentSales }
        ] = await Promise.all([
          supabase.from('customers').select('*', { count: 'exact' }).eq('company_id', companyId),
          supabase.from('products').select('*', { count: 'exact' }).eq('company_id', companyId),
          supabase.from('sales').select('total_amount', { count: 'exact' }).eq('company_id', companyId),
          supabase.from('sales')
            .select('id, sale_number, total_amount, created_at, customer:customers(name)')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        const totalRevenue = sales?.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0) || 0;

        return new Response(JSON.stringify({
          success: true,
          analytics: {
            customers: customersCount || 0,
            products: productsCount || 0,
            sales: salesCount || 0,
            totalRevenue,
            recentSales: recentSales || []
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in company-management:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});