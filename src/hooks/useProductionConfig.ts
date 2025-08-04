import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getEnvironment } from '@/utils/environment';

interface ProductionConfig {
  rate_limiting: {
    enabled: boolean;
    max_requests_per_minute: number;
    max_requests_per_hour: number;
  };
  security: {
    csrf_enabled: boolean;
    force_https: boolean;
    session_timeout_hours: number;
  };
  monitoring: {
    sentry_enabled: boolean;
    analytics_enabled: boolean;
    performance_monitoring: boolean;
  };
  cache: {
    enabled: boolean;
    ttl_seconds: number;
    max_size_mb: number;
  };
  backup: {
    enabled: boolean;
    frequency: string;
    retention_days: number;
  };
}

export function useProductionConfig() {
  const environment = getEnvironment();

  const { data: config, isLoading, error, refetch } = useQuery({
    queryKey: ['production-config', environment],
    queryFn: async (): Promise<ProductionConfig> => {
      // Return mock config until types are updated
      return {
        rate_limiting: { enabled: true, max_requests_per_minute: 60, max_requests_per_hour: 1000 },
        security: { csrf_enabled: true, force_https: true, session_timeout_hours: 8 },
        monitoring: { sentry_enabled: false, analytics_enabled: true, performance_monitoring: true },
        cache: { enabled: true, ttl_seconds: 300, max_size_mb: 100 },
        backup: { enabled: false, frequency: 'daily', retention_days: 30 }
      } as ProductionConfig;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const updateConfig = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('production_config')
        .update({ 
          config_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('config_key', key)
        .eq('environment', environment);

      if (error) throw error;
      
      // Refetch to get updated data
      await refetch();
      return true;
    } catch (error) {
      console.error('Failed to update production config:', error);
      return false;
    }
  };

  const isProductionMode = environment === 'production';
  const isSecurityEnabled = config?.security?.csrf_enabled && isProductionMode;
  const isRateLimitingEnabled = config?.rate_limiting?.enabled && isProductionMode;
  const isMonitoringEnabled = config?.monitoring?.performance_monitoring;

  return {
    config,
    isLoading,
    error,
    updateConfig,
    refetch,
    environment,
    isProductionMode,
    isSecurityEnabled,
    isRateLimitingEnabled,
    isMonitoringEnabled,
  };
}