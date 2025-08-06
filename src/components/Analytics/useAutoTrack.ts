import { useEffect } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

// Hook para rastrear automaticamente eventos comuns
export const useAutoTrack = () => {
  // Analytics desabilitado - usar funções vazias
  const trackUserAction = () => {};

  // Analytics desabilitado - funções vazias
  const trackCreate = (entityType: string, entityId?: string) => {
    // Função desabilitada
  };

  const trackUpdate = (entityType: string, entityId?: string) => {
    // Função desabilitada
  };

  const trackDelete = (entityType: string, entityId?: string) => {
    // Função desabilitada
  };

  const trackView = (entityType: string, entityId?: string) => {
    // Função desabilitada
  };

  const trackAction = (actionName: string, meta?: Record<string, any>) => {
    // Função desabilitada
  };

  return {
    trackCreate,
    trackUpdate,
    trackDelete,
    trackView,
    trackAction
  };
};