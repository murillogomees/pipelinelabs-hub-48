
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Upload, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCertificateManager } from '@/hooks/useCertificateManager';

export function CertificadoTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const {
    certificates,
    isLoading,
    uploadCertificate,
    removeCertificate,
    refetch
  } = useCertificateManager();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !password) return;

    setIsUploading(true);
    try {
      await uploadCertificate(selectedFile, password);
      setSelectedFile(null);
      setPassword('');
      refetch();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (certificateId: string) => {
    try {
      await removeCertificate(certificateId);
      refetch();
    } catch (error) {
      console.error('Erro ao remover certificado:', error);
    }
  };

  const getCertificateStatus = (expiresAt: string) => {
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration <= 0) {
      return { status: 'expired', variant: 'destructive' as const, text: 'Expirado' };
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring', variant: 'secondary' as const, text: `Expira em ${daysUntilExpiration} dias` };
    } else {
      return { status: 'valid', variant: 'default' as const, text: 'Válido' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'expiring':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Certificado Digital</CardTitle>
          <CardDescription>
            Faça upload do seu certificado digital A1 (.p12 ou .pfx)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificate-file">Arquivo do Certificado</Label>
            <Input
              id="certificate-file"
              type="file"
              accept=".p12,.pfx"
              onChange={handleFileSelect}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate-password">Senha do Certificado</Label>
            <Input
              id="certificate-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha do certificado"
            />
          </div>

          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !password || isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Enviando...' : 'Enviar Certificado'}
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O certificado será criptografado e armazenado com segurança. 
              Certifique-se de usar um certificado válido A1.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certificados Instalados</CardTitle>
          <CardDescription>
            Gerencie seus certificados digitais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando certificados...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum certificado instalado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => {
                const statusInfo = getCertificateStatus(cert.certificate_expires_at);
                
                return (
                  <div key={cert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(statusInfo.status)}
                          <h3 className="font-medium">{cert.certificate_cn}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Válido até: {new Date(cert.certificate_expires_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.text}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemove(cert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
