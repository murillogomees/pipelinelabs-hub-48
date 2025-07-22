import React, { useState } from 'react';
import { BaseLayout } from '@/components/Base/BaseLayout';
import { BaseCard } from '@/components/Base/BaseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Search,
  Clock,
  Server,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useCacheStats, useCacheInvalidation } from '@/hooks/useCache';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AdminCache() {
  const { stats, loading, refreshStats } = useCacheStats();
  const { invalidatePattern, flushAllCache } = useCacheInvalidation();
  const [searchTerm, setSearchTerm] = useState('');
  const [invalidating, setInvalidating] = useState(false);
  const [flushing, setFlushing] = useState(false);
  
  const filteredKeys = stats?.keys?.filter(key => 
    key.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const handleInvalidateKey = async (key: string) => {
    setInvalidating(true);
    try {
      await invalidatePattern(key);
      await refreshStats();
      toast.success(`Cache invalidado: ${key}`);
    } catch (error) {
      toast.error('Erro ao invalidar cache');
    } finally {
      setInvalidating(false);
    }
  };
  
  const handleFlushAll = async () => {
    if (!window.confirm('Tem certeza que deseja limpar TODO o cache? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setFlushing(true);
    try {
      await flushAllCache();
      await refreshStats();
      toast.success('Todo o cache foi limpo');
    } catch (error) {
      toast.error('Erro ao limpar cache');
    } finally {
      setFlushing(false);
    }
  };
  
  const getCacheTypeColor = (key: string) => {
    if (key.includes('dashboard')) return 'bg-blue-100 text-blue-800';
    if (key.includes('products')) return 'bg-green-100 text-green-800';
    if (key.includes('report')) return 'bg-purple-100 text-purple-800';
    if (key.includes('financial')) return 'bg-yellow-100 text-yellow-800';
    if (key.includes('catalog')) return 'bg-gray-100 text-gray-800';
    return 'bg-slate-100 text-slate-800';
  };
  
  const getCacheTypeIcon = (key: string) => {
    if (key.includes('dashboard')) return <Database className="w-3 h-3" />;
    if (key.includes('products')) return <Server className="w-3 h-3" />;
    if (key.includes('report')) return <Info className="w-3 h-3" />;
    if (key.includes('financial')) return <Clock className="w-3 h-3" />;
    return <Database className="w-3 h-3" />;
  };

  return (
    <BaseLayout title="Gerenciamento de Cache">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Cache</h1>
            <p className="text-muted-foreground">
              Monitore e gerencie o sistema de cache Redis
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={refreshStats}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="destructive"
              onClick={handleFlushAll}
              disabled={flushing}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Tudo
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <BaseCard>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status Redis</p>
                  <div className="flex items-center gap-2 mt-1">
                    {stats?.redisAvailable ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">Conectado</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-orange-600">Fallback</span>
                      </>
                    )}
                  </div>
                </div>
                <Server className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
          </BaseCard>
          
          <BaseCard>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Chaves</p>
                  <p className="text-2xl font-bold">{stats?.keys?.length || 0}</p>
                </div>
                <Database className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
          </BaseCard>
          
          <BaseCard>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cache Fallback</p>
                  <p className="text-2xl font-bold">{stats?.fallbackSize || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
          </BaseCard>
          
          <BaseCard>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chaves Filtradas</p>
                  <p className="text-2xl font-bold">{filteredKeys.length}</p>
                </div>
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
          </BaseCard>
        </div>

        {/* Alertas */}
        {!stats?.redisAvailable && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Redis não está disponível. O sistema está usando cache em memória como fallback.
              Verifique a configuração do Redis para melhor performance.
            </AlertDescription>
          </Alert>
        )}

        {/* Busca */}
        <BaseCard>
          <div className="p-4">
            <Label htmlFor="search">Buscar Chaves de Cache</Label>
            <Input
              id="search"
              placeholder="Digite para filtrar as chaves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2"
            />
          </div>
        </BaseCard>

        {/* Lista de Chaves */}
        <BaseCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chaves de Cache</h2>
              <Badge variant="secondary">
                {filteredKeys.length} de {stats?.keys?.length || 0}
              </Badge>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nenhuma chave encontrada para o filtro.' : 'Nenhuma chave de cache encontrada.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredKeys.map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        {getCacheTypeIcon(key)}
                        <Badge 
                          variant="secondary" 
                          className={getCacheTypeColor(key)}
                        >
                          {key.split(':')[0]}
                        </Badge>
                      </div>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {key}
                      </code>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInvalidateKey(key)}
                      disabled={invalidating}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </BaseCard>

        {/* Instruções */}
        <BaseCard>
          <div className="p-4">
            <h3 className="font-semibold mb-2">Instruções</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Redis:</strong> Sistema de cache principal para melhor performance</p>
              <p>• <strong>Fallback:</strong> Cache em memória usado quando Redis não está disponível</p>
              <p>• <strong>TTL:</strong> Tempo de vida automático configurado por tipo de cache</p>
              <p>• <strong>Invalidação:</strong> Remove dados específicos do cache</p>
              <p>• <strong>Flush All:</strong> Remove todos os dados do cache (use com cuidado)</p>
            </div>
          </div>
        </BaseCard>
      </div>
    </BaseLayout>
  );
}