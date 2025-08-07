
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando para o dashboard...',
        });
        navigate('/app/dashboard');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro no login',
        description: error.message || 'Erro ao fazer login. Verifique suas credenciais.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (formData: any) => {
    setIsLoading(true);
    try {
      console.log('🔄 Iniciando processo de signup...');

      // Abordagem simplificada - deixar o trigger handle_new_user fazer o trabalho
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.name,
            company_name: formData.companyName || `${formData.name} - Empresa`,
            document: formData.document,
            phone: formData.phone,
          },
          // Removendo o redirect específico que pode estar causando problemas
          emailRedirectTo: `${window.location.origin}/app`
        },
      });

      if (authError) {
        console.error('❌ Erro no signup:', authError);
        throw authError;
      }

      if (authData?.user) {
        console.log('✅ Usuário criado com sucesso!', {
          userId: authData.user.id,
          email: authData.user.email
        });

        toast({
          title: '🎉 Cadastro realizado com sucesso!',
          description: 'Verifique seu email para confirmar a conta e fazer login.',
        });

        // Em vez de redirecionar automaticamente, mostrar mensagem para verificar email
        return;
      }
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      // Tratamento mais específico dos erros
      if (error.message?.includes('rate_limit')) {
        errorMessage = 'Muitas tentativas de cadastro. Aguarde alguns minutos.';
      } else if (error.message?.includes('User already registered') || error.message?.includes('already_registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message?.includes('invalid_email')) {
        errorMessage = 'Email inválido. Verifique e tente novamente.';
      } else if (error.message?.includes('weak_password')) {
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
      } else if (error.message?.includes('Database error') || error.message?.includes('schema') || error.message?.includes('constraint')) {
        errorMessage = 'Erro interno do sistema. Nossa equipe foi notificada. Tente novamente em alguns minutos.';
      } else if (error.message?.includes('signup_disabled')) {
        errorMessage = 'Cadastros temporariamente desabilitados. Contate o suporte.';
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
