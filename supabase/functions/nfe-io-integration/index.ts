import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// NFe.io API Base URLs
const NFE_IO_PROD_URL = 'https://api.nfe.io/v1';
const NFE_IO_SANDBOX_URL = 'https://api.sandbox.nfe.io/v1';

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
      const companyId = this.config.company_cnpj.replace(/[^0-9]/g, '');
      
      const nfePayload = {
        company_id: companyId,
        service_invoice: {
          borrower: {
            federal_tax_number: nfeData.customer.document.replace(/[^0-9]/g, ''),
            name: nfeData.customer.name,
            email: nfeData.customer.email,
            address: nfeData.customer.address ? {
              street: nfeData.customer.address,
              city: nfeData.customer.city,
              state: nfeData.customer.state,
              postal_code: nfeData.customer.zipcode?.replace(/[^0-9]/g, ''),
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

      console.log('Emitindo NFe com payload:', JSON.stringify(nfePayload, null, 2));
      
      const endpoint = `/companies/${companyId}/service_invoices`;
      const result = await this.makeRequest(endpoint, 'POST', nfePayload);
      
      console.log('NFe emitida com sucesso:', result);
      
      // Se configurado para envio automático
      if (this.config.auto_send) {
        await this.sendNFe(companyId, result.id);
      }

      // Se configurado para notificação por email
      if (this.config.email_notification && nfeData.customer.email) {
        await this.sendNFeByEmail(companyId, result.id, nfeData.customer.email);
      }

      return result;
    } catch (error: any) {
      console.error('Erro ao emitir NFe:', error);
      throw new Error(`Erro ao emitir NFe: ${error.message}`);
    }
  }

  async issueNFeProduct(nfeData: any): Promise<any> {
    try {
      const companyId = this.config.company_cnpj.replace(/[^0-9]/g, '');
      
      const nfePayload = {
        company_id: companyId,
        product_invoice: {
          buyer: {
            federal_tax_number: nfeData.customer.document.replace(/[^0-9]/g, ''),
            name: nfeData.customer.name,
            email: nfeData.customer.email,
            address: nfeData.customer.address ? {
              street: nfeData.customer.address,
              number: nfeData.customer.number || 'S/N',
              neighborhood: nfeData.customer.neighborhood || '',
              city: nfeData.customer.city,
              state: nfeData.customer.state,
              postal_code: nfeData.customer.zipcode?.replace(/[^0-9]/g, ''),
              country: 'BRA'
            } : undefined
          },
          items: nfeData.items.map((item: any) => ({
            product_code: item.code || item.product_id,
            description: item.description,
            unit_of_measurement: item.unit_of_measurement || 'UN',
            quantity: item.quantity,
            unit_cost_value: item.unit_value,
            total_value: item.total_value,
            ncm_code: item.ncm_code,
            cfop_code: item.cfop || this.config.default_cfop || '5102',
            icms_tax_situation: item.icms_tax_situation || '00',
            icms_tax_percentage: item.icms_tax_percentage || 0,
            ipi_tax_situation: item.ipi_tax_situation || '99',
            ipi_tax_percentage: item.ipi_tax_percentage || 0,
            pis_tax_situation: item.pis_tax_situation || '99',
            pis_tax_percentage: item.pis_tax_percentage || 0,
            cofins_tax_situation: item.cofins_tax_situation || '99',
            cofins_tax_percentage: item.cofins_tax_percentage || 0
          })),
          serie: this.config.nfe_series || '1',
          issue_date: nfeData.issue_date || new Date().toISOString(),
          nature_operation: nfeData.nature_operation || 'Venda de mercadoria',
          additional_information: nfeData.notes
        }
      };

      console.log('Emitindo NFe de produto com payload:', JSON.stringify(nfePayload, null, 2));
      
      const endpoint = `/companies/${companyId}/product_invoices`;
      const result = await this.makeRequest(endpoint, 'POST', nfePayload);
      
      console.log('NFe de produto emitida com sucesso:', result);
      
      return result;
    } catch (error: any) {
      console.error('Erro ao emitir NFe de produto:', error);
      throw new Error(`Erro ao emitir NFe de produto: ${error.message}`);
    }
  }

  async queryNFeStatus(nfeId: string): Promise<any> {
    try {
      const companyId = this.config.company_cnpj.replace(/[^0-9]/g, '');
      const result = await this.makeRequest(`/companies/${companyId}/service_invoices/${nfeId}`);
      return result;
    } catch (error: any) {
      throw new Error(`Erro ao consultar status da NFe: ${error.message}`);
    }
  }

  async queryNFeProductStatus(nfeId: string): Promise<any> {
    try {
      const companyId = this.config.company_cnpj.replace(/[^0-9]/g, '');
      const result = await this.makeRequest(`/companies/${companyId}/product_invoices/${nfeId}`);
      return result;
    } catch (error: any) {
      throw new Error(`Erro ao consultar status da NFe de produto: ${error.message}`);
    }
  }

  async cancelNFe(nfeId: string, reason: string): Promise<any> {
    try {
      const companyId = this.config.company_cnpj.replace(/[^0-9]/g, '');
      const payload = {
        justification: reason
      };
      const result = await this.makeRequest(`/companies/${companyId}/service_invoices/${nfeId}/cancel`, 'POST', payload);
      return result;
    } catch (error: any) {
      throw new Error(`Erro ao cancelar NFe: ${error.message}`);
    }
  }

  async cancelNFeProduct(nfeId: string, reason: string): Promise<any> {
    try {
      const companyId = this.config.company_cnpj.replace(/[^0-9]/g, '');
      const payload = {
        justification: reason
      };
      const result = await this.makeRequest(`/companies/${companyId}/product_invoices/${nfeId}/cancel`, 'POST', payload);
      return result;
    } catch (error: any) {
      throw new Error(`Erro ao cancelar NFe de produto: ${error.message}`);
    }
  }

  async downloadNFeXML(nfeId: string, isProduct: boolean = false): Promise<any> {
    try {
      const companyId = this.config.company_cnpj.replace(/[^0-9]/g, '');
      const endpoint = isProduct 
        ? `/companies/${companyId}/product_invoices/${nfeId}/xml`
        : `/companies/${companyId}/service_invoices/${nfeId}/xml`;
      
      const result = await this.makeRequest(endpoint);
      return result;
    } catch (error: any) {
      throw new Error(`Erro ao baixar XML: ${error.message}`);
    }
  }

  async downloadNFePDF(nfeId: string, isProduct: boolean = false): Promise<any> {
    try {
      const companyId = this.config.company_cnpj.replace(/[^0-9]/g, '');
      const endpoint = isProduct 
        ? `/companies/${companyId}/product_invoices/${nfeId}/pdf`
        : `/companies/${companyId}/service_invoices/${nfeId}/pdf`;
      
      const result = await this.makeRequest(endpoint);
      return result;
    } catch (error: any) {
      throw new Error(`Erro ao baixar PDF: ${error.message}`);
    }
  }

  private async sendNFe(companyId: string, nfeId: string): Promise<any> {
    return await this.makeRequest(`/companies/${companyId}/service_invoices/${nfeId}/send`, 'POST');
  }

  private async sendNFeByEmail(companyId: string, nfeId: string, email: string): Promise<any> {
    const payload = { emails: [email] };
    return await this.makeRequest(`/companies/${companyId}/service_invoices/${nfeId}/send_email`, 'POST', payload);
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
    const { action, config, nfeData, nfeId, reason, format, isProduct } = await req.json();
    
    // Para test_connection, não é obrigatório ter config completo
    if (action !== 'test_connection' && (!config || !config.api_token)) {
      throw new Error('Configuração da NFE.io não encontrada');
    }

    const nfeService = new NFeIOService(config || { api_token: Deno.env.get('NFE_IO_API_TOKEN') || '' });

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

      case 'issue_nfe_product':
        if (!nfeData) throw new Error('Dados da NFe são obrigatórios');
        result = await nfeService.issueNFeProduct(nfeData);
        break;
        
      case 'query_status':
        if (!nfeId) throw new Error('ID da NFe é obrigatório');
        result = isProduct 
          ? await nfeService.queryNFeProductStatus(nfeId)
          : await nfeService.queryNFeStatus(nfeId);
        break;

      case 'cancel_nfe':
        if (!nfeId || !reason) throw new Error('ID da NFe e motivo do cancelamento são obrigatórios');
        result = isProduct 
          ? await nfeService.cancelNFeProduct(nfeId, reason)
          : await nfeService.cancelNFe(nfeId, reason);
        break;

      case 'download_xml':
        if (!nfeId) throw new Error('ID da NFe é obrigatório');
        result = await nfeService.downloadNFeXML(nfeId, isProduct);
        break;

      case 'download_pdf':
        if (!nfeId) throw new Error('ID da NFe é obrigatório');
        result = await nfeService.downloadNFePDF(nfeId, isProduct);
        break;
        
      default:
        throw new Error(`Ação não reconhecida: ${action}`);
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