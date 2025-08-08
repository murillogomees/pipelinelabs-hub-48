
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Building, CheckCircle, Settings, Wifi, WifiOff } from 'lucide-react';
import { SetupForm } from './SetupForm';

interface SetupWaitingProps {
  children: React.ReactNode;
}

export function SetupWaiting({ children }: SetupWaitingProps) {
  const { user } = useAuth();
  const { data: companyData, isLoading, error, refetch } = useCurrentCompany();
  const [waitTime, setWaitTime] = useState(0);
  const [maxRetries] = useState(6); // Reduzido para evitar spam
  const [retryCount, setRetryCount] = useState(0);
  const [showManualSetup, setShowManualSetup] = useState(false);
  const [isInfrastructureError, setIsInfrastructureError] = useState(false);

  // Verificar se é erro de infraestrutura
  useEffect(() => {
    if (error && (error as any)?.code === 'PGRST002') {
      setIsInfrastructureError(true);
    }
  }, [error]);

  // Contador de tempo esperando
  useEffect(() => {
    if (isLoading || companyData || showManualSetup) return;
    
    const timer = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, companyData, showManualSetup]);

  // Auto-retry com backoff mais inteligente
  useEffect(() => {
    if (!isLoading && !companyData && retryCount < maxRetries && waitTime > 0 && waitTime % 5 === 0 && !showManualSetup) {
      // Se é erro de infraestrutura, aguardar mais tempo
      const delayMultiplier = isInfrastructureError ? 2 : 1;
      
      if (waitTime >= 5 * delayMultiplier) {
        console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries} - Buscando empresa... (aguardou ${waitTime}s)`);
        setRetryCount(prev => prev + 1);
        refetch();
      }
    }
  }, [waitTime, isLoading, companyData, retryCount, maxRetries, refetch, showManualSetup, isInfrastructureError]);

  // Função chamada quando o setup manual for concluído
  const handleSetupSuccess = () => {
    setShowManualSetup(false);
    setRetryCount(0);
    setWaitTime(0);
    setIsInfrastructureError(false);
    refetch();
  };

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

  // Se está mostrando o setup manual
  if (showManualSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <SetupForm onSuccess={handleSetupSuccess} />
      </div>
    );
  }

  // Se há erro ou não conseguiu carregar após várias tentativas
  if (error || retryCount >= maxRetries) {
    const isInfraError = (error as any)?.code === 'PGRST002';
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {isInfraError ? (
              <WifiOff className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            ) : (
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            )}
            <CardTitle>
              {isInfraError ? 'Serviço Temporariamente Indisponível' : 'Problema na Configuração'}
            </CardTitle>
            <CardDescription>
              {isInfraError 
                ? 'Os serviços estão temporariamente indisponíveis. Você pode configurar manualmente enquanto aguardamos a normalização.'
                : 'Não foi possível configurar sua conta automaticamente'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Usuário:</strong> {user?.email}</p>
              <p><strong>Tentativas:</strong> {retryCount}/{maxRetries}</p>
              <p><strong>Tempo:</strong> {waitTime}s</p>
              {isInfraError && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <WifiOff className="h-4 w-4" />
                  <span>Problema de conectividade detectado</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => setShowManualSetup(true)}
                className="w-full"
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurar Manualmente
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setRetryCount(0);
                  setWaitTime(0);
                  setIsInfrastructureError(false);
                  refetch();
                }}
                className="w-full"
                disabled={isInfraError && waitTime < 10} // Aguardar mais tempo se é erro de infra
              >
                <Wifi className="mr-2 h-4 w-4" />
                Tentar Novamente
                {isInfraError && waitTime < 10 && <span className="ml-1">({10 - waitTime}s)</span>}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                {isInfraError 
                  ? 'Problema temporário nos serviços. Tente novamente em alguns minutos.'
                  : 'Se o problema persistir, entre em contato com o suporte'
                }
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
              {isInfrastructureError ? (
                <WifiOff className="h-4 w-4 text-orange-500" />
              ) : (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {isInfrastructureError 
                  ? 'Aguardando normalização dos serviços...' 
                  : 'Configurando empresa e perfil...'
                }
              </span>
            </div>
          </div>

          {waitTime > 8 && (
            <div className="pt-2 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="w-full"
                disabled={isInfrastructureError && waitTime < 15}
              >
                <Wifi className="mr-2 h-3 w-3" />
                Verificar Novamente
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowManualSetup(true)}
                className="w-full"
              >
                <Settings className="mr-2 h-3 w-3" />
                Configurar Manualmente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
