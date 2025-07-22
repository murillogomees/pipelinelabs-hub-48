import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Eye, 
  Layout, 
  Palette,
} from 'lucide-react';
import { useLandingPageConfig } from '@/hooks/useLandingPageConfig';

export function LandingPageEditor() {
  const { config, updateConfig, isUpdating } = useLandingPageConfig();
  const [activeTab, setActiveTab] = useState("hero");

  const handleSave = async () => {
    await updateConfig(config);
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  const updateConfigField = (field: string, value: any) => {
    updateConfig({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Editor da Landing Page</h1>
          <p className="text-muted-foreground">
            Personalize completamente sua página de vendas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Seções
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seção Principal (Hero)</CardTitle>
              <CardDescription>
                Configure o título, subtítulo e botões da seção principal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-badge">Badge</Label>
                <Input
                  id="hero-badge"
                  value={config.hero_badge}
                  onChange={(e) => updateConfigField('hero_badge', e.target.value)}
                  placeholder="🚀 ERP Inteligente e Dinâmico"
                />
              </div>
              <div>
                <Label htmlFor="hero-title">Título Principal</Label>
                <Textarea
                  id="hero-title"
                  value={config.hero_title}
                  onChange={(e) => updateConfigField('hero_title', e.target.value)}
                  placeholder="Sistema Completo de Gestão..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="hero-subtitle">Subtítulo</Label>
                <Textarea
                  id="hero-subtitle"
                  value={config.hero_subtitle}
                  onChange={(e) => updateConfigField('hero_subtitle', e.target.value)}
                  placeholder="Automatize processos, facilite gestões..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta-button">Botão Principal</Label>
                  <Input
                    id="cta-button"
                    value={config.hero_cta_button}
                    onChange={(e) => updateConfigField('hero_cta_button', e.target.value)}
                    placeholder="Começar Teste Grátis"
                  />
                </div>
                <div>
                  <Label htmlFor="secondary-button">Botão Secundário</Label>
                  <Input
                    id="secondary-button"
                    value={config.hero_secondary_button}
                    onChange={(e) => updateConfigField('hero_secondary_button', e.target.value)}
                    placeholder="Ver Demo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Section */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
              <CardDescription>
                Configure cores, fontes e logotipo da sua marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Nome da Empresa</Label>
                <Input
                  id="company-name"
                  value={config.company_name}
                  onChange={(e) => updateConfigField('company_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="logo-url">URL do Logo</Label>
                <Input
                  id="logo-url"
                  value={config.logo_url || ''}
                  onChange={(e) => updateConfigField('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Cor Principal</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => updateConfigField('primary_color', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.primary_color}
                      onChange={(e) => updateConfigField('primary_color', e.target.value)}
                      placeholder="#0f172a"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={config.secondary_color}
                      onChange={(e) => updateConfigField('secondary_color', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={config.secondary_color}
                      onChange={(e) => updateConfigField('secondary_color', e.target.value)}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="font-family">Fonte</Label>
                <select 
                  id="font-family"
                  value={config.font_family}
                  onChange={(e) => updateConfigField('font_family', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Section */}
        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Seções</CardTitle>
              <CardDescription>
                Escolha quais seções exibir na landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-problems">Mostrar Problemas</Label>
                <Switch
                  id="show-problems"
                  checked={config.show_problems}
                  onCheckedChange={(checked) => updateConfigField('show_problems', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-personas">Mostrar Personas</Label>
                <Switch
                  id="show-personas"
                  checked={config.show_personas}
                  onCheckedChange={(checked) => updateConfigField('show_personas', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-features">Mostrar Funcionalidades</Label>
                <Switch
                  id="show-features"
                  checked={config.show_features}
                  onCheckedChange={(checked) => updateConfigField('show_features', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-pricing">Mostrar Preços</Label>
                <Switch
                  id="show-pricing"
                  checked={config.show_pricing}
                  onCheckedChange={(checked) => updateConfigField('show_pricing', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-mockups">Mostrar Mockups</Label>
                <Switch
                  id="show-mockups"
                  checked={config.show_mockups}
                  onCheckedChange={(checked) => updateConfigField('show_mockups', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}