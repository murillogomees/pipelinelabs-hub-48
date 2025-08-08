
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
  
  // Dados do usuário (para preencher campos pessoais)
  user_display_name?: string;
  user_email?: string;
  user_phone?: string;
  user_document?: string;
  
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
      console.log('🔄 Buscando dados completos da empresa e usuário para:', user.id);

      // Primeiro buscar dados do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('⚠️ Erro ao buscar perfil do usuário:', profileError);
      }

      console.log('📋 Dados do perfil encontrados:', profile);

      // Buscar a relação user_companies para encontrar a empresa
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
        .maybeSingle();

      console.log('🏢 Dados user_company:', userCompany);

      let companyInfo = null;
      let userRole = 'operador';
      let isActive = true;

      if (userCompanyError && userCompanyError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar user_company:', userCompanyError);
      }

      if (userCompany?.companies) {
        companyInfo = userCompany.companies;
        userRole = userCompany.role;
        isActive = userCompany.is_active;
      } else {
        // Se não encontrou user_company, tentar buscar empresa diretamente pelo user_id
        const { data: directCompany, error: directCompanyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (directCompanyError && directCompanyError.code !== 'PGRST116') {
          console.error('❌ Erro ao buscar empresa diretamente:', directCompanyError);
        }

        if (directCompany) {
          companyInfo = directCompany;
          userRole = 'contratante';
          isActive = true;
        }
      }

      // Se ainda não temos empresa, criar uma baseada nos dados do usuário
      if (!companyInfo && (profile || user)) {
        console.log('🆕 Nenhuma empresa encontrada, criando dados básicos');
        
        // Usar dados do auth.users como fallback
        const userData = user.user_metadata || {};
        
        companyInfo = {
          id: '', // Será preenchido quando salvar
          name: profile?.display_name || userData.display_name || userData.first_name + ' ' + userData.last_name || 'Minha Empresa',
          legal_name: profile?.display_name || userData.display_name || userData.first_name + ' ' + userData.last_name || '',
          document: profile?.document || '',
          email: profile?.email || user.email || '',
          phone: profile?.phone || '',
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        userRole = 'contratante';
        isActive = true;
      }

      if (!companyInfo) {
        console.log('❌ Nenhuma empresa encontrada e não foi possível criar dados básicos');
        setCompanyData(null);
        return;
      }

      console.log('✅ Empresa encontrada/criada:', companyInfo.name);

      // Buscar configurações da empresa se tiver ID
      let settings = null;
      if (companyInfo.id) {
        const { data: companySettings, error: settingsError } = await supabase
          .from('company_settings')
          .select('*')
          .eq('company_id', companyInfo.id)
          .maybeSingle();

        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('⚠️ Erro ao buscar configurações da empresa:', settingsError);
        }

        settings = companySettings;
      }

      // Montar dados completos combinando informações
      const completeData: CompanyCompleteData = {
        ...companyInfo,
        // Dados do usuário para preencher campos pessoais
        user_display_name: profile?.display_name || user.user_metadata?.display_name || user.user_metadata?.first_name + ' ' + user.user_metadata?.last_name || '',
        user_email: profile?.email || user.email || '',
        user_phone: profile?.phone || '',
        user_document: profile?.document || '',
        // Relacionamento
        user_company_role: userRole,
        user_company_active: isActive,
        // Configurações
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
  }, [user?.id, user?.email, user?.user_metadata]);

  const updateCompanyData = async (updateData: Partial<CompanyCompleteData>): Promise<boolean> => {
    if (!canEdit || !user?.id) {
      toast.error('Sem permissão para atualizar dados da empresa');
      return false;
    }

    try {
      setIsUpdating(true);
      console.log('🔄 Atualizando dados da empresa:', updateData);

      // Separar dados da empresa, usuário e configurações
      const { 
        settings: newSettings, 
        user_display_name, 
        user_email, 
        user_phone, 
        user_document,
        user_company_role,
        user_company_active,
        ...companyFields 
      } = updateData;

      let companyId = companyData?.id;

      // Se não temos uma empresa ainda, criar uma
      if (!companyId) {
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({
            ...companyFields,
            user_id: user.id,
            name: companyFields.name || 'Minha Empresa',
            document: companyFields.document || ''
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar empresa:', createError);
          toast.error('Erro ao criar empresa');
          return false;
        }

        companyId = newCompany.id;
        console.log('✅ Empresa criada com ID:', companyId);

        // Criar relação user_company
        const { error: relationError } = await supabase
          .from('user_companies')
          .insert({
            user_id: user.id,
            company_id: companyId,
            role: 'contratante',
            is_active: true
          });

        if (relationError) {
          console.error('❌ Erro ao criar relação user_company:', relationError);
        }
      } else {
        // Atualizar empresa existente
        if (Object.keys(companyFields).length > 0) {
          const { error: companyError } = await supabase
            .from('companies')
            .update({
              ...companyFields,
              updated_at: new Date().toISOString()
            })
            .eq('id', companyId);

          if (companyError) {
            console.error('❌ Erro ao atualizar empresa:', companyError);
            toast.error('Erro ao atualizar dados da empresa');
            return false;
          }
        }
      }

      // Atualizar dados do perfil do usuário se fornecidos
      if (user_display_name || user_email || user_phone || user_document) {
        const profileUpdates: any = {};
        if (user_display_name !== undefined) profileUpdates.display_name = user_display_name;
        if (user_email !== undefined) profileUpdates.email = user_email;
        if (user_phone !== undefined) profileUpdates.phone = user_phone;
        if (user_document !== undefined) profileUpdates.document = user_document;

        // Primeiro verificar se já existe um profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingProfile) {
          // Atualizar perfil existente
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              ...profileUpdates,
              company_id: companyId,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (profileError) {
            console.error('❌ Erro ao atualizar perfil:', profileError);
          }
        } else {
          // Criar novo perfil
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              company_id: companyId,
              ...profileUpdates
            });

          if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError);
          }
        }
      }

      // Atualizar configurações da empresa se fornecidas
      if (newSettings && companyId) {
        const { data: existingSettings } = await supabase
          .from('company_settings')
          .select('id')
          .eq('company_id', companyId)
          .maybeSingle();

        if (existingSettings) {
          // Atualizar configurações existentes
          const { error: settingsError } = await supabase
            .from('company_settings')
            .update({
              ...newSettings,
              updated_at: new Date().toISOString()
            })
            .eq('company_id', companyId);

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
              company_id: companyId,
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
        id: companyId || prev.id,
        user_display_name: user_display_name !== undefined ? user_display_name : prev.user_display_name,
        user_email: user_email !== undefined ? user_email : prev.user_email,
        user_phone: user_phone !== undefined ? user_phone : prev.user_phone,
        user_document: user_document !== undefined ? user_document : prev.user_document,
        settings: newSettings ? { ...prev.settings, ...newSettings } : prev.settings
      } : null);

      toast.success('Dados salvos com sucesso');
      console.log('✅ Dados da empresa e usuário atualizados com sucesso');
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
