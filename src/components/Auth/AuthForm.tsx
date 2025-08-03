
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthFormFields } from './components/AuthFormFields';
import { useAuthForm } from './hooks/useAuthForm';
import { PasswordStrengthValidator } from '@/components/Security/PasswordStrengthValidator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For sign up, ensure password is valid
    if (isSignUp && !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/app`;
        
        const { error } = await supabase.auth.signUp({
          email: formData.email,
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

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast({
          title: "Sucesso", 
          description: "Login realizado com sucesso!",
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      let message = "Erro inesperado. Tente novamente.";
      
      if (error.message?.includes("Invalid login credentials")) {
        message = "Email ou senha incorretos";
      } else if (error.message?.includes("User already registered")) {
        message = "Este email já está cadastrado";
      } else if (error.message?.includes("Password should be at least")) {
        message = "A senha deve ter pelo menos 6 caracteres";
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
