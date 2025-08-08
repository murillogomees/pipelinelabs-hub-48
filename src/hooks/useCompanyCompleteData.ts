
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface CompanyCompleteData {
  // Dados principais da empresa
  id: string;
  name: string;
  legal_name?: string;
  trade_name?: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipcode?: string;
  state_registration?: string;
  municipal_registration?: string;
  tax_regime?: string;
  legal_representative?: string;
  fiscal_email?: string;
  user_id?: string;
  
  // Configurações da empresa
  settings?: {
    nfe_environment?: string;
    nfe_api_token?: string;
    certificate_data?: string;
    certificate_password?: string;
    stripe_publishable_key?: string;
    stripe_secret_key?: string;
    cdn_enabled?: boolean;
    cdn_url_base?: string;
  };
  
  // Relacionamento com usuário
  user_company_role?: string;
  user_company_active?: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

interface UseCompanyCompleteDataReturn {
  companyData: CompanyCompleteData | null;
  isLoading: boolean;
  isUpdating: boolean;
  canEdit: boolean;
  updateCompanyData: (data: Partial<CompanyCompleteData>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useCompanyCompleteData(): UseCompanyCompleteDataReturn {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState<CompanyCompleteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCompanyCompleteData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      console.log('🔄 Buscando dados completos da empresa para usuário:', user.id);

      // Primeiro buscar a relação user_companies para encontrar a empresa
      const { data: userCompany, error: userCompanyError } = await supabase
        .from('user_companies')
        .select(`
          company_id,
          role,
          is_active,
          companies!inner (
            id,
            name,
            legal_name,
            trade_name,
            document,
            email,
            phone,
            address,
            city,
            zipcode,
            state_registration,
            municipal_registration,
            tax_regime,
            legal_representative,
            fiscal_email,
            user_id,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (userCompanyError) {
        console.error('❌ Erro ao buscar user_company:', userCompanyError);
        
        // Se não encontrou user_company, tentar buscar empresa diretamente pelo user_id
        const { data: directCompany, error: directCompanyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (directCompanyError) {
          console.error('❌ Erro ao buscar empresa diretamente:', directCompanyError);
          setCompanyData(null);
          return;
        }

        if (directCompany) {
          setCompanyData({
            ...directCompany,
            user_company_role: 'contratante',
            user_company_active: true
          });
        }
        return;
      }

      if (!userCompany || !userCompany.companies) {
        console.log('❌ Nenhuma empresa encontrada para o usuário');
        setCompanyData(null);
        return;
      }

      const company = userCompany.companies;
      console.log('✅ Empresa encontrada:', company.name);

      // Buscar configurações da empresa
      const { data: settings, error: settingsError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', company.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('⚠️ Erro ao buscar configurações da empresa:', settingsError);
      }

      // Montar dados completos
      const completeData: CompanyCompleteData = {
        ...company,
        user_company_role: userCompany.role,
        user_company_active: userCompany.is_active,
        settings: settings ? {
          nfe_environment: settings.nfe_environment,
          nfe_api_token: settings.nfe_api_token,
          certificate_data: settings.certificate_data,
          certificate_password: settings.certificate_password,
          stripe_publishable_key: settings.stripe_publishable_key,
          stripe_secret_key: settings.stripe_secret_key,
          cdn_enabled: settings.cdn_enabled,
          cdn_url_base: settings.cdn_url_base
        } : undefined
      };

      console.log('✅ Dados completos carregados:', completeData);
      setCompanyData(completeData);

    } catch (error) {
      console.error('❌ Erro inesperado ao buscar dados da empresa:', error);
      toast.error('Erro ao carregar dados da empresa');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateCompanyData = async (updateData: Partial<CompanyCompleteData>): Promise<boolean> => {
    if (!companyData?.id || !canEdit) {
      toast.error('Sem permissão para atualizar dados da empresa');
      return false;
    }

    try {
      setIsUpdating(true);
      console.log('🔄 Atualizando dados da empresa:', updateData);

      // Separar dados da empresa dos dados de configurações
      const { settings: newSettings, ...companyFields } = updateData;

      // Atualizar dados principais da empresa
      if (Object.keys(companyFields).length > 0) {
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            ...companyFields,
            updated_at: new Date().toISOString()
          })
          .eq('id', companyData.id);

        if (companyError) {
          console.error('❌ Erro ao atualizar empresa:', companyError);
          toast.error('Erro ao atualizar dados da empresa');
          return false;
        }
      }

      // Atualizar configurações da empresa se fornecidas
      if (newSettings) {
        const { data: existingSettings } = await supabase
          .from('company_settings')
          .select('id')
          .eq('company_id', companyData.id)
          .single();

        if (existingSettings) {
          // Atualizar configurações existentes
          const { error: settingsError } = await supabase
            .from('company_settings')
            .update({
              ...newSettings,
              updated_at: new Date().toISOString()
            })
            .eq('company_id', companyData.id);

          if (settingsError) {
            console.error('❌ Erro ao atualizar configurações:', settingsError);
            toast.error('Erro ao atualizar configurações da empresa');
            return false;
          }
        } else {
          // Criar novas configurações
          const { error: settingsError } = await supabase
            .from('company_settings')
            .insert({
              company_id: companyData.id,
              ...newSettings
            });

          if (settingsError) {
            console.error('❌ Erro ao criar configurações:', settingsError);
            toast.error('Erro ao criar configurações da empresa');
            return false;
          }
        }
      }

      // Atualizar estado local
      setCompanyData(prev => prev ? {
        ...prev,
        ...companyFields,
        settings: newSettings ? { ...prev.settings, ...newSettings } : prev.settings
      } : null);

      toast.success('Dados da empresa atualizados com sucesso');
      console.log('✅ Dados da empresa atualizados com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar:', error);
      toast.error('Erro inesperado ao atualizar dados');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const refetch = async () => {
    await fetchCompanyCompleteData();
  };

  // Verificar se o usuário pode editar
  const canEdit = companyData?.user_company_role === 'contratante' || 
                  companyData?.user_company_role === 'super_admin' ||
                  companyData?.user_id === user?.id;

  useEffect(() => {
    fetchCompanyCompleteData();
  }, [fetchCompanyCompleteData]);

  return {
    companyData,
    isLoading,
    isUpdating,
    canEdit,
    updateCompanyData,
    refetch
  };
}
