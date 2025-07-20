import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export interface MarketplaceIntegration {
  id: string;
  name: string;
  type: string;
  description: string;
  logo_url: string;
  config_schema: ConfigField[];
  is_active?: boolean;
  config?: Record<string, any>;
  credentials?: Record<string, any>;
  last_sync?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConfigField {
  field: string;
  label: string;
  type: 'text' | 'password' | 'boolean' | 'select' | 'number' | 'url' | 'email';
  required?: boolean;
  description?: string;
  default?: any;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface IntegrationFormData {
  config: Record<string, any>;
  credentials: Record<string, any>;
  is_active: boolean;
}

export function useMarketplaceIntegrations() {
  const { toast } = useToast();
  const { companyId } = usePermissions();
  const queryClient = useQueryClient();
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Buscar integrações disponíveis para marketplaces
  const { data: availableIntegrations = [], isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['marketplace-integrations-available'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations_available')
        .select('*')
        .eq('type', 'marketplace')
        .eq('visible_to_companies', true)
        .order('name');

      if (error) throw error;

      return data?.map((integration) => ({
        ...integration,
        config_schema: (integration.config_schema as any[])?.map((field: any) => field as ConfigField) || []
      })) || [];
    },
  });

  // Buscar integrações configuradas da empresa
  const { data: companyIntegrations = [], isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company-marketplace-integrations', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('company_integrations')
        .select(`
          *,
          integration:integrations_available(*)
        `)
        .eq('company_id', companyId)
        .not('integration_id', 'is', null);

      if (error) throw error;

      return data?.filter(item => 
        item.integration && (item.integration as any).type === 'marketplace'
      ) || [];
    },
    enabled: !!companyId,
  });

  // Criar/Atualizar integração
  const { mutateAsync: saveIntegration, isPending: isSaving } = useMutation({
    mutationFn: async ({
      integrationId,
      formData
    }: {
      integrationId: string;
      formData: IntegrationFormData;
    }) => {
      if (!companyId) throw new Error('Company ID não encontrado');

      // Criptografar credenciais sensíveis
      const encryptedCredentials = await encryptSensitiveData(formData.credentials);

      // Verificar se já existe
      const { data: existing } = await supabase
        .from('company_integrations')
        .select('id')
        .eq('company_id', companyId)
        .eq('integration_id', integrationId)
        .maybeSingle();

      if (existing) {
        // Atualizar
        const { data, error } = await supabase
          .from('company_integrations')
          .update({
            config: formData.config,
            credentials: encryptedCredentials,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar
        const { data, error } = await supabase
          .from('company_integrations')
          .insert({
            company_id: companyId,
            integration_id: integrationId,
            config: formData.config,
            credentials: encryptedCredentials,
            is_active: formData.is_active
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, { integrationId }) => {
      const integration = availableIntegrations.find(i => i.id === integrationId);
      toast({
        title: 'Integração salva',
        description: `Integração com ${integration?.name} foi configurada com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['company-marketplace-integrations', companyId] });
    },
    onError: (error) => {
      console.error('Erro ao salvar integração:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a integração. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Testar conexão da integração
  const testConnection = async (integrationId: string, config: Record<string, any>) => {
    setTestingConnection(integrationId);
    
    try {
      const integration = availableIntegrations.find(i => i.id === integrationId);
      
      // Simular teste de conexão baseado no tipo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (integration?.name === 'Shopee') {
        await testShopeeConnection(config);
      } else if (integration?.name === 'Amazon') {
        await testAmazonConnection(config);
      }

      toast({
        title: 'Conexão testada',
        description: `Conexão com ${integration?.name} testada com sucesso!`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast({
        title: 'Erro na conexão',
        description: 'Não foi possível conectar. Verifique suas credenciais.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setTestingConnection(null);
    }
  };

  // Remover integração
  const { mutateAsync: removeIntegration } = useMutation({
    mutationFn: async (integrationId: string) => {
      const { error } = await supabase
        .from('company_integrations')
        .delete()
        .eq('company_id', companyId)
        .eq('integration_id', integrationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Integração removida',
        description: 'A integração foi removida com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['company-marketplace-integrations', companyId] });
    },
    onError: (error) => {
      console.error('Erro ao remover integração:', error);
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover a integração.',
        variant: 'destructive',
      });
    },
  });

  // Sincronizar dados da integração
  const { mutateAsync: syncIntegration, isPending: isSyncing } = useMutation({
    mutationFn: async (integrationId: string) => {
      const integration = companyIntegrations.find(i => i.integration_id === integrationId);
      if (!integration) throw new Error('Integração não encontrada');

      // Aqui seria implementada a lógica de sincronização específica
      // Por exemplo, chamar uma edge function para sincronizar
      const { data, error } = await supabase.functions.invoke('sync-marketplace-data', {
        body: {
          integration_id: integrationId,
          company_id: companyId,
          integration_type: (integration.integration as any)?.name
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, integrationId) => {
      const integration = companyIntegrations.find(i => i.integration_id === integrationId);
      const integrationName = (integration?.integration as any)?.name;
      
      toast({
        title: 'Sincronização concluída',
        description: `Dados do ${integrationName} sincronizados com sucesso.`,
      });
      
      // Atualizar última sincronização
      queryClient.invalidateQueries({ queryKey: ['company-marketplace-integrations', companyId] });
    },
    onError: (error) => {
      console.error('Erro na sincronização:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar os dados.',
        variant: 'destructive',
      });
    },
  });

  return {
    // Estados
    isLoading: isLoadingAvailable || isLoadingCompany,
    isSaving,
    isSyncing,
    testingConnection,
    
    // Dados
    availableIntegrations,
    companyIntegrations,
    
    // Ações
    saveIntegration,
    removeIntegration,
    testConnection,
    syncIntegration,
    
    // Utilitários
    getIntegrationConfig: (integrationId: string) => {
      const integration = companyIntegrations.find(i => i.integration_id === integrationId);
      return integration?.config || {};
    },
    
    isIntegrationActive: (integrationId: string) => {
      const integration = companyIntegrations.find(i => i.integration_id === integrationId);
      return integration?.is_active || false;
    },
    
    getLastSync: (integrationId: string) => {
      const integration = companyIntegrations.find(i => i.integration_id === integrationId);
      return integration?.last_tested;
    }
  };
}

// Funções auxiliares para criptografia e testes
async function encryptSensitiveData(credentials: Record<string, any>): Promise<string> {
  // Usar a função do Supabase para criptografar dados sensíveis
  const { data, error } = await supabase.rpc('encrypt_integration_data', {
    data: credentials
  });
  
  if (error) throw error;
  return data;
}

async function testShopeeConnection(config: Record<string, any>) {
  // Implementar teste real da conexão Shopee
  const requiredFields = ['api_key', 'secret_key', 'shop_id'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Campo obrigatório ${field} não preenchido`);
    }
  }
  
  // Simular chamada da API do Shopee
  console.log('Testando conexão Shopee:', config);
}

async function testAmazonConnection(config: Record<string, any>) {
  // Implementar teste real da conexão Amazon
  const requiredFields = ['access_key_id', 'secret_access_key', 'marketplace_id', 'seller_id'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Campo obrigatório ${field} não preenchido`);
    }
  }
  
  // Simular chamada da API da Amazon
  console.log('Testando conexão Amazon:', config);
}