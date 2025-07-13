import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthForm } from './hooks/useAuthForm';
import { useDocumentValidation } from './hooks/useDocumentValidation';
import { useRateLimit } from './hooks/useRateLimit';
import { AuthFormFields } from './components/AuthFormFields';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    document: '',
    documentType: 'cpf' as 'cpf' | 'cnpj',
    phone: '',
  });

  const { loading, handleAuth } = useAuthForm();
  const { rateLimited, rateLimitTime } = useRateLimit();
  const { handleDocumentChange, validateDocument } = useDocumentValidation();

  const onFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const onDocumentChange = (value: string) => {
    handleDocumentChange(
      value,
      (doc) => onFormDataChange({ document: doc }),
      (type) => onFormDataChange({ documentType: type })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      const documentError = validateDocument(formData.document, formData.documentType);
      if (documentError) {
        return;
      }
    }

    await handleAuth(isSignUp, formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">
            Pipeline Labs
          </CardTitle>
          <p className="text-gray-600">
            {isSignUp ? 'Crie sua conta' : 'Entre na sua conta'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthFormFields
              isSignUp={isSignUp}
              formData={formData}
              onFormDataChange={onFormDataChange}
              onDocumentChange={onDocumentChange}
            />
            <Button type="submit" className="w-full" disabled={loading || rateLimited}>
              {loading
                ? 'Carregando...'
                : rateLimited
                ? `Aguarde ${Math.ceil(rateLimitTime / 60000)}min`
                : isSignUp
                ? 'Criar Conta'
                : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:underline"
            >
              {isSignUp
                ? 'Já tem uma conta? Entre aqui'
                : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}