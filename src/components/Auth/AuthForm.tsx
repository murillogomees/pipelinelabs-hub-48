import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordValidator } from '@/components/ui/password-validator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { rateLimiter, cleanupAuthState, sanitizeInput } from '@/utils/security';
import { formatCPF, formatCNPJ, validateCPF, validateCNPJ, cleanDocument, getDocumentType } from '@/utils/documentValidation';

export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [document, setDocument] = useState('');
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');
  const [phone, setPhone] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitTime, setRateLimitTime] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (rateLimited && rateLimitTime > 0) {
      const timer = setInterval(() => {
        const remaining = rateLimiter.getRemainingTime('auth_attempts');
        setRateLimitTime(remaining);
        if (remaining <= 0) {
          setRateLimited(false);
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [rateLimited, rateLimitTime]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'A senha deve conter pelo menos um número';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'A senha deve conter pelo menos um caractere especial (@$!%*?&)';
    }
    return null;
  };

  const sanitizeErrorMessage = (errorMessage: string): string => {
    // Sanitize database errors to prevent information disclosure
    if (errorMessage.includes('duplicate key value')) {
      return 'Este email já está cadastrado';
    }
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Confirme seu email antes de fazer login';
    }
    if (errorMessage.includes('Too many requests')) {
      return 'Muitas tentativas. Tente novamente em alguns minutos';
    }
    if (errorMessage.includes('document_already_exists')) {
      return 'Este CPF/CNPJ já está cadastrado no sistema. Entre em contato com o suporte para obter ajuda.';
    }
    return errorMessage;
  };

  const handleDocumentChange = (value: string) => {
    const docType = getDocumentType(value);
    if (docType !== 'invalid') {
      setDocumentType(docType);
    }
    
    if (docType === 'cpf') {
      setDocument(formatCPF(value));
    } else if (docType === 'cnpj') {
      setDocument(formatCNPJ(value));
    } else {
      setDocument(value);
    }
  };

  const validateDocument = (): string | null => {
    const cleaned = cleanDocument(document);
    
    if (documentType === 'cpf') {
      if (!validateCPF(cleaned)) {
        return 'CPF inválido';
      }
    } else if (documentType === 'cnpj') {
      if (!validateCNPJ(cleaned)) {
        return 'CNPJ inválido';
      }
    }
    
    return null;
  };

  const checkDocumentExists = async (cleanedDocument: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .eq('document', cleanedDocument)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  };

  const createCompanyAndAssociation = async (userId: string) => {
    const cleanedDocument = cleanDocument(document);
    
    // Check if document already exists
    const documentExists = await checkDocumentExists(cleanedDocument);
    if (documentExists) {
      throw new Error('document_already_exists');
    }

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: sanitizeInput(companyName.trim()),
        document: cleanedDocument,
        phone: sanitizeInput(phone.trim()) || null,
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // Associate user with company as admin
    const { error: associationError } = await supabase
      .from('user_companies')
      .insert({
        user_id: userId,
        company_id: company.id,
        role: 'admin',
        is_active: true,
      });

    if (associationError) throw associationError;

    // Create company settings
    const { error: settingsError } = await supabase
      .from('company_settings')
      .insert({
        company_id: company.id,
      });

    if (settingsError) throw settingsError;

    return company;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (rateLimiter.isRateLimited('auth_attempts', 5, 15 * 60 * 1000)) {
      const remaining = rateLimiter.getRemainingTime('auth_attempts');
      setRateLimited(true);
      setRateLimitTime(remaining);
      toast({
        title: 'Muitas tentativas',
        description: `Tente novamente em ${Math.ceil(remaining / 60000)} minutos.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
      const sanitizedFirstName = sanitizeInput(firstName.trim());
      const sanitizedLastName = sanitizeInput(lastName.trim());
      
      if (isSignUp) {
        // Validate password strength for signup
        const passwordError = validatePassword(password);
        if (passwordError) {
          throw new Error(passwordError);
        }

        // Validate document
        const documentError = validateDocument();
        if (documentError) {
          throw new Error(documentError);
        }

        if (!companyName.trim()) {
          throw new Error('Nome da empresa é obrigatório');
        }

        // Clean up any existing auth state before signup
        cleanupAuthState();
        
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: {
              first_name: sanitizedFirstName,
              last_name: sanitizedLastName,
            },
            emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
          },
        });
        
        if (error) throw error;
        
        // If user was created successfully, create company and association
        if (data.user) {
          try {
            await createCompanyAndAssociation(data.user.id);
          } catch (companyError: any) {
            // If company creation fails, we should clean up the user
            // Note: In production, you might want to handle this differently
            console.error('Failed to create company:', companyError);
            throw companyError;
          }
        }
        
        toast({
          title: 'Conta criada!',
          description: 'Verifique seu email para confirmar a conta.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });
        if (error) throw error;
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo ao Pipeline Labs.',
        });
      }
    } catch (error: any) {
      const sanitizedMessage = sanitizeErrorMessage(error.message);
      toast({
        title: 'Erro',
        description: sanitizedMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={documentType} onValueChange={(value: 'cpf' | 'cnpj') => setDocumentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="document">{documentType.toUpperCase()}</Label>
                    <Input
                      id="document"
                      type="text"
                      value={document}
                      onChange={(e) => handleDocumentChange(e.target.value)}
                      placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isSignUp && password && (
                <PasswordValidator password={password} />
              )}
            </div>
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