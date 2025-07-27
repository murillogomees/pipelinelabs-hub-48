
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private errorCount = 0;
  private lastErrorTime = 0;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: ''
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Prevenir loops infinitos de erro
    const now = Date.now();
    if (now - this.lastErrorTime < 1000) {
      this.errorCount++;
      if (this.errorCount > 5) {
        console.error('Too many errors in short time, stopping error boundary');
        return;
      }
    } else {
      this.errorCount = 1;
    }
    this.lastErrorTime = now;

    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log para ferramentas de monitoramento se disponível
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
    this.errorCount = 0;
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isInfiniteLoop = this.state.error?.message?.includes('Maximum update depth exceeded');

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 text-destructive">
                <AlertTriangle className="w-full h-full" />
              </div>
              <CardTitle className="text-destructive">
                {isInfiniteLoop ? 'Loop Infinito Detectado' : 'Ops! Algo deu errado'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {isInfiniteLoop 
                  ? 'Um componente está causando atualizações infinitas. Recarregue a página para corrigir.'
                  : 'Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.'
                }
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-muted p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
                  <p className="text-destructive font-semibold">Erro (dev only):</p>
                  <p className="mt-1">{this.state.error.message}</p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Stack Trace</summary>
                      <pre className="mt-1 text-xs whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                {!isInfiniteLoop && (
                  <Button onClick={this.handleReset} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </Button>
                )}
                
                <Button variant="outline" onClick={this.handleReload} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar página
                </Button>
                
                <Button variant="ghost" onClick={this.handleGoHome} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Ir para início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
