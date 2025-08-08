
import { useState, useEffect, useCallback } from 'react';

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = 'offline_queue';
const NETWORK_STATUS_KEY = 'network_status';

export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Carregar queue do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        setOfflineQueue(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Erro ao carregar queue offline:', error);
    }
  }, []);

  // Salvar queue no localStorage
  const saveQueue = useCallback((queue: OfflineAction[]) => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      setOfflineQueue(queue);
    } catch (error) {
      console.warn('Erro ao salvar queue offline:', error);
    }
  }, []);

  // Adicionar ação à queue
  const addToQueue = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    const newQueue = [...offlineQueue, newAction];
    saveQueue(newQueue);
    
    console.log('📥 Ação adicionada à queue offline:', newAction);
  }, [offlineQueue, saveQueue]);

  // Processar queue quando voltar online
  const syncOfflineActions = useCallback(async () => {
    if (offlineQueue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    console.log('🔄 Iniciando sincronização offline...', offlineQueue.length, 'ações');

    const failedActions: OfflineAction[] = [];
    const processedActions: string[] = [];

    for (const action of offlineQueue) {
      try {
        // Aqui você implementaria a lógica específica para cada tipo de ação
        // Por exemplo, para companies:
        if (action.table === 'companies') {
          // Implementar sync específico
          console.log('Sincronizando ação:', action);
        }
        
        processedActions.push(action.id);
      } catch (error) {
        console.error('Erro ao sincronizar ação:', action, error);
        failedActions.push(action);
      }
    }

    // Remover ações processadas com sucesso
    const remainingQueue = offlineQueue.filter(action => !processedActions.includes(action.id));
    saveQueue(remainingQueue);

    setIsSyncing(false);
    console.log(`✅ Sincronização concluída. ${processedActions.length} processadas, ${failedActions.length} falharam`);
  }, [offlineQueue, isSyncing, saveQueue]);

  // Monitorar status da rede
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Voltou online');
      setIsOnline(true);
      localStorage.setItem(NETWORK_STATUS_KEY, 'online');
    };

    const handleOffline = () => {
      console.log('📴 Ficou offline');
      setIsOnline(false);
      localStorage.setItem(NETWORK_STATUS_KEY, 'offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar status inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync quando voltar online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      const timer = setTimeout(() => {
        syncOfflineActions();
      }, 2000); // Aguardar 2s para estabilizar conexão

      return () => clearTimeout(timer);
    }
  }, [isOnline, offlineQueue.length, syncOfflineActions]);

  return {
    isOnline,
    offlineQueue,
    isSyncing,
    addToQueue,
    syncOfflineActions,
    clearQueue: () => saveQueue([]),
    queueSize: offlineQueue.length
  };
}
