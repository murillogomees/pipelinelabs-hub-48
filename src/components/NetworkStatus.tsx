
import React from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';

interface NetworkStatusProps {
  error?: any;
  retryCount?: number;
  maxRetries?: number;
}

export function NetworkStatus({ error, retryCount = 0, maxRetries = 5 }: NetworkStatusProps) {
  const { isOnline, queueSize, isSyncing } = useOfflineSupport();
  
  const isInfrastructureError = error?.code === 'PGRST002' || 
                               error?.message?.includes('schema cache') ||
                               error?.message?.includes('Service Unavailable');

  // Don't show anything if everything is fine
  if (!error && isOnline && queueSize === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className={`${isInfrastructureError ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center space-x-2">
          {isInfrastructureError ? (
            <WifiOff className="h-4 w-4 text-orange-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertTitle className="text-sm font-medium">
            {isInfrastructureError ? 'Serviços Temporariamente Indisponíveis' : 'Problema de Conectividade'}
          </AlertTitle>
        </div>
        
        <AlertDescription className="mt-2 text-xs space-y-2">
          {isInfrastructureError ? (
            <div>
              <p>O Supabase está enfrentando problemas de infraestrutura temporários.</p>
              <p className="text-orange-600">Código: PGRST002 - Schema cache indisponível</p>
            </div>
          ) : (
            <p>Problemas de conectividade detectados.</p>
          )}
          
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant={isOnline ? 'secondary' : 'destructive'} className="text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            
            {retryCount > 0 && (
              <Badge variant="outline" className="text-xs">
                Tentativas: {retryCount}/{maxRetries}
              </Badge>
            )}
            
            {queueSize > 0 && (
              <Badge variant="secondary" className="text-xs">
                Fila: {queueSize}
              </Badge>
            )}
            
            {isSyncing && (
              <Badge variant="default" className="text-xs animate-pulse">
                Sincronizando...
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-white/50 rounded">
            {isInfrastructureError ? (
              <>
                <p><strong>O que fazer:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Aguarde alguns minutos - problemas de infraestrutura se resolvem automaticamente</li>
                  <li>Este não é um problema do seu lado</li>
                  <li>Suas configurações estão sendo salvas localmente</li>
                </ul>
              </>
            ) : (
              <>
                <p><strong>Dicas:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Verifique sua conexão com a internet</li>
                  <li>Atualize a página se necessário</li>
                  <li>Dados estão sendo salvos localmente</li>
                </ul>
              </>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
