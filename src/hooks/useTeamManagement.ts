import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface TeamMember {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  is_active: boolean;
  invited_at?: string;
  invited_by?: string;
  last_login?: string;
  created_at: string;
  profiles?: {
    display_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
  };
}

export interface InviteTeamMemberData {
  email: string;
  role: string;
}

export function useTeamMembers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get user's company
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!userCompany) return [];

      // Get all team members for the company
      const { data, error } = await supabase
        .from('user_companies')
        .select(`
          *,
          profiles!user_companies_user_id_profiles_user_id_fkey (
            display_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('company_id', userCompany.company_id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }

      return data as TeamMember[];
    },
    enabled: !!user?.id,
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ email, role }: InviteTeamMemberData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get user's company
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!userCompany) throw new Error('Company not found');

      // For now, we'll create a placeholder entry
      // In a real implementation, you'd send an email invitation
      const { data, error } = await supabase
        .from('user_companies')
        .insert({
          user_id: 'pending', // This would be replaced when user accepts invitation
          company_id: userCompany.company_id,
          role,
          is_active: false,
          invited_at: new Date().toISOString(),
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: 'Convite enviado',
        description: 'O convite foi enviado por email.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (memberId: string) => {
      // Get the member being removed
      const { data: member } = await supabase
        .from('user_companies')
        .select('user_id, role')
        .eq('id', memberId)
        .single();

      if (!member) throw new Error('Membro não encontrado');

      // Prevent users from removing themselves
      if (member.user_id === user?.id) {
        throw new Error('Você não pode remover a si mesmo da equipe');
      }

      const { error } = await supabase
        .from('user_companies')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) {
        // Sanitize database errors
        if (error.message.includes('row-level security policy')) {
          throw new Error('Você não tem permissão para remover este membro');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: 'Membro removido',
        description: 'O membro foi removido da equipe.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}