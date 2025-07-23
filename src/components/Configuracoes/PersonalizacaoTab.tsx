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
import { CDNConfigSection } from './CDNConfigSection';
import { useFileUpload } from './hooks/useFileUpload';
import { BRANDING_DEFAULTS, validateDomain, applyBrandingToDOM, hexToHsl } from './utils/brandingUtils';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from './constants';

export function PersonalizacaoTab() {
  const { settings, loading, updateSettings } = useCompanySettings();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const { uploading, handleFileUpload } = useFileUpload();
  const [formData, setFormData] = useState(BRANDING_DEFAULTS);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (settings?.branding) {
      const branding = settings.branding as any;
      setFormData({
        nome_customizado: branding.nome_customizado || branding.nome_sistema || 'Pipeline Labs',
        cor_primaria: branding.cor_primaria || '#3b82f6',
        cor_secundaria: branding.cor_secundaria || '#64748b',
        logo_url: branding.logo_url || '',
        favicon_url: branding.favicon_url || '',
        dominio_personalizado: branding.dominio_personalizado || ''
      });
    }
  }, [settings]);

  const hasWhitelabelAccess = () => {
    return subscription?.plans?.is_custom || false;
  };


  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleFileUpload(file, 'logos', 'logo');
    if (url) {
      setFormData(prev => ({ ...prev, logo_url: url }));
    }
  };

  const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleFileUpload(file, 'favicons', 'favicon');
    if (url) {
      setFormData(prev => ({ ...prev, favicon_url: url }));
    }
  };


  const handleSave = async () => {
    if (!hasWhitelabelAccess()) {
      toast({
        title: "Acesso Negado",
        description: ERROR_MESSAGES.whitelabel,
        variant: "destructive"
      });
      return;
    }

    if (formData.dominio_personalizado && !validateDomain(formData.dominio_personalizado)) {
      toast({
        title: "Erro",
        description: ERROR_MESSAGES.domain,
        variant: "destructive"
      });
      return;
    }

    const brandingData = {
      nome_customizado: formData.nome_customizado,
      cor_primaria: formData.cor_primaria,
      cor_secundaria: formData.cor_secundaria,
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
        description: SUCCESS_MESSAGES.branding
      });
    }
  };

  const applyChanges = (permanent: boolean = false) => {
    applyBrandingToDOM(formData, permanent);
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
    
    const originalBranding = settings?.branding as any;
    const originalColor = originalBranding?.cor_primaria || BRANDING_DEFAULTS.cor_primaria;
    const originalSecondary = originalBranding?.cor_secundaria || BRANDING_DEFAULTS.cor_secundaria;
    
    document.documentElement.style.setProperty('--primary', hexToHsl(originalColor));
    document.documentElement.style.setProperty('--secondary', hexToHsl(originalSecondary));
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
                style={{ backgroundColor: formData.cor_secundaria }}
              />
              <div 
                className="h-3 w-8 rounded"
                style={{ backgroundColor: formData.cor_primaria + '40' }}
              />
              <div 
                className="h-3 w-6 rounded"
                style={{ backgroundColor: formData.cor_secundaria + '60' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CDN Configuration */}
      <CDNConfigSection hasAccess={hasWhitelabelAccess()} />

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
                <Label htmlFor="cor_secundaria">Cor Secundária da Marca</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor_secundaria"
                    type="color"
                    value={formData.cor_secundaria}
                    onChange={(e) => setFormData(prev => ({ ...prev, cor_secundaria: e.target.value }))}
                    className="w-20 h-10 p-1 border rounded cursor-pointer"
                    disabled={!hasWhitelabelAccess()}
                  />
                  <Input
                    value={formData.cor_secundaria.toUpperCase()}
                    onChange={(e) => setFormData(prev => ({ ...prev, cor_secundaria: e.target.value }))}
                    placeholder="#64748B"
                    className="flex-1"
                    disabled={!hasWhitelabelAccess()}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Cor usada em elementos secundários, textos auxiliares e fundos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dominio_personalizado">Domínio Personalizado</Label>
                <Input
                  id="dominio_personalizado"
                  value={formData.dominio_personalizado}
                  onChange={(e) => setFormData(prev => ({ ...prev, dominio_personalizado: e.target.value }))}
                  placeholder="app.suaempresa.com.br"
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