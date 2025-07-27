
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useNFeIntegration } from '@/hooks/useNFeIntegration';
import { 
  Upload, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Calendar,
  Building,
  Lock
} from 'lucide-react';

export const ContratanteCertificateManager: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  const {
    nfeConfig,
    isLoading,
    validateCertificate,
    isValidatingCertificate,
    uploadCertificate,
    uploadingCertificate,
    updateConfig,
    isUpdatingConfig,
    saveNFeConfig,
    getConfig,
    isConfigured,
    isSaving
  } = useNFeIntegration();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.name.endsWith('.pfx') || file.name.endsWith('.p12')) {
        setCertificateFile(file);
      } else {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione um arquivo .pfx ou .p12',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificateFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleValidateCertificate = async () => {
    if (!certificateFile || !password) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um certificado e informe a senha',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await validateCertificate({ file: certificateFile, password });
      setValidationResult(result);
      
      if (result.is_valid) {
        toast({
          title: 'Sucesso',
          description: 'Certificado validado com sucesso!',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Certificado inválido ou expirado',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao validar certificado',
        variant: 'destructive',
      });
    }
  };

  const handleSaveCertificate = async () => {
    if (!certificateFile || !password || !validationResult?.is_valid) {
      toast({
        title: 'Erro',
        description: 'Por favor, valide o certificado antes de salvar',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadCertificate(certificateFile);
      await updateConfig({
        certificate_password: password,
        is_active: true
      });
      
      toast({
        title: 'Sucesso',
        description: 'Certificado salvo com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar certificado',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciamento de Certificado A1
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div className="space-y-4">
            <Label>Certificado Digital (.pfx ou .p12)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium">
                    {certificateFile ? certificateFile.name : 'Arraste seu certificado aqui'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou clique para selecionar um arquivo
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                  className="mt-4"
                >
                  Selecionar Arquivo
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pfx,.p12"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha do Certificado</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha do certificado"
            />
          </div>

          {/* Validation Button */}
          <Button
            onClick={handleValidateCertificate}
            disabled={!certificateFile || !password || isValidatingCertificate}
            className="w-full"
          >
            {isValidatingCertificate ? 'Validando...' : 'Validar Certificado'}
          </Button>

          {/* Validation Result */}
          {validationResult && (
            <Alert className={validationResult.is_valid ? 'border-green-200' : 'border-red-200'}>
              {validationResult.is_valid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {validationResult.is_valid ? (
                  <div className="space-y-2">
                    <p className="font-medium text-green-800">Certificado válido!</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Válido até:</strong> {new Date(validationResult.valid_to).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Dias restantes:</strong> {validationResult.days_until_expiry}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="font-medium text-red-800">Certificado inválido ou expirado</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Save Button */}
          {validationResult?.is_valid && (
            <Button
              onClick={handleSaveCertificate}
              disabled={uploadingCertificate || isUpdatingConfig}
              className="w-full"
            >
              {uploadingCertificate || isUpdatingConfig ? 'Salvando...' : 'Salvar Certificado'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Certificate Info */}
      {nfeConfig?.certificate_file && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Certificado Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={nfeConfig.is_active ? 'default' : 'secondary'}>
                  {nfeConfig.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ambiente:</span>
                <Badge variant="outline">
                  {nfeConfig.environment === 'production' ? 'Produção' : 'Homologação'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última atualização:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(nfeConfig.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
