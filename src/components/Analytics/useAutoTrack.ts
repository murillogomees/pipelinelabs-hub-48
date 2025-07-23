import { useEffect } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

// Hook para rastrear automaticamente eventos comuns
export const useAutoTrack = () => {
  const { trackUserAction } = useAnalyticsContext();

  // Função para rastrear criação de registros
  const trackCreate = (entityType: string, entityId?: string) => {
    trackUserAction(`${entityType}:criado`, {
      entity_type: entityType,
      entity_id: entityId,
      action_time: new Date().toISOString()
    });
  };

  // Função para rastrear edição de registros
  const trackUpdate = (entityType: string, entityId?: string) => {
    trackUserAction(`${entityType}:editado`, {
      entity_type: entityType,
      entity_id: entityId,
      action_time: new Date().toISOString()
    });
  };

  // Função para rastrear exclusão de registros
  const trackDelete = (entityType: string, entityId?: string) => {
    trackUserAction(`${entityType}:excluido`, {
      entity_type: entityType,
      entity_id: entityId,
      action_time: new Date().toISOString()
    });
  };

  // Função para rastrear visualização de registros
  const trackView = (entityType: string, entityId?: string) => {
    trackUserAction(`${entityType}:visualizado`, {
      entity_type: entityType,
      entity_id: entityId,
      action_time: new Date().toISOString()
    });
  };

  // Função para rastrear ações específicas (ex: emitir nota, abrir PDV)
  const trackAction = (actionName: string, meta?: Record<string, any>) => {
    trackUserAction(actionName, {
      ...meta,
      action_time: new Date().toISOString()
    });
  };

  return {
    trackCreate,
    trackUpdate,
    trackDelete,
    trackView,
    trackAction
  };
};