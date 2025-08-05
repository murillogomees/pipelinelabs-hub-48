
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
      // 1. Primeiro, criar a empresa
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          document: formData.document,
          email: formData.email,
        })
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }

      // 2. Criar o usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.name,
            document: formData.document,
            phone: formData.phone,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (authData?.user) {
        // 3. Criar o perfil do usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            email: formData.email,
            display_name: formData.name,
            document: formData.document,
            phone: formData.phone,
            company_id: companyData.id,
          });

        if (profileError) {
          console.warn('Erro ao criar perfil (pode ser criado pelo trigger):', profileError);
        }

        // 4. Criar a relação user_companies
        const { error: userCompanyError } = await supabase
          .from('user_companies')
          .insert({
            user_id: authData.user.id,
            company_id: companyData.id,
            role: 'contratante',
            is_active: true,
          });

        if (userCompanyError) {
          console.warn('Erro ao criar relação user_companies:', userCompanyError);
        }

        toast({
          title: 'Cadastro realizado com sucesso!',
          description: 'Verifique seu email para confirmar a conta.',
        });
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Erro ao criar conta. Tente novamente.',
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
