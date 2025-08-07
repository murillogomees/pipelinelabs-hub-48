
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthFormFields } from './components/AuthFormFields';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const AuthForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (formData: any) => {
    setIsLoading(true);
    try {
      console.log('🔄 Tentando login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        throw error;
      }

      if (data?.user) {
        console.log('✅ Login realizado com sucesso!');
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando para o dashboard...',
        });
        navigate('/app/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Verifique e tente novamente.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
      }
      
      toast({
        title: 'Erro no login',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (formData: any) => {
    setIsLoading(true);
    try {
      console.log('🔄 Iniciando cadastro...');

      // Fazer signup básico sem dados extras que podem causar problemas
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/app/dashboard`
        },
      });

      if (authError) {
        console.error('❌ Erro no signup auth:', authError);
        throw authError;
      }

      if (authData?.user) {
        console.log('✅ Usuário criado no auth:', authData.user.id);
        
        // Aguardar um pouco antes de tentar criar o perfil
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Criar perfil manualmente
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: authData.user.id,
              email: formData.email,
              display_name: formData.name,
              phone: formData.phone,
              document: formData.document,
              document_type: formData.document?.length === 11 ? 'cpf' : 'cnpj',
              person_type: 'individual',
              is_active: true
            });

          if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError);
          } else {
            console.log('✅ Perfil criado com sucesso');
          }
        } catch (profileErr) {
          console.error('❌ Erro ao criar perfil:', profileErr);
          // Não bloquear o cadastro se o perfil falhar
        }

        toast({
          title: '🎉 Cadastro realizado!',
          description: 'Verifique seu email para confirmar a conta.',
        });
        
        return;
      }

    } catch (error: any) {
      console.error('❌ Erro completo no cadastro:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.message?.includes('User already registered') || error.message?.includes('already_registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message?.includes('invalid_email') || error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido. Verifique e tente novamente.';
      } else if (error.message?.includes('weak_password') || error.message?.includes('Password should be at least')) {
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
      } else if (error.message?.includes('rate_limit')) {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      }

      toast({
        title: '❌ Erro no cadastro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Pipeline Labs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <AuthFormFields
                mode="signin"
                onSubmit={handleSignIn}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <AuthFormFields
                mode="signup"
                onSubmit={handleSignUp}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
