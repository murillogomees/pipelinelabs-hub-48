import { supabase } from '@/integrations/supabase/client';

// Interface para métricas de compressão
export interface CompressionMetrics {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressionType: 'gzip' | 'br' | 'none';
  timestamp: string;
}

// Classe para gerenciar compressão no cliente
export class CompressionManager {
  private static instance: CompressionManager;
  private metrics: CompressionMetrics[] = [];

  static getInstance(): CompressionManager {
    if (!CompressionManager.instance) {
      CompressionManager.instance = new CompressionManager();
    }
    return CompressionManager.instance;
  }

  // Verificar suporte do navegador para compressão
  getBrowserSupport(): { gzip: boolean; brotli: boolean } {
    const userAgent = navigator.userAgent.toLowerCase();
    
    return {
      gzip: true, // Gzip é suportado por todos os navegadores modernos
      brotli: this.supportsBrotli(userAgent)
    };
  }

  private supportsBrotli(userAgent: string): boolean {
    // Chrome 51+, Firefox 44+, Safari 14+, Edge 15+
    if (userAgent.includes('chrome/')) {
      const version = parseInt(userAgent.match(/chrome\/(\d+)/)?.[1] || '0');
      return version >= 51;
    }
    
    if (userAgent.includes('firefox/')) {
      const version = parseInt(userAgent.match(/firefox\/(\d+)/)?.[1] || '0');
      return version >= 44;
    }
    
    if (userAgent.includes('safari/') && userAgent.includes('version/')) {
      const version = parseInt(userAgent.match(/version\/(\d+)/)?.[1] || '0');
      return version >= 14;
    }
    
    if (userAgent.includes('edge/')) {
      const version = parseInt(userAgent.match(/edge\/(\d+)/)?.[1] || '0');
      return version >= 15;
    }
    
    return false;
  }

  // Fazer requisição com compressão otimizada
  async fetchWithCompression(url: string, options: RequestInit = {}): Promise<Response> {
    const support = this.getBrowserSupport();
    
    // Configurar headers para aceitar compressão
    const headers = new Headers(options.headers);
    
    const acceptEncoding: string[] = [];
    if (support.brotli) acceptEncoding.push('br');
    if (support.gzip) acceptEncoding.push('gzip');
    acceptEncoding.push('deflate');
    
    headers.set('Accept-Encoding', acceptEncoding.join(', '));
    
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Coletar métricas se disponíveis
    this.collectMetrics(response);
    
    return response;
  }

  // Coletar métricas de compressão
  private collectMetrics(response: Response): void {
    const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
    const compressedSize = parseInt(response.headers.get('X-Compressed-Size') || '0');
    const contentEncoding = response.headers.get('Content-Encoding');
    
    if (originalSize > 0 && compressedSize > 0) {
      const compressionRatio = ((1 - compressedSize / originalSize) * 100);
      
      this.metrics.push({
        originalSize,
        compressedSize,
        compressionRatio,
        compressionType: contentEncoding as 'gzip' | 'br' | 'none' || 'none',
        timestamp: new Date().toISOString()
      });

      // Manter apenas as últimas 100 métricas
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }
    }
  }

  // Obter métricas coletadas
  getMetrics(): CompressionMetrics[] {
    return [...this.metrics];
  }

  // Calcular estatísticas de compressão
  getCompressionStats(): {
    totalRequests: number;
    averageCompressionRatio: number;
    totalBytesSaved: number;
    compressionTypeDistribution: Record<string, number>;
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageCompressionRatio: 0,
        totalBytesSaved: 0,
        compressionTypeDistribution: {}
      };
    }

    const totalRequests = this.metrics.length;
    const averageCompressionRatio = this.metrics.reduce((sum, metric) => 
      sum + metric.compressionRatio, 0) / totalRequests;
    
    const totalBytesSaved = this.metrics.reduce((sum, metric) => 
      sum + (metric.originalSize - metric.compressedSize), 0);
    
    const compressionTypeDistribution = this.metrics.reduce((dist, metric) => {
      dist[metric.compressionType] = (dist[metric.compressionType] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    return {
      totalRequests,
      averageCompressionRatio,
      totalBytesSaved,
      compressionTypeDistribution
    };
  }

  // Test server compression
  async testCompression(): Promise<CompressionMetrics | null> {
    try {
      console.log('Testing HTTP compression...');
      
      // Create a test URL that points to the test-compression endpoint
      const testUrl = 'https://ycqinuwrlhuxotypqlfh.supabase.co/functions/v1/compression-proxy/test-compression';
      
      const response = await this.fetchWithCompression(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljcWludXdybGh1eG90eXBxbGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODg2MjIsImV4cCI6MjA2NzY2NDYyMn0.p8AcfnfR44BVF0T28sIgL9Qtnu1uwyGywc-p7Uh0wKQ',
        }
      });

      if (!response.ok) {
        console.error('Compression test failed:', response.status, response.statusText);
        return null;
      }

      // The metrics should have been collected by fetchWithCompression
      const metrics = this.getMetrics();
      const latestMetric = metrics[metrics.length - 1];
      
      if (latestMetric) {
        console.log('Compression test successful:', {
          ratio: latestMetric.compressionRatio.toFixed(1) + '%',
          type: latestMetric.compressionType,
          original: latestMetric.originalSize,
          compressed: latestMetric.compressedSize
        });
      }
      
      return latestMetric || null;
    } catch (error) {
      console.error('Error testing compression:', error);
      return null;
    }
  }

  // Otimizar requisições para APIs do sistema
  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await this.fetchWithCompression(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Performance logging for debugging
  logPerformanceMetrics(): void {
    const stats = this.getCompressionStats();
    
    console.group('🗜️ HTTP Compression Metrics');
    console.log('Total requests:', stats.totalRequests);
    console.log('Average compression ratio:', stats.averageCompressionRatio.toFixed(1) + '%');
    console.log('Bytes saved:', (stats.totalBytesSaved / 1024).toFixed(1) + 'KB');
    console.log('Distribution by type:', stats.compressionTypeDistribution);
    console.groupEnd();
  }
}

// Hook React para usar compressão
export function useCompression() {
  const manager = CompressionManager.getInstance();
  
  return {
    fetchWithCompression: manager.fetchWithCompression.bind(manager),
    testCompression: manager.testCompression.bind(manager),
    getMetrics: manager.getMetrics.bind(manager),
    getStats: manager.getCompressionStats.bind(manager),
    logMetrics: manager.logPerformanceMetrics.bind(manager),
    browserSupport: manager.getBrowserSupport()
  };
}

// Função para interceptar requests do React Query
export function createCompressedQueryClient() {
  const manager = CompressionManager.getInstance();
  
  return {
    defaultOptions: {
      queries: {
        queryFn: async ({ queryKey, meta }: any) => {
          const url = meta?.url || queryKey[0];
          const response = await manager.fetchWithCompression(url);
          return response.json();
        }
      }
    }
  };
}

// Exportar instância global
export const compressionManager = CompressionManager.getInstance();