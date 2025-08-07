
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

export interface User {
  user_id: string;
  email: string;
  display_name?: string;
  document?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  last_sign_in_at?: string;
  company_id?: string;
  company_name?: string;
  role: string;
  access_level_id?: string;
  access_level_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  document: string;
}

export interface AccessLevel {
  id: string;
  name: string;
  display_name: string;
  permissions: any;
}

export const useUsersQuery = () => {
  const queryClient = useQueryClient();
  const { isSuperAdmin, currentCompanyId } = usePermissions();

  // Query para buscar usuários
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      // Buscar profiles com informações de empresa e nível de acesso
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          email,
          display_name,
          document,
          phone,
          avatar_url,
          is_active,
          created_at,
          updated_at,
          access_level_id,
          access_levels!access_level_id (
            id,
            name,
            display_name
          )
        `);

      if (profilesError) throw profilesError;

      // Buscar associações de usuários com empresas
      const { data: userCompanies, error: userCompaniesError } = await supabase
        .from('user_companies')
        .select(`
          user_id,
          company_id,
          role,
          is_active,
          companies (
            id,
            name,
            document
          )
        `)
        .eq('is_active', true);

      if (userCompaniesError) throw userCompaniesError;

      // Combinar dados
      const usersData = profiles?.map(profile => {
        const userCompany = userCompanies?.find(uc => uc.user_id === profile.user_id);
        
        return {
          user_id: profile.user_id,
          email: profile.email,
          display_name: profile.display_name,
          document: profile.document,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          is_active: profile.is_active,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          access_level_id: profile.access_level_id,
          company_id: userCompany?.company_id,
          company_name: userCompany?.companies?.name,
          role: userCompany?.role || 'operador',
          access_level_name: (profile as any).access_levels?.display_name
        };
      }) || [];

      return usersData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar empresas (apenas para super admin)
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async (): Promise<Company[]> => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, document')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: isSuperAdmin,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Query para buscar níveis de acesso
  const { data: accessLevels = [] } = useQuery({
    queryKey: ['access_levels'],
    queryFn: async (): Promise<AccessLevel[]> => {
      const { data, error } = await supabase
        .from('access_levels')
        .select('id, name, display_name, permissions')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutation para criar usuário
  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      display_name: string;
      document?: string;
      phone?: string;
      company_id?: string;
      role: string;
      access_level_id: string;
    }) => {
      // 1. Criar usuário no auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) throw authError;
      if (!authUser.user) throw new Error('Falha ao criar usuário');

      // Garantir que temos um company_id (usar currentCompanyId se não fornecido)
      const companyId = userData.company_id || currentCompanyId;
      
      if (!companyId) {
        throw new Error('Company ID é obrigatório para criar usuário');
      }

      // 2. Criar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authUser.user.id,
          email: userData.email,
          display_name: userData.display_name,
          document: userData.document,
          phone: userData.phone,
          access_level_id: userData.access_level_id,
          company_id: companyId, // Agora incluindo company_id
          is_active: true
        });

      if (profileError) throw profileError;

      // 3. Criar associação com empresa
      if (companyId) {
        const { error: companyError } = await supabase
          .from('user_companies')
          .insert({
            user_id: authUser.user.id,
            company_id: companyId,
            role: userData.role,
            is_active: true
          });

        if (companyError) throw companyError;
      }

      return authUser.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      userData 
    }: { 
      userId: string; 
      userData: {
        display_name?: string;
        document?: string;
        phone?: string;
        company_id?: string;
        role?: string;
        access_level_id?: string;
      }
    }) => {
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: userData.display_name,
          document: userData.document,
          phone: userData.phone,
          access_level_id: userData.access_level_id,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Atualizar associação com empresa se necessário
      if (userData.company_id && userData.role) {
        const { error: companyError } = await supabase
          .from('user_companies')
          .upsert({
            user_id: userId,
            company_id: userData.company_id,
            role: userData.role,
            is_active: true
          });

        if (companyError) throw companyError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation para deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Primeiro, deletar associações
      const { error: companyError } = await supabase
        .from('user_companies')
        .delete()
        .eq('user_id', userId);

      if (companyError) throw companyError;

      // Depois, deletar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Por último, deletar usuário do auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) throw authError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation para alterar status do usuário
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users,
    companies,
    accessLevels,
    isLoading,
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    toggleUserStatus: (userId: string, isActive: boolean) => 
      toggleUserStatusMutation.mutateAsync({ userId, isActive }),
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isToggling: toggleUserStatusMutation.isPending,
  };
};
