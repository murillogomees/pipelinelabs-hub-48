
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { securityLogger } from './SecurityEventLogger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SecurityBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log security-relevant errors
    this.logSecurityError(error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private async logSecurityError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Check if error might be security-related
      const securityKeywords = [
        'permission', 'unauthorized', 'forbidden', 'csrf', 'xss', 'sql',
        'injection', 'token', 'auth', 'session', 'cookie', 'cors'
      ];
      
      const isSecurityRelated = securityKeywords.some(keyword => 
        error.message.toLowerCase().includes(keyword) ||
        error.stack?.toLowerCase().includes(keyword) ||
        errorInfo.componentStack.toLowerCase().includes(keyword)
      );

      await securityLogger.logEvent(
        'client_error_boundary',
        isSecurityRelated ? 'high' : 'medium',
        {
          error_message: error.message,
          error_name: error.name,
          component_stack: errorInfo.componentStack,
          is_security_related: isSecurityRelated,
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
          url: window.location.href
        }
      );
    } catch (loggingError) {
      console.error('Failed to log security error:', loggingError);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ocorreu um erro inesperado. Por motivos de segurança, esta sessão foi encerrada.
              Por favor, recarregue a página e tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy use
export function withSecurityBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function SecuredComponent(props: P) {
    return (
      <SecurityBoundary fallback={fallback}>
        <Component {...props} />
      </SecurityBoundary>
    );
  };
}
