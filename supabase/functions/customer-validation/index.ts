import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

// Validação de CPF
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

// Validação de CNPJ
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

// Consulta CEP via API externa
async function fetchAddressByCEP(cep: string): Promise<AddressData | null> {
  try {
    const cleanCEP = cep.replace(/[^\d]/g, '');
    if (cleanCEP.length !== 8) return null;

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.erro) return null;

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zipcode: cleanCEP
    };
  } catch (error) {
    console.error('Error fetching CEP:', error);
    return null;
  }
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

    const { action, customerData, companyId, customerId } = await req.json();

    switch (action) {
      case 'validate_document': {
        const { document } = customerData;
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

        // Verificar duplicatas na empresa
        const { data: existing } = await supabase
          .from('customers')
          .select('id, name')
          .eq('document', cleanDoc)
          .eq('company_id', companyId)
          .neq('id', customerId || '');

        return new Response(JSON.stringify({
          success: true,
          isValid,
          documentType,
          isDuplicate: existing && existing.length > 0,
          existingCustomer: existing?.[0]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'fetch_address_by_cep': {
        const { zipcode } = customerData;
        const addressData = await fetchAddressByCEP(zipcode);

        return new Response(JSON.stringify({
          success: true,
          addressData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'validate_email': {
        const { email } = customerData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);

        // Verificar duplicatas na empresa
        const { data: existing } = await supabase
          .from('customers')
          .select('id, name')
          .eq('email', email)
          .eq('company_id', companyId)
          .neq('id', customerId || '');

        return new Response(JSON.stringify({
          success: true,
          isValid,
          isDuplicate: existing && existing.length > 0,
          existingCustomer: existing?.[0]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'deduplicate_customers': {
        // Buscar duplicatas por documento
        const { data: customers } = await supabase
          .from('customers')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: true });

        if (!customers) {
          return new Response(JSON.stringify({
            success: true,
            duplicatesFound: 0,
            duplicatesRemoved: 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const documentGroups = new Map();
        const emailGroups = new Map();
        
        // Agrupar por documento e email
        customers.forEach(customer => {
          if (customer.document) {
            const cleanDoc = customer.document.replace(/[^\d]/g, '');
            if (!documentGroups.has(cleanDoc)) {
              documentGroups.set(cleanDoc, []);
            }
            documentGroups.get(cleanDoc).push(customer);
          }

          if (customer.email) {
            if (!emailGroups.has(customer.email)) {
              emailGroups.set(customer.email, []);
            }
            emailGroups.get(customer.email).push(customer);
          }
        });

        let duplicatesFound = 0;
        let duplicatesRemoved = 0;
        const toRemove = new Set();

        // Processar duplicatas por documento
        for (const [doc, group] of documentGroups) {
          if (group.length > 1) {
            duplicatesFound += group.length - 1;
            // Manter o mais recente, remover os outros
            group.slice(0, -1).forEach(customer => toRemove.add(customer.id));
          }
        }

        // Processar duplicatas por email
        for (const [email, group] of emailGroups) {
          if (group.length > 1) {
            const filtered = group.filter(customer => !toRemove.has(customer.id));
            if (filtered.length > 1) {
              duplicatesFound += filtered.length - 1;
              filtered.slice(0, -1).forEach(customer => toRemove.add(customer.id));
            }
          }
        }

        // Remover duplicatas
        if (toRemove.size > 0) {
          const { error } = await supabase
            .from('customers')
            .delete()
            .in('id', Array.from(toRemove));

          if (!error) {
            duplicatesRemoved = toRemove.size;
          }
        }

        return new Response(JSON.stringify({
          success: true,
          duplicatesFound,
          duplicatesRemoved
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'smart_customer_search': {
        const { query, limit = 50 } = customerData;
        
        let searchQuery = supabase
          .from('customers')
          .select('*')
          .eq('company_id', companyId)
          .eq('is_active', true);

        if (query) {
          searchQuery = searchQuery.or(`name.ilike.%${query}%, email.ilike.%${query}%, document.ilike.%${query}%`);
        }

        const { data: customers, error } = await searchQuery
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          customers: customers || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'customer_analytics': {
        if (!customerId) throw new Error('Customer ID required');

        // Buscar análises do cliente
        const [
          { data: sales, count: salesCount },
          { data: recentSales }
        ] = await Promise.all([
          supabase.from('sales')
            .select('total_amount', { count: 'exact' })
            .eq('customer_id', customerId)
            .eq('company_id', companyId),
          supabase.from('sales')
            .select('id, sale_number, total_amount, created_at')
            .eq('customer_id', customerId)
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(10)
        ]);

        const totalSpent = sales?.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0) || 0;
        const averageTicket = salesCount ? totalSpent / salesCount : 0;

        return new Response(JSON.stringify({
          success: true,
          analytics: {
            totalSales: salesCount || 0,
            totalSpent,
            averageTicket,
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
    console.error('Error in customer-validation:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});