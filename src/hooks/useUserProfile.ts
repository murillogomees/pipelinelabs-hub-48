
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/Auth/AuthProvider';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  display_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    },
    enabled: !!user?.id,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: UpdateProfileData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
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

export function useChangePassword() {
  const { toast } = useToast();

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'A senha deve conter pelo menos um número';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'A senha deve conter pelo menos um caractere especial (@$!%*?&)';
    }
    return null;
  };

  const sanitizeErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes('New password should be different from the old password')) {
      return 'A nova senha deve ser diferente da atual';
    }
    if (errorMessage.includes('Password should be at least')) {
      return 'A senha não atende aos requisitos de segurança';
    }
    return 'Erro ao alterar senha. Verifique se a senha atual está correta.';
  };

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      // Validate new password strength
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      // Verify current password by attempting to sign in
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error('Usuário não encontrado');

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Senha atual incorreta');
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso.',
      });
    },
    onError: (error: any) => {
      const sanitizedMessage = error.message.includes('A senha deve') ? 
        error.message : 
        sanitizeErrorMessage(error.message);
      
      toast({
        title: 'Erro',
        description: sanitizedMessage,
        variant: 'destructive',
      });
    },
  });
}
