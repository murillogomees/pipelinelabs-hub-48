import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';

interface NFeConfig {
  api_token?: string;
  environment?: 'sandbox' | 'production';
  webhook_url?: string;
  timeout?: number;
  company_cnpj?: string;
  certificate_file?: File;
  certificate_password?: string;
  certificate_data?: any;
  nfe_series?: string;
  default_cfop?: string;
  auto_send?: boolean;
  email_notification?: boolean;
}

interface CertificateInfo {
  subject: string;
  issuer: string;
  valid_from: string;
  valid_to: string;
  serial_number: string;
  is_valid: boolean;
  days_until_expiry: number;
}

export const useNFeIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { companyId: userCompanyId } = useUserRole();
  const [testingConnection, setTestingConnection] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  // Buscar integração NFE.io disponível
  const { data: nfeIntegration, isLoading: isLoadingIntegration } = useQuery({
    queryKey: ['nfe-integration-available'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations_available')
        .select('*')
        .eq('name', 'NFE.io')
        .eq('type', 'fiscal')
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao carregar integração NFE.io:', error);
        throw error;
      }
      return data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });

  // Buscar configuração da empresa para NFE.io
  const { data: companyNFeConfig, isLoading } = useQuery({
    queryKey: ['company-nfe-integration', userCompanyId],
    queryFn: async () => {
      if (!nfeIntegration?.id || !userCompanyId) return null;
      
      const { data, error } = await supabase
        .from('company_integrations')
        .select('*')
        .eq('integration_id', nfeIntegration.id)
        .eq('company_id', userCompanyId)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao carregar configuração NFE da empresa:', error);
        throw error;
      }
      return data;
    },
    enabled: !!nfeIntegration?.id && !!userCompanyId,
    retry: 2,
    staleTime: 2 * 60 * 1000 // 2 minutos
  });

  // Salvar configuração NFE
  const { mutateAsync: saveNFeConfig, isPending: isSaving } = useMutation({
    mutationFn: async (config: NFeConfig) => {
      if (!nfeIntegration?.id) throw new Error('Integração NFE.io não encontrada');

      // Se é um certificado novo, fazer upload primeiro
      let certificateData = null;
      if (config.certificate_file) {
        certificateData = await uploadCertificate(config.certificate_file);
      }

      const configData = {
        ...config,
        certificate_data: certificateData,
        certificate_file: undefined // Remove o arquivo da config
      };

      if (companyNFeConfig?.id) {
        // Atualizar configuração existente
        const { data, error } = await supabase
          .from('company_integrations')
          .update({
            config: configData,
            updated_at: new Date().toISOString()
          })
          .eq('id', companyNFeConfig.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Criar nova configuração
        if (!userCompanyId) throw new Error('ID da empresa não encontrado');
        
        const { data, error } = await supabase
          .from('company_integrations')
          .insert({
            company_id: userCompanyId,
            integration_id: nfeIntegration.id,
            config: configData,
            is_active: true
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-nfe-integration'] });
      toast({
        title: 'Configuração salva',
        description: 'Configuração da NFE.io salva com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Upload de certificado
  const uploadCertificate = async (file: File): Promise<any> => {
    setUploadingCertificate(true);
    
    try {
      // Converter arquivo para base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const base64Data = await base64Promise;
      
      return {
        filename: file.name,
        data: base64Data,
        size: file.size,
        type: file.type
      };
    } finally {
      setUploadingCertificate(false);
    }
  };

  // Testar conexão com NFE.io
  const testConnection = async (config?: NFeConfig) => {
    setTestingConnection(true);
    
    try {
      const testConfig = config || companyNFeConfig?.config;
      if (!testConfig) throw new Error('Configuração não encontrada');

      const { data, error } = await supabase.functions.invoke('nfe-io-integration', {
        body: { 
          action: 'test_connection',
          config: testConfig 
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Conexão testada',
        description: 'Conexão com NFE.io estabelecida com sucesso!',
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro na conexão',
        description: error.message || 'Não foi possível conectar com a NFE.io',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setTestingConnection(false);
    }
  };

  // Validar certificado
  const { mutateAsync: validateCertificate } = useMutation({
    mutationFn: async (): Promise<CertificateInfo> => {
      if (!companyNFeConfig?.config) throw new Error('Configuração não encontrada');

      const { data, error } = await supabase.functions.invoke('nfe-io-integration', {
        body: { 
          action: 'validate_certificate',
          config: companyNFeConfig.config 
        }
      });
      
      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao validar certificado',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Emitir NFe
  const { mutateAsync: issueNFe } = useMutation({
    mutationFn: async (nfeData: any) => {
      if (!companyNFeConfig?.config) throw new Error('NFE.io não configurada');

      const { data, error } = await supabase.functions.invoke('nfe-io-integration', {
        body: { 
          action: 'issue_nfe',
          config: companyNFeConfig.config,
          nfeData 
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'NFe emitida',
        description: 'Nota fiscal eletrônica emitida com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao emitir NFe',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Consultar status da NFe
  const queryNFeStatus = async (nfeId: string) => {
    if (!companyNFeConfig?.config) throw new Error('NFE.io não configurada');

    const { data, error } = await supabase.functions.invoke('nfe-io-integration', {
      body: { 
        action: 'query_status',
        config: companyNFeConfig.config,
        nfeId 
      }
    });
    
    if (error) throw error;
    return data;
  };

  return {
    // Estados
    isLoading: isLoading || isLoadingIntegration,
    isSaving,
    testingConnection,
    uploadingCertificate,
    
    // Dados
    nfeIntegration,
    companyNFeConfig,
    
    // Funções
    saveNFeConfig,
    testConnection,
    validateCertificate,
    issueNFe,
    queryNFeStatus,
    
    // Utilitários
    isConfigured: !!companyNFeConfig?.config && !!companyNFeConfig?.is_active,
    isActive: !!companyNFeConfig?.is_active,
    getConfig: (): NFeConfig => {
      if (companyNFeConfig?.config && typeof companyNFeConfig.config === 'object') {
        return companyNFeConfig.config as NFeConfig;
      }
      return {};
    },
    
    hasValidConfig: (): boolean => {
      const config = companyNFeConfig?.config as NFeConfig;
      return !!(config?.api_token && config?.company_cnpj && config?.certificate_data);
    },
    
    // Status helpers
    getCertificateStatus: (): 'valid' | 'expired' | 'expiring' | 'invalid' | 'missing' => {
      const config = companyNFeConfig?.config as NFeConfig;
      if (!config?.certificate_data) return 'missing';
      
      // Implementar validação real do certificado
      // Por enquanto, retorna válido se existe
      return 'valid';
    }
  };
};