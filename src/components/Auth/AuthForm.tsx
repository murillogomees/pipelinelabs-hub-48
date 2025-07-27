
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthFormFields } from './components/AuthFormFields';
import { useAuthForm } from './hooks/useAuthForm';
import { PasswordStrengthValidator } from '@/components/Security/PasswordStrengthValidator';
import { CSRFToken, CSRFProvider } from '@/components/Security/CSRFProtection';

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

  const { 
    isLoading, 
    handleSubmit
  } = useAuthForm();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For sign up, ensure password is valid
    if (isSignUp && !isPasswordValid) {
      return;
    }

    await handleSubmit(e);
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
    <CSRFProvider>
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
              <CSRFToken />
              
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
    </CSRFProvider>
  );
}
