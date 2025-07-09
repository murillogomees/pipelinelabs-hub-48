import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Palette, Eye } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useToast } from '@/hooks/use-toast';

export function PersonalizacaoTab() {
  const { settings, loading, updateSettings } = useCompanySettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome_sistema: 'Pipeline Labs',
    cor_primaria: '#3b82f6',
    logo_url: '',
    favicon_url: '',
    dominio_personalizado: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    if (settings?.branding) {
      const branding = settings.branding as any;
      setFormData({
        nome_sistema: branding.nome_sistema || 'Pipeline Labs',
        cor_primaria: branding.cor_primaria || '#3b82f6',
        logo_url: branding.logo_url || '',
        favicon_url: branding.favicon_url || '',
        dominio_personalizado: branding.dominio_personalizado || ''
      });
    }
  }, [settings]);

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    // In a real app, this would upload to Supabase Storage or similar
    // For now, we'll simulate with a data URL
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo de imagem",
          variant: "destructive"
        });
        return;
      }
      setLogoFile(file);
      const url = await handleFileUpload(file, 'logo');
      setFormData(prev => ({ ...prev, logo_url: url }));
    }
  };

  const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo de imagem",
          variant: "destructive"
        });
        return;
      }
      setFaviconFile(file);
      const url = await handleFileUpload(file, 'favicon');
      setFormData(prev => ({ ...prev, favicon_url: url }));
    }
  };

  const handleSave = async () => {
    const brandingData = {
      nome_sistema: formData.nome_sistema,
      cor_primaria: formData.cor_primaria,
      logo_url: formData.logo_url,
      favicon_url: formData.favicon_url,
      dominio_personalizado: formData.dominio_personalizado
    };

    await updateSettings({
      branding: brandingData
    });
  };

  const applyPreview = () => {
    // Apply temporary styles for preview
    document.documentElement.style.setProperty('--primary', formData.cor_primaria);
    
    toast({
      title: "Preview Aplicado",
      description: "Visualize as mudanças. Salve para tornar permanente."
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Personalização / Whitelabel
        </CardTitle>
        <CardDescription>Customize a aparência do sistema para sua empresa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_sistema">Nome do Sistema</Label>
              <Input
                id="nome_sistema"
                value={formData.nome_sistema}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_sistema: e.target.value }))}
                placeholder="Pipeline Labs"
              />
              <p className="text-sm text-muted-foreground">
                Este nome aparecerá na interface do sistema
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cor_primaria">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="cor_primaria"
                  type="color"
                  value={formData.cor_primaria}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor_primaria: e.target.value }))}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.cor_primaria}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor_primaria: e.target.value }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dominio_personalizado">Domínio Personalizado</Label>
              <Input
                id="dominio_personalizado"
                value={formData.dominio_personalizado}
                onChange={(e) => setFormData(prev => ({ ...prev, dominio_personalizado: e.target.value }))}
                placeholder="meudominio.com.br"
              />
              <p className="text-sm text-muted-foreground">
                Configure um domínio personalizado para sua empresa
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logotipo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {formData.logo_url ? (
                  <div className="space-y-2">
                    <img 
                      src={formData.logo_url} 
                      alt="Logo preview" 
                      className="mx-auto max-h-16 object-contain"
                    />
                    <p className="text-sm text-muted-foreground">Logo carregado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm text-muted-foreground">Clique para fazer upload do logo</p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {formData.favicon_url ? (
                  <div className="space-y-2">
                    <img 
                      src={formData.favicon_url} 
                      alt="Favicon preview" 
                      className="mx-auto w-8 h-8 object-contain"
                    />
                    <p className="text-sm text-muted-foreground">Favicon carregado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-6 w-6 text-gray-400" />
                    <p className="text-sm text-muted-foreground">Upload do favicon (16x16px)</p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconChange}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        <Alert>
          <Palette className="h-4 w-4" />
          <AlertDescription>
            <strong>Personalização Whitelabel:</strong> As personalizações aplicadas afetarão apenas a interface 
            para os usuários da sua empresa. Use o botão "Visualizar" para testar as mudanças antes de salvar.
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button onClick={applyPreview} variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualizar Mudanças
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Salvar Personalização
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}