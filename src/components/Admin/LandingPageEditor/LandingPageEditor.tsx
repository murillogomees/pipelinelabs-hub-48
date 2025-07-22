import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Eye, 
  Palette, 
  Type, 
  Image, 
  Layout, 
  Users, 
  DollarSign,
  Settings,
  Upload,
  Trash2,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LandingPageContent {
  hero: {
    title: string;
    subtitle: string;
    ctaButton: string;
    secondaryButton: string;
    badge: string;
  };
  branding: {
    logo: string;
    companyName: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  personas: Array<{
    id: string;
    name: string;
    business: string;
    pain: string;
    solution: string;
    image: string;
    features: string[];
    active: boolean;
  }>;
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    active: boolean;
  }>;
  pricing: Array<{
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    highlighted: boolean;
    active: boolean;
  }>;
  sections: {
    showProblems: boolean;
    showPersonas: boolean;
    showFeatures: boolean;
    showPricing: boolean;
    showMockups: boolean;
  };
}

const defaultContent: LandingPageContent = {
  hero: {
    title: "Sistema Completo de Gestão\npara Pequenos Empreendedores",
    subtitle: "Automatize processos, facilite gestões estratégicas e financeiras, integre com sistemas e canais de vendas. Tudo em uma plataforma escalável e adaptável.",
    ctaButton: "Começar Teste Grátis",
    secondaryButton: "Ver Demo",
    badge: "🚀 ERP Inteligente e Dinâmico"
  },
  branding: {
    logo: "",
    companyName: "Pipeline Labs",
    primaryColor: "#0f172a",
    secondaryColor: "#64748b",
    fontFamily: "Inter"
  },
  personas: [
    {
      id: "1",
      name: "Ana, 34 anos",
      business: "Loja de roupas femininas",
      pain: "Usa planilhas, tem falhas e perde tempo",
      solution: "Estoque automatizado e emissão fiscal simplificada",
      image: "/assets/frustrated-business-owner.jpg",
      features: ["Controle de estoque inteligente", "Emissão de NFe automática", "Dashboard financeiro"],
      active: true
    }
  ],
  features: [
    {
      id: "1",
      title: "Emissão Fiscal Completa",
      description: "NFe, NFSe, NFCe com certificado digital A1 integrado",
      icon: "TrendingUp",
      active: true
    }
  ],
  pricing: [
    {
      id: "1",
      name: "Starter",
      price: "R$ 97",
      period: "/mês",
      description: "Para pequenos negócios",
      features: ["Até 3 usuários", "NFe e NFCe ilimitadas", "Controle básico de estoque"],
      highlighted: false,
      active: true
    }
  ],
  sections: {
    showProblems: true,
    showPersonas: true,
    showFeatures: true,
    showPricing: true,
    showMockups: true
  }
};

