
import React, { useState, useEffect } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useRedisCache } from '@/hooks/useRedisCache';
import { MetricsGrid } from './Performance/MetricsGrid';
import { PerformanceChart } from './Performance/PerformanceChart';
import { CacheStats } from './Performance/CacheStats';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PerformanceDashboard');

interface ChartData {
  time: string;
  responseTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

export function PerformanceDashboard() {
  const { metrics, isLoading: metricsLoading } = usePerformanceMonitoring();
  const redis = useRedisCache();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateMetrics = () => {
      const now = new Date().toISOString();
      const newDataPoint: ChartData = {
        time: now,
        responseTime: metrics?.timing?.loadComplete || 0,
        memoryUsage: metrics?.memory?.usedJSHeapSize ? 
          Math.round(metrics.memory.usedJSHeapSize / 1024 / 1024) : 0,
        cacheHitRate: redis.stats.hits + redis.stats.misses > 0 ? 
          (redis.stats.hits / (redis.stats.hits + redis.stats.misses)) * 100 : 0
      };

      setChartData(prev => {
        const updated = [...prev, newDataPoint];
        return updated.slice(-20); // Keep last 20 data points
      });
    };

    if (!metricsLoading && metrics) {
      updateMetrics();
      setIsLoading(false);
    }

    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [metrics, metricsLoading, redis.stats]);

  const handleRefreshCache = async () => {
    try {
      await redis.getStats();
      logger.info('Cache stats refreshed');
    } catch (error) {
      logger.error('Error refreshing cache stats:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await redis.flush();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  };

  const metricsData = metrics ? {
    responseTime: metrics.timing?.loadComplete || 0,
    activeQueries: chartData.length,
    cacheHitRate: redis.stats.hits + redis.stats.misses > 0 ? 
      (redis.stats.hits / (redis.stats.hits + redis.stats.misses)) * 100 : 0,
    memoryUsage: metrics.memory?.usedJSHeapSize ? 
      Math.round(metrics.memory.usedJSHeapSize / 1024 / 1024) : 0
  } : null;

  const cacheStatsData = {
    totalKeys: redis.stats.size,
    redisAvailable: redis.stats.redisAvailable,
    fallbackSize: redis.stats.size,
    hitRate: redis.stats.hits + redis.stats.misses > 0 ? 
      (redis.stats.hits / (redis.stats.hits + redis.stats.misses)) * 100 : 0,
    missRate: redis.stats.hits + redis.stats.misses > 0 ? 
      (redis.stats.misses / (redis.stats.hits + redis.stats.misses)) * 100 : 0
  };

  return (
    <div className="space-y-6">
      <MetricsGrid 
        metrics={metricsData}
        isLoading={isLoading}
      />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceChart 
          data={chartData}
          isLoading={isLoading}
        />
        
        <CacheStats
          stats={cacheStatsData}
          isLoading={isLoading}
          onRefresh={handleRefreshCache}
          onClearCache={handleClearCache}
        />
      </div>
    </div>
  );
}
