
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthFormFields } from './components/AuthFormFields';
import { PasswordStrengthValidator } from '@/components/Security/PasswordStrengthValidator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    document: '',
    phone: '',
    documentType: 'cpf' as 'cpf' | 'cnpj'
  });

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha email e senha",
        variant: "destructive",
      });
      return;
    }

    // For sign up, ensure password is valid
    if (isSignUp && !isPasswordValid) {
      toast({
        title: "Erro",
        description: "Por favor, use uma senha mais forte",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/app/dashboard`;
        
        // Primeiro, criar o usuário
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: `${formData.firstName} ${formData.lastName}`,
              document: formData.document,
              phone: formData.phone,
              company_name: formData.companyName
            }
          }
        });

        if (authError) throw authError;

        // Se o usuário foi criado com sucesso, criar a empresa e o profile
        if (authData.user) {
          // Aguardar um pouco para garantir que o usuário foi criado
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Criar a empresa
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: formData.companyName,
              document: formData.document,
              user_id: authData.user.id
            })
            .select()
            .single();

          if (companyError) {
            console.error('Erro ao criar empresa:', companyError);
          }

          // Criar o profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              display_name: `${formData.firstName} ${formData.lastName}`,
              document: formData.document,
              phone: formData.phone,
              company_id: company?.id
            });

          if (profileError) {
            console.error('Erro ao criar profile:', profileError);
          }

          // Se tudo deu certo com a empresa, criar a relação user_companies
          if (company) {
            const { error: userCompanyError } = await supabase
              .from('user_companies')
              .insert({
                user_id: authData.user.id,
                company_id: company.id,
                role: 'contratante',
                is_active: true
              });

            if (userCompanyError) {
              console.error('Erro ao criar relação user_companies:', userCompanyError);
            }
          }
        }

        toast({
          title: "Sucesso",
          description: "Cadastro realizado com sucesso! Você pode fazer login agora.",
        });

        // Mudar para modo de login após cadastro bem-sucedido
        setIsSignUp(false);
        setFormData(prev => ({
          ...prev,
          password: '',
          firstName: '',
          lastName: '',
          companyName: '',
          document: '',
          phone: ''
        }));

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) throw error;

        toast({
          title: "Sucesso", 
          description: "Login realizado com sucesso!",
        });

        // Redirecionar para o dashboard após login bem-sucedido
        if (data?.user) {
          navigate('/app/dashboard');
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      let message = "Erro inesperado. Tente novamente.";
      
      if (error.message?.includes("Invalid login credentials")) {
        message = "Email ou senha incorretos. Verifique seus dados e tente novamente.";
      } else if (error.message?.includes("User already registered")) {
        message = "Este email já está cadastrado. Tente fazer login ou usar outro email.";
      } else if (error.message?.includes("Password should be at least")) {
        message = "A senha deve ter pelo menos 6 caracteres";
      } else if (error.message?.includes("Email not confirmed")) {
        message = "Confirme seu email antes de fazer login";
      } else if (error.message?.includes("Signup disabled")) {
        message = "Cadastro temporariamente desabilitado";
      }

      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleDocumentChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, document: cleaned }));
  };

  const handlePasswordValidation = (isValid: boolean) => {
    setIsPasswordValid(isValid);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Pipeline Labs</CardTitle>
        <CardDescription>
          {isSignUp ? 'Crie sua conta' : 'Entre na sua conta'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={isSignUp ? 'signup' : 'signin'} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="signin" 
              onClick={() => setIsSignUp(false)}
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              onClick={() => setIsSignUp(true)}
            >
              Cadastrar
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormDataChange({ email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFormDataChange({ password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <AuthFormFields
                isSignUp={isSignUp}
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onDocumentChange={handleDocumentChange}
              />

              <PasswordStrengthValidator
                password={formData.password}
                onValidationChange={handlePasswordValidation}
              />
            </TabsContent>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || (isSignUp && !isPasswordValid)}
            >
              {isLoading ? 'Processando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
