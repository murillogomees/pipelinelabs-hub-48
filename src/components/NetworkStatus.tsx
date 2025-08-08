
import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';

export function NetworkStatus() {
  const { isOnline, isSyncing, queueSize } = useOfflineSupport();

  if (isOnline && !isSyncing && queueSize === 0) {
    return null; // Não mostrar nada quando tudo está normal
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg text-sm font-medium
        ${isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-orange-500 text-white'
        }
      `}>
        {isSyncing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sincronizando...</span>
          </>
        ) : isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Online</span>
            {queueSize > 0 && (
              <span className="bg-green-600 px-2 py-1 rounded-full text-xs">
                {queueSize} pendente{queueSize > 1 ? 's' : ''}
              </span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Offline</span>
            {queueSize > 0 && (
              <span className="bg-orange-600 px-2 py-1 rounded-full text-xs">
                {queueSize}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
