import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error caught by boundary', { error, errorInfo }, 'ErrorBoundary');
    
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Oops! Algo deu errado</AlertTitle>
              <AlertDescription>
                Ocorreu um erro inesperado. Nossa equipe foi notificada.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={this.handleRetry} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button onClick={this.handleReload} className="flex-1">
                Recarregar Página
              </Button>
            </div>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-gray-100 rounded-lg">
                <summary className="cursor-pointer font-medium text-sm">
                  Detalhes do Erro (Desenvolvimento)
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar em componentes funcionais
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    logger.error('Error handled by hook', { error, errorInfo }, 'ErrorHandler');
    
    // Em produção, erros são automaticamente capturados pelo Sentry
    if (import.meta.env.MODE === 'production') {
      console.error('Error boundary triggered:', error);
    }
  };
}

// Componente de erro mais específico para operações críticas
export function CriticalErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  React.useEffect(() => {
    logger.error('Critical error occurred', error, 'CriticalError');
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">Erro Crítico</h2>
        <p className="text-muted-foreground max-w-md">
          Esta operação não pode ser concluída. Tente novamente em alguns minutos.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={resetError} variant="outline">
            Tentar Novamente
          </Button>
          <Button onClick={() => window.location.reload()}>
            Recarregar Página
          </Button>
        </div>
      </div>
    </div>
  );
}