
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isSecurityError: boolean;
}

export class SecurityBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isSecurityError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Determine if this is a security-related error
    const isSecurityError = error.message?.toLowerCase().includes('security') ||
                           error.message?.toLowerCase().includes('unauthorized') ||
                           error.message?.toLowerCase().includes('forbidden') ||
                           error.stack?.toLowerCase().includes('security');

    return { 
      hasError: true, 
      error,
      errorInfo: null,
      isSecurityError 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SecurityBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Only log to security if it's actually a security error
    if (this.state.isSecurityError) {
      // Log security event (if available)
      try {
        import('@/components/Security/SecurityEventLogger').then(({ securityLogger }) => {
          securityLogger.logSecurityViolation('security_boundary_error', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
          });
        });
      } catch (logError) {
        console.warn('Failed to log security error:', logError);
      }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isSecurityError: false
    });
  };

  public render() {
    if (this.state.hasError && this.state.isSecurityError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-md border-destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Erro de Segurança</AlertTitle>
            <AlertDescription className="mt-2 mb-4">
              Ocorreu um erro inesperado. Por motivos de segurança, esta sessão foi encerrada. 
              Por favor, recarregue a página e tente novamente.
            </AlertDescription>
            <div className="flex gap-2">
              <Button onClick={this.handleReload} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar Página
              </Button>
              <Button onClick={this.handleReset} variant="ghost" size="sm">
                Tentar Novamente
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    // For non-security errors, just render children normally
    return this.props.children;
  }
}
