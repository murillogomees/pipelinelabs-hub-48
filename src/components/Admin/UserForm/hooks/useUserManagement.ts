
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserFormData } from '../types';

export function useUserManagement(onSave?: () => void, onClose?: () => void) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch companies
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies-for-user-form'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch access levels
  const { data: accessLevels = [], isLoading: isLoadingAccessLevels } = useQuery({
    queryKey: ['access-levels-for-user-form'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_levels')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const createUser = async (formData: UserFormData) => {
    // Criar o usuário no auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          display_name: formData.display_name
        }
      }
    });

    if (authError) {
      toast({
        title: "Erro",
        description: authError.message,
        variant: "destructive",
      });
      return;
    }

    if (!authData.user) {
      toast({
        title: "Erro",
        description: "Falha ao criar usuário",
        variant: "destructive",
      });
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Atualizar o perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: formData.display_name,
        is_active: formData.is_active
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      toast({
        title: "Aviso",
        description: "Usuário criado, mas falha ao atualizar perfil",
        variant: "destructive",
      });
    }

    // Obter empresa do usuário atual para fallback
    const { data: currentUserCompany } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (currentUserCompany) {
      // Criar associação com empresa e nível de acesso
      const { error: companyError } = await supabase
        .from('user_companies')
        .insert({
          user_id: authData.user.id,
          company_id: formData.company_id || currentUserCompany.company_id,
          user_type: formData.user_type,
          access_level_id: formData.access_level_id,
          permissions: formData.permissions,
          specific_permissions: formData.permissions,
          role: formData.user_type === 'contratante' ? 'admin' : 'user',
          is_active: formData.is_active
        });

      if (companyError) {
        toast({
          title: "Aviso",
          description: "Usuário criado, mas falha ao associar à empresa",
          variant: "destructive",
        });
      }
    }

    toast({
      title: "Sucesso",
      description: "Usuário criado com sucesso",
    });

    if (onSave) onSave();
    if (onClose) onClose();
  };

  const updateUser = async (user: any, formData: UserFormData) => {
    // Atualizar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: formData.display_name,
        is_active: formData.is_active
      })
      .eq('user_id', user.user_id);

    if (profileError) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil",
        variant: "destructive",
      });
      return;
    }

    // Atualizar associação com empresa
    const { error: companyError } = await supabase
      .from('user_companies')
      .update({
        user_type: formData.user_type,
        access_level_id: formData.access_level_id,
        permissions: formData.permissions,
        specific_permissions: formData.permissions,
        role: formData.user_type === 'contratante' ? 'admin' : 'user',
        is_active: formData.is_active
      })
      .eq('user_id', user.user_id);

    if (companyError) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar dados da empresa",
        variant: "destructive",
      });
      return;
    }

    // Atualizar senha se fornecida
    if (formData.password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        user.user_id,
        { password: formData.password }
      );

      if (passwordError) {
        toast({
          title: "Aviso",
          description: "Dados atualizados, mas falha ao alterar senha",
          variant: "destructive",
        });
      }
    }

    toast({
      title: "Sucesso",
      description: "Usuário atualizado com sucesso",
    });

    if (onSave) onSave();
    if (onClose) onClose();
  };

  const handleSubmit = async (user: any, formData: UserFormData) => {
    if (!user && (!formData.company_id || !formData.access_level_id)) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa e nível de acesso para o usuário",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      if (user) {
        await updateUser(user, formData);
      } else {
        await createUser(formData);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    companies,
    accessLevels,
    isLoadingCompanies,
    isLoadingAccessLevels,
    handleSubmit
  };
}
