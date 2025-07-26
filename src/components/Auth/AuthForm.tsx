
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthFormFields } from './components/AuthFormFields';
import { useEnhancedAuthForm } from './hooks/useEnhancedAuthForm';
import { PasswordStrengthValidator } from '@/components/Security/PasswordStrengthValidator';
import { CSRFToken } from '@/components/Security/CSRFProtection';
import { SecurityBoundary } from '@/components/Security/SecurityBoundary';

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
    documentType: 'cpf' as 'cpf' | 'cnpj' // Fix: explicitly type as union type
  });

  const { 
    loading, 
    rateLimited, 
    rateLimitTime, 
    handleAuth,
    isPasswordValid,
    handlePasswordValidation
  } = useEnhancedAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rateLimited) {
      return;
    }

    // For sign up, ensure password is valid
    if (isSignUp && !isPasswordValid) {
      return;
    }

    await handleAuth(isSignUp, formData);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'documentType') {
      setFormData(prev => ({ ...prev, [field]: value as 'cpf' | 'cnpj' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (rateLimited) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Muitas Tentativas</CardTitle>
          <CardDescription>
            Tente novamente em {Math.ceil(rateLimitTime / 60000)} minutos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <SecurityBoundary>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <CSRFToken />
              
              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <AuthFormFields
                  formData={formData}
                  onInputChange={handleInputChange}
                />

                <PasswordStrengthValidator
                  password={formData.password}
                  onValidationChange={handlePasswordValidation}
                />
              </TabsContent>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || (isSignUp && !isPasswordValid)}
              >
                {loading ? 'Processando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </SecurityBoundary>
  );
}