export function LandingPageEditor() {
  const [content, setContent] = useState<LandingPageContent>(defaultContent);
  const [activeTab, setActiveTab] = useState("hero");
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      // Aqui você implementaria a lógica para salvar no banco
      toast({
        title: "Sucesso",
        description: "Landing page atualizada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    // Implementar preview em nova aba
    window.open('/', '_blank');
  };

  const updateHero = (field: keyof typeof content.hero, value: string) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateBranding = (field: keyof typeof content.branding, value: string) => {
    setContent(prev => ({
      ...prev,
      branding: { ...prev.branding, [field]: value }
    }));
  };

  const addPersona = () => {
    const newPersona = {
      id: Date.now().toString(),
      name: "Nova Persona",
      business: "Tipo de negócio",
      pain: "Problema enfrentado",
      solution: "Solução oferecida",
      image: "",
      features: [],
      active: true
    };
    setContent(prev => ({
      ...prev,
      personas: [...prev.personas, newPersona]
    }));
  };

  const updatePersona = (id: string, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      personas: prev.personas.map(persona => 
        persona.id === id ? { ...persona, [field]: value } : persona
      )
    }));
  };

  const deletePersona = (id: string) => {
    setContent(prev => ({
      ...prev,
      personas: prev.personas.filter(persona => persona.id !== id)
    }));
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
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="personas" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personas
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Preços
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
                  value={content.hero.badge}
                  onChange={(e) => updateHero('badge', e.target.value)}
                  placeholder="🚀 ERP Inteligente e Dinâmico"
                />
              </div>
              <div>
                <Label htmlFor="hero-title">Título Principal</Label>
                <Textarea
                  id="hero-title"
                  value={content.hero.title}
                  onChange={(e) => updateHero('title', e.target.value)}
                  placeholder="Sistema Completo de Gestão..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="hero-subtitle">Subtítulo</Label>
                <Textarea
                  id="hero-subtitle"
                  value={content.hero.subtitle}
                  onChange={(e) => updateHero('subtitle', e.target.value)}
                  placeholder="Automatize processos, facilite gestões..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta-button">Botão Principal</Label>
                  <Input
                    id="cta-button"
                    value={content.hero.ctaButton}
                    onChange={(e) => updateHero('ctaButton', e.target.value)}
                    placeholder="Começar Teste Grátis"
                  />
                </div>
                <div>
                  <Label htmlFor="secondary-button">Botão Secundário</Label>
                  <Input
                    id="secondary-button"
                    value={content.hero.secondaryButton}
                    onChange={(e) => updateHero('secondaryButton', e.target.value)}
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
                  value={content.branding.companyName}
                  onChange={(e) => updateBranding('companyName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="logo-upload">Logo</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  {content.branding.logo && (
                    <img 
                      src={content.branding.logo} 
                      alt="Logo" 
                      className="h-10 w-10 object-contain" 
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Cor Principal</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={content.branding.primaryColor}
                      onChange={(e) => updateBranding('primaryColor', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={content.branding.primaryColor}
                      onChange={(e) => updateBranding('primaryColor', e.target.value)}
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
                      value={content.branding.secondaryColor}
                      onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={content.branding.secondaryColor}
                      onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="font-family">Fonte</Label>
                <select 
                  id="font-family"
                  value={content.branding.fontFamily}
                  onChange={(e) => updateBranding('fontFamily', e.target.value)}
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

        {/* Personas Section */}
        <TabsContent value="personas" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personas dos Clientes</CardTitle>
                  <CardDescription>
                    Configure as personas que representam seus clientes ideais
                  </CardDescription>
                </div>
                <Button onClick={addPersona}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Persona
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {content.personas.map((persona, index) => (
                  <Card key={persona.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Persona {index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={persona.active}
                          onCheckedChange={(checked) => updatePersona(persona.id, 'active', checked)}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deletePersona(persona.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={persona.name}
                          onChange={(e) => updatePersona(persona.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Negócio</Label>
                        <Input
                          value={persona.business}
                          onChange={(e) => updatePersona(persona.id, 'business', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Problema</Label>
                        <Textarea
                          value={persona.pain}
                          onChange={(e) => updatePersona(persona.id, 'pain', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Solução</Label>
                        <Textarea
                          value={persona.solution}
                          onChange={(e) => updatePersona(persona.id, 'solution', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Funcionalidades (separadas por vírgula)</Label>
                        <Input
                          value={persona.features.join(', ')}
                          onChange={(e) => updatePersona(persona.id, 'features', e.target.value.split(', '))}
                          placeholder="Funcionalidade 1, Funcionalidade 2"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Section */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades</CardTitle>
              <CardDescription>
                Configure as principais funcionalidades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configuração de funcionalidades em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Section */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planos e Preços</CardTitle>
              <CardDescription>
                Configure os planos de assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configuração de preços em desenvolvimento...
              </p>
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
              {Object.entries(content.sections).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setContent(prev => ({
                        ...prev,
                        sections: { ...prev.sections, [key]: checked }
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}