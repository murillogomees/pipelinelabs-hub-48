import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Palette, Eye, Crown, AlertTriangle } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function PersonalizacaoTab() {
  const { settings, loading, updateSettings } = useCompanySettings();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome_customizado: 'Pipeline Labs',
    cor_primaria: '#3b82f6',
    logo_url: '',
    favicon_url: '',
    dominio_personalizado: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (settings?.branding) {
      const branding = settings.branding as any;
      setFormData({
        nome_customizado: branding.nome_customizado || branding.nome_sistema || 'Pipeline Labs',
        cor_primaria: branding.cor_primaria || '#3b82f6',
        logo_url: branding.logo_url || '',
        favicon_url: branding.favicon_url || '',
        dominio_personalizado: branding.dominio_personalizado || ''
      });
    }
  }, [settings]);

  const hasWhitelabelAccess = () => {
    // Check if current plan supports whitelabel
    // This would be based on the subscription plan features
    return true; // For demo purposes, allow all users
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    try {
      setUploading(true);
      
      // Get user company ID for folder structure
      const { data: companyId } = await supabase.rpc('get_user_company_id');
      if (!companyId) throw new Error('Company ID not found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/${folder}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('whitelabel')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('whitelabel')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setLogoFile(file);
      const url = await uploadFile(file, 'logos');
      setFormData(prev => ({ ...prev, logo_url: url }));
      
      toast({
        title: "Sucesso",
        description: "Logo carregado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao fazer upload do logo",
        variant: "destructive"
      });
    }
  };

  const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 1 * 1024 * 1024) { // 1MB limit for favicon
      toast({
        title: "Erro",
        description: "O favicon deve ter no máximo 1MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setFaviconFile(file);
      const url = await uploadFile(file, 'favicons');
      setFormData(prev => ({ ...prev, favicon_url: url }));
      
      toast({
        title: "Sucesso",
        description: "Favicon carregado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao fazer upload do favicon",
        variant: "destructive"
      });
    }
  };

  const validateDomain = (domain: string): boolean => {
    if (!domain) return true; // Optional field
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/;
    return domainRegex.test(domain);
  };

  const handleSave = async () => {
    if (!hasWhitelabelAccess()) {
      toast({
        title: "Acesso Negado",
        description: "Seu plano atual não inclui personalização whitelabel",
        variant: "destructive"
      });
      return;
    }

    if (formData.dominio_personalizado && !validateDomain(formData.dominio_personalizado)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um domínio válido",
        variant: "destructive"
      });
      return;
    }

    const brandingData = {
      nome_customizado: formData.nome_customizado,
      cor_primaria: formData.cor_primaria,
      logo_url: formData.logo_url,
      favicon_url: formData.favicon_url,
      dominio_personalizado: formData.dominio_personalizado
    };

    const success = await updateSettings({
      branding: brandingData
    });

    if (success) {
      applyChanges(true);
      toast({
        title: "Sucesso",
        description: "Personalização salva e aplicada com sucesso!"
      });
    }
  };

  const applyChanges = (permanent: boolean = false) => {
    // Apply color changes to CSS variables
    const root = document.documentElement;
    
    // Convert hex to HSL for our design system
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const hslColor = hexToHsl(formData.cor_primaria);
    root.style.setProperty('--primary', hslColor);

    // Update document title if customized
    if (formData.nome_customizado && formData.nome_customizado !== 'Pipeline Labs') {
      document.title = formData.nome_customizado;
    }

    // Update favicon if provided
    if (formData.favicon_url && permanent) {
      const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('href', formData.favicon_url);
      favicon.setAttribute('type', 'image/png');
      if (!document.querySelector('link[rel="icon"]')) {
        document.head.appendChild(favicon);
      }
    }

    setPreviewMode(!permanent);
    
    if (!permanent) {
      toast({
        title: "Preview Aplicado",
        description: "Visualizando as mudanças. Salve para tornar permanente.",
        variant: "default"
      });
    }
  };

  const resetPreview = () => {
    if (!previewMode) return;
    
    // Reset to original/saved colors
    const originalBranding = settings?.branding as any;
    const originalColor = originalBranding?.cor_primaria || '#3b82f6';
    const hexToHsl = (hex: string) => {
      // Same conversion function as above
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    
    document.documentElement.style.setProperty('--primary', hexToHsl(originalColor));
    setPreviewMode(false);
    
    toast({
      title: "Preview Removido",
      description: "Voltou às configurações salvas"
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Carregando configurações...</p>
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Plan Access Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Status do Plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasWhitelabelAccess() ? (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">
                Whitelabel Ativo
              </Badge>
              <span className="text-sm text-muted-foreground">
                Seu plano inclui personalização completa da marca
              </span>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Upgrade Necessário:</strong> Seu plano atual não inclui personalização whitelabel. 
                Faça upgrade para personalizar a marca do sistema.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview da Marca
          </CardTitle>
          <CardDescription>Visualização de como ficará sua marca no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-card" style={{
            borderColor: formData.cor_primaria + '40',
            backgroundImage: `linear-gradient(135deg, ${formData.cor_primaria}10, transparent)`
          }}>
            <div className="flex items-center gap-4">
              {formData.logo_url ? (
                <img 
                  src={formData.logo_url} 
                  alt="Logo preview" 
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <Palette className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg" style={{ color: formData.cor_primaria }}>
                  {formData.nome_customizado}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sistema de Gestão Empresarial
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <div 
                className="h-3 w-16 rounded"
                style={{ backgroundColor: formData.cor_primaria }}
              />
              <div 
                className="h-3 w-12 rounded"
                style={{ backgroundColor: formData.cor_primaria + '80' }}
              />
              <div 
                className="h-3 w-8 rounded"
                style={{ backgroundColor: formData.cor_primaria + '40' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Configuração da Marca
          </CardTitle>
          <CardDescription>Personalize a aparência do sistema para sua empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Text Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_customizado">Nome Personalizado do Sistema</Label>
                <Input
                  id="nome_customizado"
                  value={formData.nome_customizado}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_customizado: e.target.value }))}
                  placeholder="ERP da Minha Empresa"
                  disabled={!hasWhitelabelAccess()}
                />
                <p className="text-xs text-muted-foreground">
                  Este nome aparecerá no título e interface do sistema
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor_primaria">Cor Primária da Marca</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor_primaria"
                    type="color"
                    value={formData.cor_primaria}
                    onChange={(e) => setFormData(prev => ({ ...prev, cor_primaria: e.target.value }))}
                    className="w-20 h-10 p-1 border rounded cursor-pointer"
                    disabled={!hasWhitelabelAccess()}
                  />
                  <Input
                    value={formData.cor_primaria.toUpperCase()}
                    onChange={(e) => setFormData(prev => ({ ...prev, cor_primaria: e.target.value }))}
                    placeholder="#3B82F6"
                    className="flex-1"
                    disabled={!hasWhitelabelAccess()}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Defina a cor principal que será usada em botões, links e destaques
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dominio_personalizado">Domínio Personalizado</Label>
                <Input
                  id="dominio_personalizado"
                  value={formData.dominio_personalizado}
                  onChange={(e) => setFormData(prev => ({ ...prev, dominio_personalizado: e.target.value }))}
                  placeholder="app.minhaempresa.com.br"
                  disabled={!hasWhitelabelAccess()}
                />
                <p className="text-xs text-muted-foreground">
                  Configure um domínio próprio para acessar o sistema (funcionalidade futura)
                </p>
              </div>
            </div>

            {/* Right Column - File Uploads */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Logotipo da Empresa</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  {formData.logo_url ? (
                    <div className="space-y-3">
                      <img 
                        src={formData.logo_url} 
                        alt="Logo preview" 
                        className="mx-auto max-h-20 object-contain"
                      />
                      <p className="text-sm text-muted-foreground">Logo carregado com sucesso</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <div>
                        <p className="text-sm font-medium">Clique para fazer upload do logo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                      </div>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="mt-3"
                    disabled={!hasWhitelabelAccess() || uploading}
                  />
                  {uploading && (
                    <p className="text-xs text-muted-foreground mt-2">Fazendo upload...</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Favicon (Ícone do Site)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  {formData.favicon_url ? (
                    <div className="space-y-2">
                      <img 
                        src={formData.favicon_url} 
                        alt="Favicon preview" 
                        className="mx-auto w-8 h-8 object-contain"
                      />
                      <p className="text-xs text-muted-foreground">Favicon carregado</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-6 w-6 text-muted-foreground/50" />
                      <p className="text-xs font-medium">Upload do favicon</p>
                      <p className="text-xs text-muted-foreground">PNG 32x32px, até 1MB</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconChange}
                    className="mt-2"
                    disabled={!hasWhitelabelAccess() || uploading}
                  />
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <Palette className="h-4 w-4" />
            <AlertDescription>
              <strong>Personalização Whitelabel:</strong> As mudanças afetarão apenas os usuários da sua empresa. 
              Use "Visualizar" para testar antes de salvar definitivamente.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => applyChanges(false)} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={!hasWhitelabelAccess()}
            >
              <Eye className="h-4 w-4" />
              Visualizar Mudanças
            </Button>
            
            {previewMode && (
              <Button 
                onClick={resetPreview} 
                variant="outline"
                className="flex items-center gap-2"
              >
                Remover Preview
              </Button>
            )}
            
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={!hasWhitelabelAccess() || uploading}
            >
              {uploading ? 'Salvando...' : 'Salvar Personalização'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}