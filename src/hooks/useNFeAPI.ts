import { useMutation, useQuery } from '@tanstack/react-query';
import { useNFeIntegration } from './useNFeIntegration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

interface NFeData {
  customer: {
    name: string;
    document: string;
    email?: string;
    address?: {
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipcode: string;
    };
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_value: number;
    total_value: number;
    ncm_code?: string;
    cfop?: string;
  }>;
  invoice_number: string;
  company_name: string;
  company_email?: string;
}

interface NFeResponse {
  id: string;
  status: string;
  invoice_number: string;
  access_key?: string;
  message: string;
}

export const useNFeAPI = () => {
  const { companyNFeConfig, getConfig } = useNFeIntegration();
  const { companyId } = useUserRole();
  const { toast } = useToast();

  // Emitir NFe
  const { mutateAsync: emitirNFe, isPending: isEmitting } = useMutation({
    mutationFn: async (nfeData: NFeData): Promise<NFeResponse> => {
      const config = getConfig();
      
      if (!config.api_token || !config.company_cnpj) {
        throw new Error('Configuração NFE.io incompleta. Verifique as configurações.');
      }

      // Chamar edge function para emitir NFe
      const { data, error } = await supabase.functions.invoke('nfe-io-integration', {
        body: {
          action: 'issue_nfe',
          config,
          nfeData
        }
      });

      if (error) throw error;

      // Salvar NFe no banco de dados local
      const { error: dbError } = await supabase
        .from('invoices')
        .insert({
          company_id: companyId,
          invoice_number: data.invoice_number,
          invoice_type: 'NFE',
          status: data.status,
          access_key: data.access_key,
          total_amount: nfeData.items.reduce((sum, item) => sum + item.total_value, 0),
          issue_date: new Date().toISOString().split('T')[0],
          customer_id: null, // TODO: Implementar busca/criação de customer
          series: config.nfe_series || '001'
        });

      if (dbError) {
        console.error('Erro ao salvar NFe no banco:', dbError);
        // Não falhar a operação, apenas logar
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'NFe emitida com sucesso',
        description: `NFe ${data.invoice_number} foi enviada para processamento.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao emitir NFe',
        description: error.message || 'Erro desconhecido na emissão da NFe',
        variant: 'destructive',
      });
    }
  });

  // Consultar status de NFe
  const { mutateAsync: consultarStatus } = useMutation({
    mutationFn: async (nfeId: string) => {
      const config = getConfig();
      
      const { data, error } = await supabase.functions.invoke('nfe-io-integration', {
        body: {
          action: 'query_status',
          config,
          nfeId
        }
      });

      if (error) throw error;

      // Atualizar status no banco local
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: data.status,
          access_key: data.access_key,
          protocol_number: data.authorization_protocol,
          updated_at: new Date().toISOString()
        })
        .eq('invoice_number', data.id);

      if (updateError) {
        console.error('Erro ao atualizar status no banco:', updateError);
      }

      return data;
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao consultar status',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Cancelar NFe
  const { mutateAsync: cancelarNFe, isPending: isCancelling } = useMutation({
    mutationFn: async (nfeId: string) => {
      const config = getConfig();
      
      const { data, error } = await supabase.functions.invoke('nfe-io-integration', {
        body: {
          action: 'cancel_nfe',
          config,
          nfeId
        }
      });

      if (error) throw error;

      // Atualizar status no banco local
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('invoice_number', nfeId);

      if (updateError) {
        console.error('Erro ao atualizar cancelamento no banco:', updateError);
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'NFe cancelada',
        description: 'NFe foi cancelada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cancelar NFe',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Baixar PDF da NFe
  const { mutateAsync: baixarPDF } = useMutation({
    mutationFn: async (nfeId: string) => {
      const config = getConfig();
      
      const { data, error } = await supabase.functions.invoke('nfe-io-integration', {
        body: {
          action: 'download_pdf',
          config,
          nfeId
        }
      });

      if (error) throw error;

      // Criar link para download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NFe_${nfeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'PDF baixado',
        description: 'PDF da NFe foi baixado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao baixar PDF',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Listar NFes da empresa
  const { data: nfesEmpresas, isLoading: isLoadingNFes, refetch: refetchNFes } = useQuery({
    queryKey: ['company-nfes', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers(name, document)
        `)
        .eq('company_id', companyId)
        .eq('invoice_type', 'NFE')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
    staleTime: 30000 // 30 segundos
  });

  return {
    // Mutações
    emitirNFe,
    consultarStatus,
    cancelarNFe,
    baixarPDF,
    
    // Estados
    isEmitting,
    isCancelling,
    isLoadingNFes,
    
    // Dados
    nfesEmpresas,
    
    // Utilitários
    refetchNFes,
    isConfigured: !!companyNFeConfig?.is_active,
    hasValidConfiguration: () => {
      const config = getConfig();
      return !!(config.api_token && config.company_cnpj && config.certificate_data);
    }
  };
};