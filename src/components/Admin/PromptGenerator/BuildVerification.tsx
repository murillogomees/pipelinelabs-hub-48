
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

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
  const getStatusIcon = () => {
    switch (buildStatus) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-6 w-6 text-yellow-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (buildStatus) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusMessage = () => {
    switch (buildStatus) {
      case 'success':
        return 'Build executado com sucesso! Todas as alterações foram aplicadas corretamente.';
      case 'failed':
        return 'Build falhou. Verifique os erros abaixo e tente novamente.';
      case 'running':
        return 'Executando build... Aguarde enquanto verificamos as alterações.';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <h3 className="text-lg font-semibold">Verificação de Build</h3>
        <Badge className={getStatusColor()}>
          {buildStatus}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status da Verificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getStatusMessage()}
            </AlertDescription>
          </Alert>

          {buildErrors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Erros Encontrados:</h4>
              <div className="space-y-1">
                {buildErrors.map((error, index) => (
                  <div key={index} className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                    <code className="text-sm text-red-700">{error}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {buildStatus === 'success' && (
            <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Implementação Concluída!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Todas as alterações foram aplicadas e o sistema está funcionando corretamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        {buildStatus === 'failed' && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Corrigir Automaticamente
          </Button>
        )}
        
        <Button
          onClick={onComplete}
          disabled={buildStatus === 'running'}
          variant={buildStatus === 'success' ? 'default' : 'outline'}
        >
          {buildStatus === 'success' ? 'Finalizar' : 'Voltar'}
        </Button>
      </div>
    </div>
  );
};
