import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserFormData } from '../types';

export function useUserManagement(onSave: () => void, onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

    // Aguardar um pouco para o trigger criar o perfil
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Atualizar o perfil com os dados do formulário
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: formData.display_name,
        phone: formData.phone,
        is_active: formData.is_active
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      // Error updating profile
      toast({
        title: "Aviso",
        description: "Usuário criado, mas falha ao atualizar perfil",
        variant: "destructive",
      });
    }

    // Obter a empresa do usuário atual para fallback
    const { data: currentUserCompany } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (currentUserCompany) {
      // Criar associação do novo usuário com a empresa selecionada
      const { error: companyError } = await supabase
        .from('user_companies')
        .insert({
          user_id: authData.user.id,
          company_id: formData.company_id || currentUserCompany.company_id,
          role: formData.role,
          permissions: formData.permissions,
          is_active: formData.is_active
        });

      if (companyError) {
        // Error associating user to company
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

    onSave();
    onClose();
  };

  const updateUser = async (user: any, formData: UserFormData) => {
    // Atualizar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: formData.display_name,
        phone: formData.phone,
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
        role: formData.role,
        permissions: formData.permissions,
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

    // Se foi fornecida uma nova senha, atualizar
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

    onSave();
    onClose();
  };

  const handleSubmit = async (user: any, formData: UserFormData) => {
    // Validar se empresa foi selecionada para novos usuários
    if (!user && !formData.company_id) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa para o usuário",
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
      // Error saving user
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
    handleSubmit
  };
}