import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getEnvironment } from '@/utils/environment';

interface MetricData {
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  environment?: string;
  metadata?: Record<string, any>;
}

export function useProductionMetrics() {
  const environment = getEnvironment();

  const recordMetric = useCallback(async (metricData: MetricData) => {
    try {
      const { data, error } = await supabase.functions.invoke('production-metrics', {
        body: {
          ...metricData,
          environment: metricData.environment || environment,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to record metric:', error);
      throw error;
    }
  }, [environment]);

  const recordMetricMutation = useMutation({
    mutationFn: recordMetric,
    onError: (error) => {
      console.error('Metric recording failed:', error);
    },
  });

  // Query for recent metrics
  const { data: recentMetrics, isLoading } = useQuery({
    queryKey: ['production-metrics', environment],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('environment', environment)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Helper functions for common metrics
  const recordPageLoad = useCallback((duration: number, page: string) => {
    recordMetricMutation.mutate({
      metric_name: 'page_load_time',
      metric_value: duration,
      metric_unit: 'ms',
      metadata: { page },
    });
  }, [recordMetricMutation]);

  const recordAPICall = useCallback((duration: number, endpoint: string, status: number) => {
    recordMetricMutation.mutate({
      metric_name: 'api_response_time',
      metric_value: duration,
      metric_unit: 'ms',
      metadata: { endpoint, status },
    });
  }, [recordMetricMutation]);

  const recordError = useCallback((errorType: string, errorMessage: string) => {
    recordMetricMutation.mutate({
      metric_name: 'error_count',
      metric_value: 1,
      metric_unit: 'count',
      metadata: { error_type: errorType, error_message: errorMessage },
    });
  }, [recordMetricMutation]);

  const recordUserAction = useCallback((action: string, value: number = 1) => {
    recordMetricMutation.mutate({
      metric_name: 'user_action',
      metric_value: value,
      metric_unit: 'count',
      metadata: { action },
    });
  }, [recordMetricMutation]);

  return {
    recordMetric: recordMetricMutation.mutate,
    recordMetricAsync: recordMetric,
    isRecording: recordMetricMutation.isPending,
    recordingError: recordMetricMutation.error,
    recentMetrics,
    isLoadingMetrics: isLoading,
    
    // Helper functions
    recordPageLoad,
    recordAPICall,
    recordError,
    recordUserAction,
  };
}