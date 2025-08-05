
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Database, Zap } from 'lucide-react';

interface MetricsData {
  responseTime: number;
  activeQueries: number;
  cacheHitRate: number;
  memoryUsage: number;
}

interface MetricsGridProps {
  metrics: MetricsData | null;
  isLoading: boolean;
}

export function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  const metricItems = [
    {
      title: 'Tempo de Resposta',
      value: metrics?.responseTime ? `${metrics.responseTime}ms` : '0ms',
      description: 'Tempo médio de resposta das queries',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Queries Ativas',
      value: metrics?.activeQueries || 0,
      description: 'Número de queries em execução',
      icon: Database,
      color: 'text-green-600'
    },
    {
      title: 'Taxa de Cache',
      value: metrics?.cacheHitRate ? `${Math.round(metrics.cacheHitRate)}%` : '0%',
      description: 'Porcentagem de hits no cache',
      icon: Zap,
      color: 'text-yellow-600'
    },
    {
      title: 'Uso de Memória',
      value: metrics?.memoryUsage ? `${Math.round(metrics.memoryUsage)}MB` : '0MB',
      description: 'Memória utilizada pelo sistema',
      icon: Activity,
      color: 'text-red-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <CardDescription className="text-xs">
                {item.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
