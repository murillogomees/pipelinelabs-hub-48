import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCompression, CompressionMetrics } from '@/utils/compression';
import { 
  Zap, 
  TrendingDown, 
  FileText, 
  Gauge, 
  RefreshCw,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

export function CompressionMonitor() {
  const { toast } = useToast();
  const { 
    testCompression, 
    getMetrics, 
    getStats, 
    logMetrics, 
    browserSupport 
  } = useCompression();
  
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<CompressionMetrics | null>(null);
  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [getStats]);

  const handleTestCompression = async () => {
    setIsLoading(true);
    
    try {
      const result = await testCompression();
      setTestResult(result);
      setStats(getStats());
      
      if (result) {
        toast({
          title: 'Teste de compressão concluído',
          description: `Compressão ${result.compressionType}: ${result.compressionRatio.toFixed(1)}% de redução`,
        });
      } else {
        toast({
          title: 'Teste falhado',
          description: 'Não foi possível testar a compressão',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao executar teste de compressão',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Monitor de Compressão HTTP</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe a performance da compressão Gzip e Brotli
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => logMetrics()}
          >
            <FileText className="w-4 h-4 mr-2" />
            Log Métricas
          </Button>
          <Button
            onClick={handleTestCompression}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Testar Compressão
          </Button>
        </div>
      </div>

      {/* Suporte do Navegador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gauge className="w-5 h-5 mr-2" />
            Suporte do Navegador
          </CardTitle>
          <CardDescription>
            Capacidades de compressão detectadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              {browserSupport.gzip ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Gzip</span>
              <Badge variant={browserSupport.gzip ? "default" : "destructive"}>
                {browserSupport.gzip ? 'Suportado' : 'Não suportado'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {browserSupport.brotli ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">Brotli</span>
              <Badge variant={browserSupport.brotli ? "default" : "secondary"}>
                {browserSupport.brotli ? 'Suportado' : 'Não suportado'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Requisições Monitoradas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Total de requisições com compressão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa Média de Compressão
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageCompressionRatio.toFixed(1)}%
            </div>
            <Progress 
              value={stats.averageCompressionRatio} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bytes Economizados
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(stats.totalBytesSaved)}
            </div>
            <p className="text-xs text-muted-foreground">
              Redução total de tráfego
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Tipo */}
      {Object.keys(stats.compressionTypeDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Compressão</CardTitle>
            <CardDescription>
              Como as requisições estão sendo comprimidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.compressionTypeDistribution).map(([type, count]) => {
                const percentage = ((count as number) / stats.totalRequests) * 100;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        type === 'br' ? 'default' : 
                        type === 'gzip' ? 'secondary' : 
                        'outline'
                      }>
                        {type === 'br' ? 'Brotli' : 
                         type === 'gzip' ? 'Gzip' : 
                         'Sem compressão'}
                      </Badge>
                      <span className="text-sm">{count as number} requisições</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado do Último Teste */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Último Teste</CardTitle>
            <CardDescription>
              Teste realizado em {new Date(testResult.timestamp).toLocaleString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Tamanho Original</div>
                <div className="text-lg font-medium">
                  {formatBytes(testResult.originalSize)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Tamanho Comprimido</div>
                <div className="text-lg font-medium">
                  {formatBytes(testResult.compressedSize)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Taxa de Compressão</div>
                <div className="text-lg font-medium text-green-600">
                  {testResult.compressionRatio.toFixed(1)}%
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Tipo</div>
                <div className="text-lg font-medium">
                  <Badge variant={testResult.compressionType === 'br' ? 'default' : 'secondary'}>
                    {testResult.compressionType === 'br' ? 'Brotli' : 
                     testResult.compressionType === 'gzip' ? 'Gzip' : 
                     'Nenhum'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico Recente */}
      {getMetrics().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
            <CardDescription>
              Últimas {Math.min(getMetrics().length, 10)} requisições monitoradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getMetrics().slice(-10).reverse().map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {metric.compressionType === 'br' ? 'BR' : 
                       metric.compressionType === 'gzip' ? 'GZ' : 
                       'NONE'}
                    </Badge>
                    <span className="text-muted-foreground">
                      {new Date(metric.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{formatBytes(metric.originalSize)} → {formatBytes(metric.compressedSize)}</span>
                    <span className="text-green-600 font-medium">
                      -{metric.compressionRatio.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}