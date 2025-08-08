
import { useState, useEffect, useCallback } from 'react';

interface QueuedOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedOperation[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load queue from localStorage
    const savedQueue = localStorage.getItem('offline_queue');
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Error loading offline queue:', error);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = useCallback((operation: Omit<QueuedOperation, 'id' | 'timestamp'>) => {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    setQueue(prev => {
      const newQueue = [...prev, queuedOp];
      localStorage.setItem('offline_queue', JSON.stringify(newQueue));
      return newQueue;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem('offline_queue');
  }, []);

  return {
    isOnline,
    queue,
    addToQueue,
    clearQueue
  };
}
