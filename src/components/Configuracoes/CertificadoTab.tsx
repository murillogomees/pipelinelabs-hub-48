import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Upload, Key, Calendar, Shield, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCertificateManager } from '@/hooks/useCertificateManager';
import { SecureInput } from '@/components/Security';

export function CertificadoTab() {
  const {
    isUploading,
    isValidating,
    validateAndUploadCertificate,
    validateCertificate,
    getCertificateStatus,
    getDaysUntilExpiration,
    removeCertificate,
    settings
  } = useCertificateManager();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !password) {
      return;
    }
    
    await validateAndUploadCertificate(selectedFile, password);
    
    // Clear form after successful upload
    setSelectedFile(null);
    setPassword('');
    
    // Reset file input
    const fileInput = document.getElementById('certificate-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const getStatusBadge = (): JSX.Element => {
    const status = getCertificateStatus();
    
    switch (status) {
      case 'none':
        return <Badge variant="secondary">Não configurado</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      case 'expiring':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Expira em breve</Badge>;
      case 'valid':
        return <Badge variant="default" className="bg-green-500">Válido</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  // Use only existing database fields
  const hasUploadedCertificate = settings?.certificado_base64;
  const certificateName = settings?.certificado_nome || 'N/A';
  const certificateExpiration = settings?.certificado_validade;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Certificado Digital A1
          </CardTitle>
          <CardDescription>
            Configure seu certificado digital A1 para emissão de notas fiscais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status do Certificado:</span>
            {getStatusBadge()}
          </div>

          {hasUploadedCertificate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Nome do Certificado</p>
                  <p className="text-xs text-muted-foreground">{certificateName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Expira em</p>
                  <p className="text-xs text-muted-foreground">
                    {certificateExpiration 
                      ? `${getDaysUntilExpiration()} dias (${new Date(certificateExpiration).toLocaleDateString('pt-BR')})`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="certificate-file">Arquivo do Certificado (.pfx ou .p12)</Label>
              <Input
                id="certificate-file"
                type="file"
                accept=".pfx,.p12"
                onChange={handleFileChange}
                className="mt-1"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="certificate-password">Senha do Certificado</Label>
              <SecureInput
                id="certificate-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha do certificado"
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || !password || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  {isValidating ? 'Validando...' : 'Enviando...'}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar Certificado
                </>
              )}
            </Button>
          </div>

          {hasUploadedCertificate && (
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Certificado Atual</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={validateCertificate}
                    disabled={isValidating}
                  >
                    {isValidating ? 'Validando...' : 'Validar'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover Certificado</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover o certificado? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={removeCertificate}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Certificado: {certificateName}</p>
                <p>Status: {settings?.certificado_status || 'Desconhecido'}</p>
                {certificateExpiration && (
                  <p>Validade: {new Date(certificateExpiration).toLocaleDateString('pt-BR')}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Informações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Certificado criptografado com AES-256-GCM
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Senha criptografada separadamente
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Chaves de criptografia externas (KMS)
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Acesso auditado e monitorado
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Descriptografia apenas em memória
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Conformidade com LGPD
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}