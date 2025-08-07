
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

      // Fazer signup básico primeiro
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/app/dashboard`
        },
      });

      if (authError) {
        console.error('❌ Erro no signup:', authError);
        throw authError;
      }

      if (authData?.user) {
        console.log('✅ Usuário criado com sucesso:', authData.user.id);
        
        // Aguardar um pouco para dar tempo aos triggers executarem
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Tentar criar perfil manualmente se não existir
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', authData.user.id)
            .single();

          if (!existingProfile) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                user_id: authData.user.id,
                email: data.email,
                display_name: data.name,
                phone: data.phone,
                document: data.document,
                document_type: data.document?.length === 11 ? 'cpf' : 'cnpj',
                person_type: 'individual',
                is_active: true
              });

            if (profileError) {
              console.error('❌ Erro ao criar perfil:', profileError);
            }
          }
        } catch (profileErr) {
          console.error('❌ Erro ao verificar/criar perfil:', profileErr);
        }
        
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
