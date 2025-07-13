
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordValidator } from '@/components/ui/password-validator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { rateLimiter, cleanupAuthState, sanitizeInput } from '@/utils/security';

export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
    return errorMessage;
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

        // Clean up any existing auth state before signup
        cleanupAuthState();
        
        const { error } = await supabase.auth.signUp({
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
