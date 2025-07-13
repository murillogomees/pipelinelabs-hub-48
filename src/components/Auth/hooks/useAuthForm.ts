import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { rateLimiter, cleanupAuthState, sanitizeInput } from '@/utils/security';
import { cleanDocument } from '@/utils/documentValidation';

interface UseAuthFormProps {
  onSuccess?: () => void;
}

export function useAuthForm({ onSuccess }: UseAuthFormProps = {}) {
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitTime, setRateLimitTime] = useState(0);
  const { toast } = useToast();

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

  const checkDocumentExists = async (cleanedDocument: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .eq('document', cleanedDocument)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  };

  const createCompanyAndAssociation = async (userId: string, companyData: {
    companyName: string;
    document: string;
    phone: string;
  }) => {
    const cleanedDocument = cleanDocument(companyData.document);
    
    const documentExists = await checkDocumentExists(cleanedDocument);
    if (documentExists) {
      throw new Error('document_already_exists');
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: sanitizeInput(companyData.companyName.trim()),
        document: cleanedDocument,
        phone: sanitizeInput(companyData.phone.trim()) || null,
      })
      .select()
      .single();

    if (companyError) throw companyError;

    const { error: associationError } = await supabase
      .from('user_companies')
      .insert({
        user_id: userId,
        company_id: company.id,
        role: 'admin',
        is_active: true,
      });

    if (associationError) throw associationError;

    const { error: settingsError } = await supabase
      .from('company_settings')
      .insert({
        company_id: company.id,
      });

    if (settingsError) throw settingsError;

    return company;
  };

  const signIn = async (email: string, password: string) => {
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    
    const { error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });
    
    if (error) throw error;
    
    toast({
      title: 'Login realizado com sucesso!',
      description: 'Bem-vindo ao Pipeline Labs.',
    });
    
    // Aguardar um pouco antes de redirecionar para garantir que o estado seja atualizado
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
    
    onSuccess?.();
  };

  const signUp = async (formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    document: string;
    phone: string;
  }) => {
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      throw new Error(passwordError);
    }

    if (!formData.companyName.trim()) {
      throw new Error('Nome da empresa é obrigatório');
    }

    cleanupAuthState();
    
    const sanitizedEmail = sanitizeInput(formData.email.toLowerCase().trim());
    const sanitizedFirstName = sanitizeInput(formData.firstName.trim());
    const sanitizedLastName = sanitizeInput(formData.lastName.trim());
    
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: formData.password,
      options: {
        data: {
          first_name: sanitizedFirstName,
          last_name: sanitizedLastName,
        },
        emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
      },
    });
    
    if (error) throw error;
    
    if (data.user) {
      try {
        await createCompanyAndAssociation(data.user.id, {
          companyName: formData.companyName,
          document: formData.document,
          phone: formData.phone,
        });
      } catch (companyError: any) {
        console.error('Failed to create company:', companyError);
        throw companyError;
      }
    }
    
    toast({
      title: 'Conta criada!',
      description: 'Verifique seu email para confirmar a conta.',
    });
    
    onSuccess?.();
  };

  const handleAuth = async (
    isSignUp: boolean,
    formData: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      companyName?: string;
      document?: string;
      phone?: string;
    }
  ) => {
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
      if (isSignUp) {
        await signUp(formData as Required<typeof formData>);
      } else {
        await signIn(formData.email, formData.password);
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

  return {
    loading,
    rateLimited,
    rateLimitTime,
    setRateLimited,
    setRateLimitTime,
    handleAuth,
  };
}