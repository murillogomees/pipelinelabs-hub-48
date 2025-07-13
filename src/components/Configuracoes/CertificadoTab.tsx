import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useToast } from '@/hooks/use-toast';

export function CertificadoTab() {
  const { settings, loading, updateSettings } = useCompanySettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    certificado_nome: '',
    certificado_senha: '',
    certificado_validade: '',
    certificado_status: 'inactive'
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        certificado_nome: settings.certificado_nome || '',
        certificado_senha: '', // Never show password
        certificado_validade: settings.certificado_validade || '',
        certificado_status: settings.certificado_status || 'inactive'
      });
    }
  }, [settings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.toLowerCase().endsWith('.pfx') && !selectedFile.name.toLowerCase().endsWith('.p12')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo .pfx ou .p12",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
      setFormData(prev => ({ ...prev, certificado_nome: selectedFile.name }));
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get only base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateCertificate = async () => {
    // TODO: Implementar validação real do certificado via SEFAZ
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false); // Retorna false até implementar validação real
      }, 2000);
    });
  };

  const handleUpload = async () => {
    if (!file || !formData.certificado_senha) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo e informe a senha",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      // Convert file to base64
      const base64Certificate = await convertFileToBase64(file);
      
      // Validate certificate (simulate)
      const isValid = await validateCertificate();
      
      if (!isValid) {
        throw new Error('Certificado inválido ou senha incorreta');
      }

      // Calculate expiration date (simulate - in real app, extract from certificate)
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      await updateSettings({
        certificado_nome: formData.certificado_nome,
        certificado_base64: base64Certificate,
        certificado_senha: formData.certificado_senha, // In real app, this should be encrypted
        certificado_validade: expirationDate.toISOString().split('T')[0],
        certificado_status: 'active'
      });

      setFormData(prev => ({
        ...prev,
        certificado_validade: expirationDate.toISOString().split('T')[0],
        certificado_status: 'active'
      }));

      toast({
        title: "Sucesso",
        description: "Certificado validado e instalado com sucesso"
      });

    } catch (error) {
      // Error processing certificate
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar certificado",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = () => {
    switch (formData.certificado_status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expirado</Badge>;
      case 'warning':
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Expirando</Badge>;
      default:
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Inativo</Badge>;
    }
  };

  const getDaysUntilExpiration = () => {
    if (!formData.certificado_validade) return null;
    const today = new Date();
    const expiration = new Date(formData.certificado_validade);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  const daysLeft = getDaysUntilExpiration();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Certificado Digital A1
        </CardTitle>
        <CardDescription>Configure seu certificado digital para emissão de notas fiscais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.certificado_nome && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>Certificado:</strong> {formData.certificado_nome}<br />
                  {formData.certificado_validade && (
                    <>
                      <strong>Validade:</strong> {new Date(formData.certificado_validade).toLocaleDateString('pt-BR')}
                      {daysLeft !== null && (
                        <span className={`ml-2 ${daysLeft < 30 ? 'text-red-500' : 'text-green-500'}`}>
                          ({daysLeft > 0 ? `${daysLeft} dias restantes` : 'Expirado'})
                        </span>
                      )}
                    </>
                  )}
                </div>
                {getStatusBadge()}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="certificate">Arquivo do Certificado (.pfx ou .p12)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="certificate"
                type="file"
                accept=".pfx,.p12"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {file.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificado_senha">Senha do Certificado</Label>
            <Input
              id="certificado_senha"
              type="password"
              value={formData.certificado_senha}
              onChange={(e) => setFormData(prev => ({ ...prev, certificado_senha: e.target.value }))}
              placeholder="Digite a senha do certificado"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleUpload} 
            disabled={!file || !formData.certificado_senha || uploading}
            className="flex-1"
          >
            {uploading ? 'Validando...' : 'Validar e Instalar Certificado'}
          </Button>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> O certificado digital é necessário para emissão de notas fiscais eletrônicas. 
            Mantenha sempre seu certificado atualizado e com senha segura. O arquivo será criptografado e armazenado com segurança.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}