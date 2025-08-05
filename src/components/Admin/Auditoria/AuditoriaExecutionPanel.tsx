
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, Square, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AuditoriaExecutionPanel');

export function AuditoriaExecutionPanel() {
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const executionMutation = useMutation({
    mutationFn: async () => {
      setExecutionStatus('running');
      setProgress(0);
      
      // Simular execução da auditoria
      const steps = [
        'Analisando arquivos...',
        'Verificando hooks...',
        'Checando componentes...',
        'Validando rotas...',
        'Gerando relatório...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(((i + 1) / steps.length) * 100);
        logger.info(`Execution step: ${steps[i]}`);
      }

      // Simular resultados
      const mockResults = {
        arquivos_analisados: 150,
        problemas_encontrados: 12,
        arquivos_nao_utilizados: Array.isArray([]) ? [] : [],
        hooks_nao_utilizados: Array.isArray([]) ? [] : [],
        componentes_duplicados: Array.isArray([]) ? [] : [],
        sugestoes_limpeza: Array.isArray([]) ? [] : [],
        tempo_execucao_ms: 5000,
      };

      setResults(mockResults);
      return mockResults;
    },
    onSuccess: () => {
      setExecutionStatus('completed');
      toast({
        title: 'Auditoria concluída',
        description: 'A auditoria foi executada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['auditoria-historico'] });
    },
    onError: (error: any) => {
      setExecutionStatus('error');
      logger.error('Error during audit execution:', error);
      toast({
        title: 'Erro na auditoria',
        description: error.message || 'Ocorreu um erro durante a execução.',
        variant: 'destructive',
      });
    }
  });

  const handleStart = () => {
    executionMutation.mutate();
  };

  const handleStop = () => {
    setExecutionStatus('idle');
    setProgress(0);
    setResults(null);
  };

  const getStatusIcon = () => {
    switch (executionStatus) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (executionStatus) {
      case 'running':
        return 'Executando...';
      case 'completed':
        return 'Concluída';
      case 'error':
        return 'Erro';
      default:
        return 'Aguardando';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Execução da Auditoria</CardTitle>
          <CardDescription>
            Execute uma auditoria manual do projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleStart}
                disabled={executionStatus === 'running'}
                variant="default"
              >
                <Play className="h-4 w-4 mr-2" />
                Executar Auditoria
              </Button>
              
              {executionStatus === 'running' && (
                <Button
                  onClick={handleStop}
                  variant="outline"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Parar
                </Button>
              )}
            </div>
          </div>

          {executionStatus === 'running' && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Progresso: {Math.round(progress)}%
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados da Auditoria</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {results.arquivos_analisados}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Arquivos Analisados
                  </div>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {results.problemas_encontrados}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Problemas Encontrados
                  </div>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Array.isArray(results.arquivos_nao_utilizados) ? results.arquivos_nao_utilizados.length : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Arquivos não Utilizados
                  </div>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {results.tempo_execucao_ms / 1000}s
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tempo de Execução
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
