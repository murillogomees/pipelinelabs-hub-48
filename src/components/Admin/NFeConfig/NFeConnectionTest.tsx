
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useNFeIntegration } from '@/hooks/useNFeIntegration';
import { 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Shield,
  Calendar,
  FileText,
  Clock
} from 'lucide-react';

export const NFeConnectionTest: React.FC = () => {
  const { nfeConfig, testConnection, isTestingConnection, validateCertificate, isValidatingCertificate, isConfigured, hasValidConfig } = useNFeIntegration();
  const [testResult, setTestResult] = useState<any>(null);
  const [certificateInfo, setCertificateInfo] = useState<any>(null);

  const handleTestConnection = async () => {
    try {
      const result = await testConnection({
        api_token: nfeConfig.api_token,
        environment: nfeConfig.environment
      });
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Erro ao testar conexão' });
    }
  };

  const handleValidateCertificate = async () => {
    if (!nfeConfig.certificate_file) {
      setTestResult({ success: false, message: 'Nenhum certificado configurado' });
      return;
    }

    try {
      const result = await validateCertificate({ password: nfeConfig.certificate_password });
      setCertificateInfo(result);
      
      if (result.is_valid) {
        setTestResult({ success: true, message: 'Certificado válido' });
      } else {
        setTestResult({ success: false, message: 'Certificado inválido ou expirado' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Erro ao validar certificado' });
    }
  };

  const handleFullTest = async () => {
    // Test connection first
    await handleTestConnection();
    
    // Then validate certificate
    await handleValidateCertificate();
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getExpiryStatus = (days: number) => {
    if (days > 30) return 'success';
    if (days > 7) return 'warning';
    return 'danger';
  };

  const getExpiryColor = (days: number) => {
    const status = getExpiryStatus(days);
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Teste de Conexão NFE.io
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-medium">API</span>
              </div>
              <Badge className={getStatusColor(!!nfeConfig.api_token)}>
                {nfeConfig.api_token ? 'Configurado' : 'Não Configurado'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Certificado</span>
              </div>
              <Badge className={getStatusColor(!!nfeConfig.certificate_file)}>
                {nfeConfig.certificate_file ? 'Configurado' : 'Não Configurado'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Ambiente</span>
              </div>
              <Badge variant="outline">
                {nfeConfig.environment === 'production' ? 'Produção' : 'Homologação'}
              </Badge>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleTestConnection}
              disabled={!nfeConfig.api_token || isTestingConnection}
              className="flex-1"
            >
              {isTestingConnection ? 'Testando...' : 'Testar Conexão API'}
            </Button>
            
            <Button
              onClick={handleValidateCertificate}
              disabled={!nfeConfig.certificate_file || isValidatingCertificate}
              variant="outline"
              className="flex-1"
            >
              {isValidatingCertificate ? 'Validando...' : 'Validar Certificado'}
            </Button>
            
            <Button
              onClick={handleFullTest}
              disabled={!isConfigured || isTestingConnection || isValidatingCertificate}
              variant="secondary"
              className="flex-1"
            >
              Teste Completo
            </Button>
          </div>

          {/* Test Results */}
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200' : 'border-red-200'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="font-medium">
                  {testResult.success ? 'Teste bem-sucedido' : 'Teste falhou'}
                </div>
                <div className="text-sm mt-1">
                  {testResult.message}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Certificate Info */}
          {certificateInfo && certificateInfo.is_valid && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Certificado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Válido até:</strong> {new Date(certificateInfo.valid_to).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Dias restantes:</strong> 
                    <span className={`ml-2 font-medium ${getExpiryColor(certificateInfo.days_until_expiry)}`}>
                      {certificateInfo.days_until_expiry}
                    </span>
                  </div>
                  <div>
                    <strong>Titular:</strong> {certificateInfo.subject}
                  </div>
                  <div>
                    <strong>Emissor:</strong> {certificateInfo.issuer}
                  </div>
                  <div>
                    <strong>Número de série:</strong> {certificateInfo.serial_number}
                  </div>
                  <div>
                    <strong>Válido desde:</strong> {new Date(certificateInfo.valid_from).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-1">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium">Configure o Token da API</h4>
                <p className="text-sm text-muted-foreground">
                  Obtenha seu token no painel da NFE.io e configure nas configurações da empresa.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-1">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium">Instale o Certificado A1</h4>
                <p className="text-sm text-muted-foreground">
                  Faça upload do seu certificado digital (.pfx ou .p12) e informe a senha.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-1">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium">Teste a Conexão</h4>
                <p className="text-sm text-muted-foreground">
                  Execute os testes para verificar se tudo está funcionando corretamente.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
