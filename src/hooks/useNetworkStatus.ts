
import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  rtt?: number;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    effectiveType: 'unknown',
    rtt: 0
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Mock network info for environments that don't support it
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkStatus(prev => ({
        ...prev,
        effectiveType: connection.effectiveType || 'unknown',
        rtt: connection.rtt || 0
      }));
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return networkStatus;
};
