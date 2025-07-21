import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Wifi, AlertTriangle } from 'lucide-react';
import { useNFeIntegration } from '@/hooks/useNFeIntegration';

interface ConnectionTestResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  timestamp: string;
}

export function NFeConnectionTest() {
  const { testConnection, validateCertificate, isConfigured, hasValidConfig } = useNFeIntegration();
  const [testing, setTesting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [lastTest, setLastTest] = useState<ConnectionTestResult | null>(null);
  const [certificateInfo, setCertificateInfo] = useState<any>(null);

  const handleTestConnection = async () => {
    if (!isConfigured) {
      setLastTest({
        status: 'error',
        message: 'Configuração NFE.io não encontrada',
        details: 'Configure a integração NFE.io antes de testar a conexão.',
        timestamp: new Date().toLocaleString()
      });
      return;
    }

    setTesting(true);
    try {
      await testConnection();
      setLastTest({
        status: 'success',
        message: 'Conexão estabelecida com sucesso',
        details: 'API NFE.io respondendo corretamente.',
        timestamp: new Date().toLocaleString()
      });
    } catch (error: any) {
      setLastTest({
        status: 'error',
        message: 'Falha na conexão',
        details: error.message || 'Erro desconhecido ao conectar com NFE.io',
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setTesting(false);
    }
  };

  const handleValidateCertificate = async () => {
    if (!hasValidConfig()) {
      setLastTest({
        status: 'error',
        message: 'Certificado não configurado',
        details: 'Configure o certificado A1 antes de validá-lo.',
        timestamp: new Date().toLocaleString()
      });
      return;
    }

    setValidating(true);
    try {
      const result = await validateCertificate();
      setCertificateInfo(result);
      
      if (result.is_valid) {
        setLastTest({
          status: result.days_until_expiry < 30 ? 'warning' : 'success',
          message: result.days_until_expiry < 30 ? 'Certificado expira em breve' : 'Certificado válido',
          details: `Válido até ${new Date(result.valid_to).toLocaleDateString()}. ${result.days_until_expiry} dias restantes.`,
          timestamp: new Date().toLocaleString()
        });
      } else {
        setLastTest({
          status: 'error',
          message: 'Certificado inválido',
          details: 'O certificado não é válido ou está corrompido.',
          timestamp: new Date().toLocaleString()
        });
      }
    } catch (error: any) {
      setLastTest({
        status: 'error',
        message: 'Erro ao validar certificado',
        details: error.message || 'Erro desconhecido na validação',
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setValidating(false);
    }
  };

  const getStatusIcon = (status: ConnectionTestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ConnectionTestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Teste de Conexão NFE.io
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={handleTestConnection}
            disabled={testing || !isConfigured}
            variant="outline"
          >
            {testing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Testar Conexão API
          </Button>
          
          <Button
            onClick={handleValidateCertificate}
            disabled={validating || !hasValidConfig()}
            variant="outline"
          >
            {validating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Validar Certificado
          </Button>
        </div>

        {!isConfigured && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Configure a integração NFE.io antes de testar a conexão.
            </AlertDescription>
          </Alert>
        )}

        {lastTest && (
          <Card className={`border-2 ${getStatusColor(lastTest.status)}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {getStatusIcon(lastTest.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{lastTest.message}</h4>
                    <Badge variant="outline" className="text-xs">
                      {lastTest.timestamp}
                    </Badge>
                  </div>
                  {lastTest.details && (
                    <p className="text-sm text-muted-foreground">
                      {lastTest.details}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {certificateInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações do Certificado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Titular:</span>
                  <p className="text-muted-foreground">{certificateInfo.subject}</p>
                </div>
                <div>
                  <span className="font-medium">Emissor:</span>
                  <p className="text-muted-foreground">{certificateInfo.issuer}</p>
                </div>
                <div>
                  <span className="font-medium">Válido de:</span>
                  <p className="text-muted-foreground">
                    {new Date(certificateInfo.valid_from).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Válido até:</span>
                  <p className="text-muted-foreground">
                    {new Date(certificateInfo.valid_to).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Número de série:</span>
                  <p className="text-muted-foreground font-mono text-xs">
                    {certificateInfo.serial_number}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge 
                    variant={certificateInfo.is_valid ? 'default' : 'destructive'}
                    className="ml-2"
                  >
                    {certificateInfo.is_valid ? 'Válido' : 'Inválido'}
                  </Badge>
                </div>
              </div>
              
              {certificateInfo.days_until_expiry < 30 && certificateInfo.is_valid && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção:</strong> O certificado expira em {certificateInfo.days_until_expiry} dias.
                    Providencie a renovação com antecedência.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}