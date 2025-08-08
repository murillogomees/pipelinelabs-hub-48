
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCache } from './useCache';
import { useOfflineSupport } from './useOfflineSupport';
import { toast } from 'sonner';

export interface ResilientCompanyData {
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
  
  // Dados do usuário
  user_display_name?: string;
  user_email?: string;
  user_phone?: string;
  user_document?: string;
  
  // Relacionamento
  user_company_role?: string;
  user_company_active?: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export function useResilientCompanyData() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const { addToQueue, isOnline } = useOfflineSupport();

  // Cache com fallback para dados do usuário
  const fallbackData: ResilientCompanyData | undefined = user ? {
    id: '',
    name: `${user.user_metadata?.first_name || 'Usuário'} ${user.user_metadata?.last_name || ''} - Empresa`.trim(),
    document: '',
    email: user.email || '',
    user_display_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Usuário',
    user_email: user.email || '',
    user_phone: user.user_metadata?.phone || '',
    user_document: user.user_metadata?.document || '',
    user_company_role: 'contratante',
    user_company_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : undefined;

  // Fetcher resiliente
  const fetchCompanyData = useCallback(async (): Promise<ResilientCompanyData> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('🔄 Fetching company data for user:', user.id);

      // Tentar buscar profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('⚠️ Profile fetch error (continuing):', profileError);
      }

      // Tentar buscar relação user_companies
      const { data: userCompany, error: userCompanyError } = await supabase
        .from('user_companies')
        .select(`
          company_id,
          role,
          is_active,
          companies!inner (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      let companyInfo = null;
      let userRole = 'contratante';
      let isActive = true;

      if (userCompanyError) {
        console.warn('⚠️ User company fetch error:', userCompanyError);
        
        // Se é erro de infraestrutura, propagar para retry
        if (userCompanyError.code === 'PGRST002') {
          throw userCompanyError;
        }
      }

      if (userCompany?.companies) {
        companyInfo = userCompany.companies;
        userRole = userCompany.role;
        isActive = userCompany.is_active;
      } else {
        // Tentar buscar empresa diretamente
        const { data: directCompany, error: directCompanyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (directCompanyError && directCompanyError.code !== 'PGRST116') {
          console.warn('⚠️ Direct company fetch error:', directCompanyError);
          if (directCompanyError.code === 'PGRST002') {
            throw directCompanyError;
          }
        }

        if (directCompany) {
          companyInfo = directCompany;
        }
      }

      // Se não encontrou empresa, criar dados básicos temporários
      if (!companyInfo) {
        console.log('📋 No company found, creating temporary data');
        companyInfo = {
          id: `temp_${user.id}`,
          name: fallbackData?.name || 'Minha Empresa',
          document: '',
          email: user.email || '',
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const result: ResilientCompanyData = {
        ...companyInfo,
        user_display_name: profile?.display_name || fallbackData?.user_display_name,
        user_email: profile?.email || user.email || '',
        user_phone: profile?.phone || fallbackData?.user_phone,
        user_document: profile?.document || fallbackData?.user_document,
        user_company_role: userRole,
        user_company_active: isActive
      };

      console.log('✅ Company data loaded:', result.name);
      return result;
    } catch (error: any) {
      console.error('❌ Error fetching company data:', error);
      
      // Se é erro de infraestrutura, propagar para usar cache
      if (error.code === 'PGRST002') {
        throw error;
      }
      
      // Para outros erros, retornar fallback se disponível
      if (fallbackData) {
        console.log('🔄 Using fallback data due to error');
        return fallbackData;
      }
      
      throw error;
    }
  }, [user?.id, user?.email, user?.user_metadata, fallbackData]);

  // Hook de cache com configuração resiliente
  const {
    data: companyData,
    isLoading,
    error,
    updateCache,
    invalidateCache
  } = useCache({
    key: `company-complete-${user?.id}`,
    fetcher: fetchCompanyData,
    ttl: 600000, // 10 minutos
    staleTime: 120000, // 2 minutos
    enabled: !!user?.id,
    fallbackData
  });

  // Função de atualização resiliente
  const updateCompanyData = useCallback(async (updateData: Partial<ResilientCompanyData>): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    // Verificar permissões
    const canEdit = companyData?.user_company_role === 'contratante' || 
                    companyData?.user_company_role === 'super_admin' ||
                    companyData?.user_id === user.id;

    if (!canEdit) {
      toast.error('Sem permissão para atualizar dados da empresa');
      return false;
    }

    setIsUpdating(true);

    try {
      // Se offline, adicionar à queue
      if (!isOnline) {
        addToQueue({
          type: 'update',
          table: 'companies',
          data: updateData
        });

        // Atualizar cache local
        if (companyData) {
          const updatedData = { ...companyData, ...updateData };
          updateCache(updatedData);
        }

        toast.success('Dados salvos localmente. Serão sincronizados quando voltar online.');
        return true;
      }

      console.log('🔄 Updating company data:', updateData);

      // Separar tipos de dados
      const {
        user_display_name,
        user_email,
        user_phone,
        user_document,
        user_company_role,
        user_company_active,
        ...companyFields
      } = updateData;

      let companyId = companyData?.id;

      // Se não tem empresa ainda ou é temporária, criar uma real
      if (!companyId || companyId.startsWith('temp_')) {
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({
            ...companyFields,
            user_id: user.id,
            name: companyFields.name || companyData?.name || 'Minha Empresa',
            document: companyFields.document || ''
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating company:', createError);
          throw createError;
        }

        companyId = newCompany.id;

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
          console.warn('⚠️ Error creating user_company relation:', relationError);
        }
      } else if (Object.keys(companyFields).length > 0) {
        // Atualizar empresa existente
        const { error: updateError } = await supabase
          .from('companies')
          .update({
            ...companyFields,
            updated_at: new Date().toISOString()
          })
          .eq('id', companyId);

        if (updateError) {
          console.error('❌ Error updating company:', updateError);
          throw updateError;
        }
      }

      // Atualizar profile se necessário
      if (user_display_name || user_email || user_phone || user_document) {
        const profileUpdates: any = {};
        if (user_display_name !== undefined) profileUpdates.display_name = user_display_name;
        if (user_email !== undefined) profileUpdates.email = user_email;
        if (user_phone !== undefined) profileUpdates.phone = user_phone;
        if (user_document !== undefined) profileUpdates.document = user_document;

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            company_id: companyId,
            ...profileUpdates,
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.warn('⚠️ Error updating profile:', profileError);
        }
      }

      // Atualizar cache local
      if (companyData) {
        const updatedData = {
          ...companyData,
          ...companyFields,
          id: companyId || companyData.id,
          user_display_name: user_display_name !== undefined ? user_display_name : companyData.user_display_name,
          user_email: user_email !== undefined ? user_email : companyData.user_email,
          user_phone: user_phone !== undefined ? user_phone : companyData.user_phone,
          user_document: user_document !== undefined ? user_document : companyData.user_document,
          updated_at: new Date().toISOString()
        };
        updateCache(updatedData);
      }

      toast.success('Dados salvos com sucesso');
      console.log('✅ Company data updated successfully');
      return true;

    } catch (error: any) {
      console.error('❌ Error updating company data:', error);
      
      if (error.code === 'PGRST002') {
        // Erro de infraestrutura - salvar offline
        addToQueue({
          type: 'update',
          table: 'companies',
          data: updateData
        });

        if (companyData) {
          const updatedData = { ...companyData, ...updateData };
          updateCache(updatedData);
        }

        toast.error('Problema de conexão. Dados salvos localmente e serão sincronizados quando possível.');
        return true;
      }

      toast.error('Erro ao salvar dados da empresa');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [user?.id, companyData, isOnline, addToQueue, updateCache]);

  // Determinar permissões
  const canEdit = companyData?.user_company_role === 'contratante' || 
                  companyData?.user_company_role === 'super_admin' ||
                  companyData?.user_id === user?.id;

  return {
    companyData,
    isLoading,
    isUpdating,
    error,
    canEdit,
    updateCompanyData,
    invalidateCache,
    refetch: () => invalidateCache()
  };
}
