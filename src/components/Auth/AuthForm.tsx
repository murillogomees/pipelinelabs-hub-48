
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
      console.log('AuthForm - Attempting sign in for:', formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('AuthForm - Sign in error:', error);
        throw error;
      }

      if (data?.user) {
        console.log('AuthForm - Sign in successful, user:', data.user.email);
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando para o dashboard...',
        });
        // O redirecionamento será feito automaticamente pelo AuthRedirect
      }
    } catch (error: any) {
      console.error('AuthForm - Login error:', error);
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
      console.log('AuthForm - Attempting sign up for:', formData.email);

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.name,
            company_name: formData.companyName || `${formData.name} - Empresa`,
            document: formData.document,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) {
        console.error('AuthForm - Sign up error:', error);
        throw error;
      }

      if (data?.user) {
        console.log('AuthForm - Sign up successful, user:', data.user.email);

        toast({
          title: '🎉 Cadastro realizado com sucesso!',
          description: 'Verifique seu email para confirmar a conta ou aguarde enquanto configuramos seu perfil.',
        });

        // Se o usuário foi confirmado automaticamente, será redirecionado pelo AuthRedirect
        if (data.user.email_confirmed_at) {
          console.log('AuthForm - User confirmed, will be redirected automatically');
        }
      }
    } catch (error: any) {
      console.error('AuthForm - Sign up error:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.message?.includes('rate_limit')) {
        errorMessage = 'Muitas tentativas de cadastro. Aguarde alguns minutos.';
      } else if (error.message?.includes('already_registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message?.includes('invalid_email')) {
        errorMessage = 'Email inválido. Verifique e tente novamente.';
      } else if (error.message?.includes('weak_password')) {
        errorMessage = 'Senha muito fraca. Use pelo menos 8 caracteres com letras e números.';
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
