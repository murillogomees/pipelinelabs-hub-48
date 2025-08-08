
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, User, Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardFallbackProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  error?: any;
}

export function DashboardFallback({ onRetry, isRetrying = false, error }: DashboardFallbackProps) {
  const { user } = useAuth();
  
  const isInfrastructureError = error?.code === 'PGRST002';
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isInfrastructureError ? 'Carregando seus dados...' : 'Bem-vindo ao Pipeline Labs'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {user && (
              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}

            {isInfrastructureError ? (
              <div className="space-y-4">
                <div className="text-center text-muted-foreground">
                  <p>Estamos carregando suas informações...</p>
                  <p className="text-sm">Este processo pode levar alguns momentos.</p>
                </div>
                
                <div className="flex justify-center space-x-2">
                  <Button 
                    onClick={onRetry}
                    disabled={isRetrying}
                    variant="outline"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tentar novamente
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-muted-foreground">
                  <p>Parece que você ainda não tem uma empresa configurada.</p>
                  <p className="text-sm">Vamos configurar isso para você!</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Configurar Empresa</h3>
                          <p className="text-sm text-muted-foreground">
                            Configure os dados da sua empresa
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">Configurações</h3>
                          <p className="text-sm text-muted-foreground">
                            Ajuste as configurações do sistema
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={onRetry}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Começar configuração
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
