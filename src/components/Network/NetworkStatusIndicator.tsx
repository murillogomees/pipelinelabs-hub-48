
import React from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export function NetworkStatusIndicator() {
  const { isOnline, effectiveType, rtt } = useNetworkStatus();
  
  if (isOnline && (!effectiveType || effectiveType !== 'slow-2g')) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Alert variant={isOnline ? "default" : "destructive"} className="w-auto">
        {isOnline ? (
          <>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Conexão lenta detectada. Algumas funcionalidades podem demorar para carregar.
            </AlertDescription>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Sem conexão com a internet. Verifique sua rede.
            </AlertDescription>
          </>
        )}
      </Alert>
    </div>
  );
}
