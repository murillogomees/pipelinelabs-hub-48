
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignupData {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  document: string;
  phone: string;
}

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Iniciando signup com dados:', { email: data.email, name: data.name });

      // Fazer signup básico
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/app/dashboard`,
          data: {
            display_name: data.name,
            document: data.document,
            phone: data.phone,
          }
        },
      });

      if (authError) {
        console.error('❌ Erro no signup:', authError);
        throw authError;
      }

      if (authData?.user) {
        console.log('✅ Usuário criado com sucesso:', authData.user.id);
        
        toast({
          title: 'Cadastro realizado!',
          description: 'Verifique seu email para confirmar a conta.',
        });

        return { success: true, user: authData.user };
      }

      throw new Error('Falha ao criar usuário');
    } catch (error: any) {
      console.error('❌ Erro completo no signup:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.message?.includes('already_registered') || error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message?.includes('invalid_email')) {
        errorMessage = 'Email inválido. Verifique e tente novamente.';
      } else if (error.message?.includes('weak_password') || error.message?.includes('Password should be at least')) {
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
      }

      toast({
        title: 'Erro no cadastro',
        description: errorMessage,
        variant: 'destructive',
      });

      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signup,
    isLoading,
  };
}
