
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

interface DatabaseOfflineHandlerProps {
  onRetry: () => void;
  retryCount?: number;
  maxRetries?: number;
  isRetrying?: boolean;
  error?: any;
}

export function DatabaseOfflineHandler({ 
  onRetry, 
  retryCount = 0, 
  maxRetries = 5, 
  isRetrying = false, 
  error 
}: DatabaseOfflineHandlerProps) {
  const isInfrastructureError = error?.code === 'PGRST002';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isInfrastructureError ? (
              <WifiOff className="h-16 w-16 text-orange-500" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <CardTitle className="text-xl">
            {isInfrastructureError 
              ? 'Serviço Temporariamente Indisponível' 
              : 'Problema de Conectividade'
            }
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground space-y-2">
            {isInfrastructureError ? (
              <div className="space-y-2">
                <p className="text-sm">
                  Os serviços do banco de dados estão temporariamente indisponíveis.
                </p>
                <p className="text-xs">
                  Este é um problema de infraestrutura que normalmente se resolve em alguns minutos.
                </p>
              </div>
            ) : (
              <p className="text-sm">
                Não foi possível conectar ao banco de dados.
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded-lg">
            <p><strong>Tentativas:</strong> {retryCount}/{maxRetries}</p>
            <p><strong>Código do erro:</strong> {error?.code || 'N/A'}</p>
            <p><strong>Status:</strong> {isRetrying ? 'Tentando novamente...' : 'Aguardando'}</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onRetry} 
              disabled={isRetrying || retryCount >= maxRetries}
              className="w-full"
              size="lg"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Tentando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </>
              )}
            </Button>

            {isInfrastructureError && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Dica:</strong> Problemas de infraestrutura geralmente se resolvem em 2-5 minutos
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <h4 className="text-sm font-medium">O que você pode fazer:</h4>
            <ul className="text-xs text-muted-foreground space-y-1 pl-4">
              <li>• Aguardar alguns minutos e tentar novamente</li>
              <li>• Verificar sua conexão com a internet</li>
              <li>• Atualizar a página no navegador</li>
              {isInfrastructureError && (
                <li>• Este é um problema temporário do servidor, não do seu lado</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
