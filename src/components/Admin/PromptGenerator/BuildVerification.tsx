
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, RefreshCw, Play } from 'lucide-react';

export interface BuildVerificationProps {
  buildStatus: 'success' | 'failed' | 'running';
  buildErrors?: string[];
  onRetry: () => void;
  onComplete: () => void;
}

export const BuildVerification: React.FC<BuildVerificationProps> = ({
  buildStatus,
  buildErrors = [],
  onRetry,
  onComplete
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (buildStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-yellow-600 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <h3 className="text-lg font-semibold">Verificação de Build</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status do Build</span>
            <Badge className={getStatusColor(buildStatus)}>
              {buildStatus === 'running' ? 'Executando' : buildStatus === 'success' ? 'Sucesso' : 'Falhou'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {buildStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                ✅ Build executado com sucesso! As alterações foram aplicadas e o sistema está funcionando corretamente.
              </AlertDescription>
            </Alert>
          )}

          {buildStatus === 'failed' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                ❌ Build falhou. Verifique os erros abaixo e tente novamente.
              </AlertDescription>
            </Alert>
          )}

          {buildStatus === 'running' && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
              <AlertDescription>
                🔄 Build em execução. Aguarde enquanto verificamos as alterações...
              </AlertDescription>
            </Alert>
          )}

          {buildErrors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Erros Encontrados:</h4>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <ul className="text-sm space-y-1">
                  {buildErrors.map((error, index) => (
                    <li key={index} className="text-red-700">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {buildStatus === 'failed' && (
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
            
            {buildStatus === 'success' && (
              <Button onClick={onComplete}>
                <Play className="h-4 w-4 mr-2" />
                Nova Implementação
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
