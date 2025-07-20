import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  FileKey,
  Settings
} from 'lucide-react';
import { useNFeIntegration } from '@/hooks/useNFeIntegration';
import { useUserRole } from '@/hooks/useUserRole';

interface CertificateStatusProps {
  certificateInfo?: any;
  isLoading?: boolean;
}

const CertificateStatus = ({ certificateInfo, isLoading }: CertificateStatusProps) => {
  if (isLoading) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>Verificando certificado...</AlertDescription>
      </Alert>
    );
  }

  if (!certificateInfo) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Nenhum certificado configurado</AlertDescription>
      </Alert>
    );
  }

  const { is_valid, days_until_expiry, subject, valid_to } = certificateInfo;
  const isExpiringSoon = days_until_expiry <= 30;

  return (
    <Alert className={isExpiringSoon ? "border-yellow-500" : "border-green-500"}>
      <div className="flex items-start gap-3">
        {is_valid ? (
          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
        )}
        <div className="flex-1 space-y-1">
          <div className="font-medium">
            Certificado {is_valid ? 'Válido' : 'Inválido'}
          </div>
          <div className="text-sm text-muted-foreground">
            <div>Titular: {subject}</div>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3" />
              <span>Expira em: {valid_to}</span>
              <Badge variant={isExpiringSoon ? "destructive" : "secondary"}>
                {days_until_expiry} dias
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
};

export const ContratanteCertificateManager = () => {
  const { isContratante } = useUserRole();
  const { 
    saveNFeConfig, 
    validateCertificate,
    getConfig, 
    isConfigured,
    isSaving,
    uploadingCertificate 
  } = useNFeIntegration();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [certificateInfo, setCertificateInfo] = useState<any>(null);
  const [validatingCertificate, setValidatingCertificate] = useState(false);

  const [config, setConfig] = useState(() => ({
    company_cnpj: '',
    certificate_password: '',
    nfe_series: '001',
    default_cfop: '',
    auto_send: true,
    email_notification: true,
    ...getConfig()
  }));

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isContratante) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Acesso restrito a contratantes. Você não tem permissão para gerenciar certificados.
        </AlertDescription>
      </Alert>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setConfig(prev => ({ ...prev, certificate_file: file }));
    }
  };

  const handleSave = async () => {
    try {
      await saveNFeConfig({
        ...config,
        certificate_file: selectedFile || undefined
      });
      
      // Após salvar, validar o certificado
      if (selectedFile || isConfigured) {
        handleValidateCertificate();
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleValidateCertificate = async () => {
    if (!isConfigured) return;
    
    setValidatingCertificate(true);
    try {
      const info = await validateCertificate();
      setCertificateInfo(info);
    } catch (error) {
      console.error('Erro ao validar certificado:', error);
    } finally {
      setValidatingCertificate(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileKey className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Certificado A1</h2>
          <p className="text-muted-foreground">
            Configure seu certificado digital A1 para emissão de NFes
          </p>
        </div>
      </div>

      {/* Status do Certificado */}
      <CertificateStatus 
        certificateInfo={certificateInfo} 
        isLoading={validatingCertificate} 
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>
              Configure os dados fiscais da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_cnpj">CNPJ da Empresa *</Label>
              <Input
                id="company_cnpj"
                placeholder="00.000.000/0000-00"
                value={config.company_cnpj || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, company_cnpj: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nfe_series">Série da NFe</Label>
                <Input
                  id="nfe_series"
                  placeholder="001"
                  value={config.nfe_series || '001'}
                  onChange={(e) => setConfig(prev => ({ ...prev, nfe_series: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_cfop">CFOP Padrão</Label>
                <Input
                  id="default_cfop"
                  placeholder="5102"
                  value={config.default_cfop || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, default_cfop: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificado Digital */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Certificado Digital A1
            </CardTitle>
            <CardDescription>
              Faça upload do seu certificado digital (.pfx/.p12)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Arquivo do Certificado</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {selectedFile ? selectedFile.name : 'Selecionar arquivo'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pfx,.p12"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Aceita arquivos .pfx e .p12
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate_password">Senha do Certificado *</Label>
              <Input
                id="certificate_password"
                type="password"
                placeholder="Digite a senha do certificado..."
                value={config.certificate_password || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, certificate_password: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Emissão</CardTitle>
          <CardDescription>
            Configure como as NFes serão emitidas automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Envio Automático</Label>
              <p className="text-sm text-muted-foreground">
                Enviar NFes automaticamente após emissão
              </p>
            </div>
            <Switch
              checked={config.auto_send}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auto_send: checked }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificação por E-mail</Label>
              <p className="text-sm text-muted-foreground">
                Enviar NFe por e-mail para o cliente automaticamente
              </p>
            </div>
            <Switch
              checked={config.email_notification}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, email_notification: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleValidateCertificate}
          disabled={!isConfigured || validatingCertificate}
        >
          {validatingCertificate ? 'Validando...' : 'Validar Certificado'}
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaving || uploadingCertificate || !config.company_cnpj || !config.certificate_password}
        >
          {isSaving || uploadingCertificate ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </div>
    </div>
  );
};