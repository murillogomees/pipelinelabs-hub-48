
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  responseTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

interface PerformanceChartProps {
  data: ChartData[];
  isLoading: boolean;
}

export function PerformanceChart({ data, isLoading }: PerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance ao Longo do Tempo</CardTitle>
          <CardDescription>
            Monitoramento de métricas de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance ao Longo do Tempo</CardTitle>
        <CardDescription>
          Monitoramento de métricas de performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value: number, name: string) => [
                `${value}${name === 'responseTime' ? 'ms' : name === 'memoryUsage' ? 'MB' : '%'}`,
                name === 'responseTime' ? 'Tempo de Resposta' : 
                name === 'memoryUsage' ? 'Uso de Memória' : 'Taxa de Cache'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="responseTime" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="responseTime"
            />
            <Line 
              type="monotone" 
              dataKey="memoryUsage" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="memoryUsage"
            />
            <Line 
              type="monotone" 
              dataKey="cacheHitRate" 
              stroke="#10b981" 
              strokeWidth={2}
              name="cacheHitRate"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
