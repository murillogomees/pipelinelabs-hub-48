import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Building, CheckCircle } from 'lucide-react';

interface SetupWaitingProps {
  children: React.ReactNode;
}

export function SetupWaiting({ children }: SetupWaitingProps) {
  const { user } = useAuth();
  const { data: companyData, isLoading, error, refetch } = useCurrentCompany();
  const [waitTime, setWaitTime] = useState(0);
  const [maxRetries] = useState(10);
  const [retryCount, setRetryCount] = useState(0);

  // Contador de tempo esperando
  useEffect(() => {
    if (isLoading || companyData) return;
    
    const timer = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, companyData]);

  // Auto-retry para casos onde o trigger demora
  useEffect(() => {
    if (!isLoading && !companyData && retryCount < maxRetries && waitTime > 0 && waitTime % 3 === 0) {
      console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries} - Buscando empresa...`);
      setRetryCount(prev => prev + 1);
      refetch();
    }
  }, [waitTime, isLoading, companyData, retryCount, maxRetries, refetch]);

  // Enquanto está carregando pela primeira vez
  if (isLoading && retryCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <LoadingSpinner size="lg" />
            </div>
            <CardTitle>Configurando sua conta...</CardTitle>
            <CardDescription>
              Estamos criando sua empresa e configurando seu perfil
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Se há dados da empresa, mostrar conteúdo normal
  if (companyData) {
    return <>{children}</>;
  }

  // Se há erro ou não conseguiu carregar após várias tentativas
  if (error || retryCount >= maxRetries) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <CardTitle>Problema na Configuração</CardTitle>
            <CardDescription>
              Não foi possível configurar sua conta automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Usuário:</strong> {user?.email}</p>
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Tentativas:</strong> {retryCount}/{maxRetries}</p>
              <p><strong>Tempo:</strong> {waitTime}s</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => {
                  setRetryCount(0);
                  setWaitTime(0);
                  refetch();
                }}
                className="w-full"
              >
                Tentar Novamente
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Se o problema persistir, entre em contato com o suporte
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Aguardando criação automática
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <CardTitle>Finalizando configuração...</CardTitle>
          <CardDescription>
            Aguarde enquanto criamos sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-muted-foreground">
              {waitTime}s - Tentativa {retryCount + 1}/{maxRetries}
            </span>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Conta criada com sucesso</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Configurando empresa e perfil...</span>
            </div>
          </div>

          {waitTime > 10 && (
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="w-full"
              >
                Verificar Novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}