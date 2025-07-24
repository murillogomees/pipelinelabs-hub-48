import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OAuthCallbackProps {
  className?: string;
}

export const OAuthCallback = ({ className }: OAuthCallbackProps) => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processando autenticação...');
  const { toast } = useToast();

  useEffect(() => {
    processOAuthCallback();
  }, []);

  const processOAuthCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        throw new Error(`Erro na autenticação: ${error}`);
      }

      if (!code || !state) {
        throw new Error('Parâmetros OAuth inválidos');
      }

      // Extrair integration_id do state
      const integrationId = state.split('_')[0];

      console.log('Processing OAuth callback for integration:', integrationId);

      // Chamar edge function para processar callback
      const { data, error: callbackError } = await supabase.functions.invoke('marketplace-oauth-callback', {
        body: {
          integration_id: integrationId,
          authorization_code: code,
          state: state
        }
      });

      if (callbackError) {
        throw callbackError;
      }

      if (data?.success) {
        setStatus('success');
        setMessage('Integração configurada com sucesso! Você será redirecionado em instantes.');
        
        toast({
          title: "Sucesso!",
          description: "Marketplace conectado com sucesso!"
        });

        // Redirecionar após 3 segundos
        setTimeout(() => {
          window.location.href = '/app/admin/marketplace-channels';
        }, 3000);
      } else {
        throw new Error(data?.error || 'Erro desconhecido no callback');
      }

    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.message || 'Erro ao processar autenticação');
      
      toast({
        title: "Erro na autenticação",
        description: error.message || "Falha ao conectar marketplace",
        variant: "destructive"
      });
    }
  };

  const handleRetry = () => {
    setStatus('processing');
    setMessage('Tentando novamente...');
    processOAuthCallback();
  };

  const handleGoBack = () => {
    window.location.href = '/app/admin/marketplace-channels';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            {status === 'processing' && (
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
            {status === 'error' && (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <CardTitle className="text-xl">
            {status === 'processing' && 'Finalizando Conexão'}
            {status === 'success' && 'Conectado com Sucesso!'}
            {status === 'error' && 'Erro na Conexão'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Webhooks configurados automaticamente para sincronização em tempo real.
                </p>
              </div>
              <Button 
                onClick={handleGoBack}
                className="w-full"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir para Central de Marketplaces
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleGoBack}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handleRetry}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}

          {status === 'processing' && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Aguarde enquanto configuramos sua integração...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};