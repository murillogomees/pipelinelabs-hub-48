
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, RefreshCw, Terminal, AlertTriangle } from 'lucide-react';

interface BuildError {
  file: string;
  line: number;
  column: number;
  message: string;
  type: 'error' | 'warning';
}

interface BuildVerificationProps {
  buildStatus: 'success' | 'failed' | 'running';
  errors?: BuildError[];
  onFixAutomatically: () => void;
  onRunBuild: () => void;
  isFixing: boolean;
  isRunning: boolean;
}

export const BuildVerification: React.FC<BuildVerificationProps> = ({
  buildStatus,
  errors = [],
  onFixAutomatically,
  onRunBuild,
  isFixing,
  isRunning
}) => {
  const getStatusIcon = () => {
    switch (buildStatus) {
      case 'success': return CheckCircle;
      case 'failed': return AlertCircle;
      case 'running': return RefreshCw;
      default: return Terminal;
    }
  };

  const getStatusColor = () => {
    switch (buildStatus) {
      case 'success': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'running': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className={`border-l-4 ${
      buildStatus === 'success' ? 'border-l-green-500' : 
      buildStatus === 'failed' ? 'border-l-red-500' : 'border-l-blue-500'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${getStatusColor()} ${buildStatus === 'running' ? 'animate-spin' : ''}`} />
          Verificação de Build
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {buildStatus === 'success' && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              Build Bem-Sucedido! 🎉
            </h4>
            <p className="text-sm text-green-700">
              Excelente! Todas as alterações foram implementadas com sucesso e o sistema está funcionando perfeitamente. 
              A implementação foi finalizada sem erros e está pronta para uso.
            </p>
          </div>
        )}

        {buildStatus === 'running' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Executando Build...
            </h4>
            <p className="text-sm text-blue-700">
              Por favor, aguarde enquanto verificamos se todas as alterações foram aplicadas corretamente.
            </p>
          </div>
        )}

        {buildStatus === 'failed' && (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                Build Falhou - Erros Encontrados
              </h4>
              <p className="text-sm text-red-700 mb-3">
                Foram encontrados {errors.length} erro(s) que impedem o funcionamento do sistema. 
                Vamos analisar e corrigir automaticamente.
              </p>
            </div>

            {errors.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Detalhes dos Erros
                </h5>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {errors.map((error, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-l-red-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{error.file}</span>
                        <Badge variant={error.type === 'error' ? 'destructive' : 'secondary'} className="text-xs">
                          {error.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        Linha {error.line}, Coluna {error.column}
                      </p>
                      <p className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">
                        {error.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2 flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                Análise de Impacto
              </h5>
              <p className="text-sm text-yellow-700 mb-2">
                <strong>Impacto provável:</strong> Os erros encontrados podem afetar o carregamento da aplicação 
                e impedir que as novas funcionalidades sejam executadas corretamente.
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Solução:</strong> Vou analisar automaticamente os erros e aplicar as correções necessárias 
                para garantir que o sistema funcione perfeitamente.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onFixAutomatically}
                disabled={isFixing}
                className="flex-1"
              >
                {isFixing ? 'Corrigindo...' : 'Corrigir Automaticamente'}
              </Button>
              <Button
                onClick={onRunBuild}
                variant="outline"
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? 'Executando...' : 'Executar Build Novamente'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
