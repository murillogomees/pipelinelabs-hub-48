import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function RateLimitDemo() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Array<{
    timestamp: string;
    success: boolean;
    data?: any;
    error?: string;
    rateLimitHeaders?: Record<string, string>;
  }>>([]);

  const testRateLimit = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('demo-rate-limit', {
        body: { message }
      });
      
      const timestamp = new Date().toISOString();
      
      if (error) {
        setResponses(prev => [...prev, {
          timestamp,
          success: false,
          error: error.message,
          rateLimitHeaders: error.context?.rateLimitHeaders
        }]);
      } else {
        setResponses(prev => [...prev, {
          timestamp,
          success: true,
          data,
          rateLimitHeaders: data?.rateLimitHeaders
        }]);
      }
    } catch (err: any) {
      setResponses(prev => [...prev, {
        timestamp: new Date().toISOString(),
        success: false,
        error: err.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearResponses = () => {
    setResponses([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rate Limit Demo
          </CardTitle>
          <CardDescription>
            Teste o sistema de rate limiting das Edge Functions. Limite: 5 requisições por minuto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem de teste</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite uma mensagem para testar..."
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={testRateLimit} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Testando...' : 'Testar Rate Limit'}
            </Button>
            <Button 
              onClick={clearResponses} 
              variant="outline"
              disabled={responses.length === 0}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Respostas ({responses.length})</h3>
        
        {responses.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma resposta ainda. Clique em "Testar Rate Limit" para começar.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {responses.map((response, index) => (
              <Card key={index} className={`${response.success ? 'border-green-200' : 'border-red-200'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {response.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {response.success ? 'Sucesso' : 'Erro'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(response.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {response.success && response.data && (
                        <div className="text-sm space-y-1">
                          <p><strong>Resposta:</strong> {response.data.message}</p>
                          <p><strong>Timestamp:</strong> {response.data.timestamp}</p>
                          <p><strong>Cliente:</strong> {response.data.clientKey}</p>
                        </div>
                      )}
                      
                      {!response.success && response.error && (
                        <div className="text-sm text-red-600">
                          <strong>Erro:</strong> {response.error}
                        </div>
                      )}
                      
                      {response.rateLimitHeaders && (
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          <strong>Headers de Rate Limit:</strong>
                          <pre className="mt-1 text-xs">
                            {JSON.stringify(response.rateLimitHeaders, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}