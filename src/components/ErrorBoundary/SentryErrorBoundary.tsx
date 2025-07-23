import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  eventId: string | null;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, eventId }) => {
  const handleReportFeedback = () => {
    if (eventId) {
      Sentry.showReportDialog({ eventId });
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 text-destructive">
            <AlertTriangle className="w-full h-full" />
          </div>
          <CardTitle className="text-destructive">Ops! Algo deu errado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
          </p>
          
          {import.meta.env.DEV && (
            <div className="bg-muted p-3 rounded text-xs font-mono">
              <p className="text-destructive font-semibold">Erro (dev only):</p>
              <p className="mt-1">{error.message}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
            
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Ir para início
            </Button>
            
            {eventId && (
              <Button variant="ghost" onClick={handleReportFeedback} className="w-full text-xs">
                Reportar problema
              </Button>
            )}
          </div>
          
          {eventId && (
            <p className="text-xs text-muted-foreground text-center">
              ID do erro: {eventId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    fallback: (errorData) => {
      const error = errorData.error instanceof Error ? errorData.error : new Error('Unknown error');
      return (
        <ErrorFallback 
          error={error} 
          resetError={errorData.resetError} 
          eventId={errorData.eventId || null} 
        />
      );
    },
    beforeCapture: (scope) => {
      scope.setTag('errorBoundary', true);
    }
  }
);