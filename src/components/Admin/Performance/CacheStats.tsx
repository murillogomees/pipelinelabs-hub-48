
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2 } from 'lucide-react';

interface CacheStatsData {
  totalKeys: number;
  redisAvailable: boolean;
  fallbackSize: number;
  hitRate: number;
  missRate: number;
}

interface CacheStatsProps {
  stats: CacheStatsData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onClearCache: () => void;
}

export function CacheStats({ stats, isLoading, onRefresh, onClearCache }: CacheStatsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Cache</CardTitle>
          <CardDescription>Status atual do sistema de cache</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Estatísticas do Cache
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCache}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Status atual do sistema de cache</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status do Redis</span>
            <Badge variant={stats?.redisAvailable ? "default" : "destructive"}>
              {stats?.redisAvailable ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total de Chaves</span>
            <span className="text-sm">{stats?.totalKeys || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cache Fallback</span>
            <span className="text-sm">{stats?.fallbackSize || 0} itens</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Taxa de Hit</span>
            <span className="text-sm font-bold text-green-600">
              {stats?.hitRate ? `${Math.round(stats.hitRate)}%` : '0%'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Taxa de Miss</span>
            <span className="text-sm font-bold text-red-600">
              {stats?.missRate ? `${Math.round(stats.missRate)}%` : '0%'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
