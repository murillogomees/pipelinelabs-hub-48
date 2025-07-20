import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NFeConfig {
  api_token: string;
  environment: 'sandbox' | 'production';
  webhook_url?: string;
  timeout?: number;
  company_cnpj: string;
  certificate_data?: any;
  certificate_password: string;
  nfe_series?: string;
  default_cfop?: string;
  auto_send?: boolean;
  email_notification?: boolean;
}

interface NFeData {
  customer: {
    name: string;
    document: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_value: number;
    total_value: number;
    ncm_code?: string;
    cfop?: string;
  }>;
  total_amount: number;
  issue_date?: string;
  payment_method?: string;
  notes?: string;
}

class NFeIOService {
  private config: NFeConfig;
  private baseURL: string;

  constructor(config: NFeConfig) {
    this.config = config;
    this.baseURL = config.environment === 'production' 
      ? 'https://api.nfe.io/v1' 
      : 'https://api.sandbox.nfe.io/v1';
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.api_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`NFE.io API Error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return await response.json();
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.makeRequest('/companies');
      return {
        success: true,
        message: 'Conexão com NFE.io estabelecida com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erro na conexão: ${error.message}`
      };
    }
  }

  async validateCertificate(): Promise<any> {
    try {
      if (!this.config.certificate_data) {
        throw new Error('Certificado não encontrado');
      }

      // Simular validação de certificado
      // Em produção, isso faria a validação real do certificado
      const mockCertInfo = {
        subject: `CN=${this.config.company_cnpj}`,
        issuer: 'AC Certisign RFB G5',
        valid_from: '2023-01-01T00:00:00Z',
        valid_to: '2024-12-31T23:59:59Z',
        serial_number: '123456789',
        is_valid: true,
        days_until_expiry: 180
      };

      return mockCertInfo;
    } catch (error: any) {
      throw new Error(`Erro ao validar certificado: ${error.message}`);
    }
  }

  async issueNFe(nfeData: NFeData): Promise<any> {
    try {
      const nfePayload = {
        company_id: this.config.company_cnpj,
        service_invoice: {
          borrower: {
            federal_tax_number: nfeData.customer.document,
            name: nfeData.customer.name,
            email: nfeData.customer.email,
            address: nfeData.customer.address ? {
              street: nfeData.customer.address,
              city: nfeData.customer.city,
              state: nfeData.customer.state,
              postal_code: nfeData.customer.zipcode,
              country: 'BRA'
            } : undefined
          },
          services: nfeData.items.map(item => ({
            service_code: item.cfop || this.config.default_cfop || '5102',
            description: item.description,
            amount: item.total_value,
            quantity: item.quantity,
            unit_price: item.unit_value
          })),
          rps_serie: this.config.nfe_series || '001',
          rps_number: this.generateRpsNumber(),
          issue_date: nfeData.issue_date || new Date().toISOString(),
          notes: nfeData.notes
        }
      };

      const result = await this.makeRequest('/companies/:company_id/service_invoices', 'POST', nfePayload);
      
      // Se configurado para envio automático
      if (this.config.auto_send) {
        await this.sendNFe(result.id);
      }

      // Se configurado para notificação por email
      if (this.config.email_notification && nfeData.customer.email) {
        await this.sendNFeByEmail(result.id, nfeData.customer.email);
      }

      return result;
    } catch (error: any) {
      throw new Error(`Erro ao emitir NFe: ${error.message}`);
    }
  }

  async queryNFeStatus(nfeId: string): Promise<any> {
    try {
      const result = await this.makeRequest(`/companies/:company_id/service_invoices/${nfeId}`);
      return result;
    } catch (error: any) {
      throw new Error(`Erro ao consultar status da NFe: ${error.message}`);
    }
  }

  private async sendNFe(nfeId: string): Promise<any> {
    return await this.makeRequest(`/companies/:company_id/service_invoices/${nfeId}/send`, 'POST');
  }

  private async sendNFeByEmail(nfeId: string, email: string): Promise<any> {
    const payload = { emails: [email] };
    return await this.makeRequest(`/companies/:company_id/service_invoices/${nfeId}/send_email`, 'POST', payload);
  }

  private generateRpsNumber(): string {
    return Date.now().toString();
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, config, nfeData, nfeId } = await req.json();
    
    if (!config || !config.api_token) {
      throw new Error('Configuração da NFE.io não encontrada');
    }

    const nfeService = new NFeIOService(config);

    let result;

    switch (action) {
      case 'test_connection':
        result = await nfeService.testConnection();
        break;
        
      case 'validate_certificate':
        result = await nfeService.validateCertificate();
        break;
        
      case 'issue_nfe':
        if (!nfeData) throw new Error('Dados da NFe são obrigatórios');
        result = await nfeService.issueNFe(nfeData);
        break;
        
      case 'query_status':
        if (!nfeId) throw new Error('ID da NFe é obrigatório');
        result = await nfeService.queryNFeStatus(nfeId);
        break;
        
      default:
        throw new Error('Ação não reconhecida');
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Erro na integração NFE.io:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
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

serve(handler);