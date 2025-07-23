import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, Star, ArrowRight, Users, TrendingUp, Shield, Zap, 
  FileText, Package, Truck, ClipboardCheck, Building, Globe, 
  Lock, Database, Cloud, Rocket, BarChart3, Calculator,
  CreditCard, ShoppingCart, Bell, Settings, Calendar,
  PieChart, Monitor, Smartphone, Tablet, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLandingPageContent } from '@/hooks/useLandingPageContent';
import { PipelineLabsLogo } from '@/components/Layout/PipelineLabsLogo';
import { Footer } from '@/components/Layout/Footer';

// Icon mapping helper
const getIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'file-text': <FileText className="h-8 w-8 text-primary" />,
    'trending-up': <TrendingUp className="h-8 w-8 text-primary" />,
    'package': <Package className="h-8 w-8 text-primary" />,
    'truck': <Truck className="h-8 w-8 text-primary" />,
    'clipboard-check': <ClipboardCheck className="h-8 w-8 text-primary" />,
    'building': <Building className="h-8 w-8 text-primary" />,
    'globe': <Globe className="h-8 w-8 text-primary" />,
    'users': <Users className="h-8 w-8 text-primary" />,
    'shield': <Shield className="h-8 w-8 text-primary" />,
    'bar-chart': <BarChart3 className="h-8 w-8 text-primary" />,
    'calculator': <Calculator className="h-8 w-8 text-primary" />,
    'credit-card': <CreditCard className="h-8 w-8 text-primary" />,
    'shopping-cart': <ShoppingCart className="h-8 w-8 text-primary" />,
    'pie-chart': <PieChart className="h-8 w-8 text-primary" />,
    'dollar-sign': <DollarSign className="h-8 w-8 text-primary" />,
    'lock': <Lock className="h-4 w-4 text-green-600" />,
    'database': <Database className="h-4 w-4 text-green-600" />,
    'cloud': <Cloud className="h-4 w-4 text-green-600" />,
    'rocket': <Rocket className="h-5 w-5" />,
    'bell': <Bell className="h-4 w-4 text-blue-600" />,
    'settings': <Settings className="h-4 w-4 text-gray-600" />,
    'calendar': <Calendar className="h-4 w-4 text-purple-600" />,
    'monitor': <Monitor className="h-6 w-6 text-primary" />,
    'smartphone': <Smartphone className="h-6 w-6 text-primary" />,
    'tablet': <Tablet className="h-6 w-6 text-primary" />,
  };
  return iconMap[iconName] || <Star className="h-8 w-8 text-primary" />;
};

// Mockup components para simular telas do sistema
const MockupDashboard = () => (
  <div className="bg-white border rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-800">Dashboard Principal</h3>
      <div className="flex gap-2">
        {getIcon('bell')}
        {getIcon('settings')}
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-green-50 p-3 rounded border border-green-200">
        <div className="flex items-center gap-2">
          {getIcon('dollar-sign')}
          <span className="text-sm font-medium">Vendas Hoje</span>
        </div>
        <p className="text-2xl font-bold text-green-700">R$ 2.847</p>
      </div>
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <div className="flex items-center gap-2">
          {getIcon('shopping-cart')}
          <span className="text-sm font-medium">Pedidos</span>
        </div>
        <p className="text-2xl font-bold text-blue-700">23</p>
      </div>
      <div className="bg-orange-50 p-3 rounded border border-orange-200">
        <div className="flex items-center gap-2">
          {getIcon('package')}
          <span className="text-sm font-medium">Estoque Baixo</span>
        </div>
        <p className="text-2xl font-bold text-orange-700">7</p>
      </div>
    </div>
    <div className="bg-gray-50 h-24 rounded border flex items-center justify-center">
      <span className="text-gray-500 text-sm">📊 Gráfico de Vendas</span>
    </div>
  </div>
);

const MockupPDV = () => (
  <div className="bg-white border rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-800">PDV - Ponto de Venda</h3>
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Online</span>
    </div>
    <div className="space-y-2 mb-4">
      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
        <span className="text-sm">Camiseta Polo - P</span>
        <span className="font-medium">R$ 89,90</span>
      </div>
      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
        <span className="text-sm">Calça Jeans - M</span>
        <span className="font-medium">R$ 159,90</span>
      </div>
    </div>
    <div className="border-t pt-2">
      <div className="flex justify-between font-bold">
        <span>Total:</span>
        <span className="text-green-600">R$ 249,80</span>
      </div>
    </div>
  </div>
);

const MockupNFe = () => (
  <div className="bg-white border rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-800">Emissão de NFe</h3>
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Pronto</span>
    </div>
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-600">Cliente</label>
        <div className="bg-gray-50 p-2 rounded text-sm">João Silva - 123.456.789-00</div>
      </div>
      <div>
        <label className="text-xs text-gray-600">Produtos</label>
        <div className="bg-gray-50 p-2 rounded text-sm">2 itens selecionados</div>
      </div>
      <div className="flex gap-2">
        <button className="bg-primary text-white px-3 py-1 rounded text-sm">Emitir NFe</button>
        <button className="border px-3 py-1 rounded text-sm">Preview</button>
      </div>
    </div>
  </div>
);

// Mockup images
import dashboardMockup from '@/assets/dashboard-mockup.jpg';
import inventoryMockup from '@/assets/inventory-mockup.jpg';
import financialMockup from '@/assets/financial-mockup.jpg';
import invoiceMockup from '@/assets/invoice-mockup.jpg';
import frustratedOwner from '@/assets/frustrated-business-owner.jpg';
import successTeam from '@/assets/success-team.jpg';

const personas = [
  {
    name: "Ana, 34 anos",
    business: "Loja de roupas femininas",
    pain: "Usa planilhas, tem falhas e perde tempo",
    solution: "Estoque automatizado e emissão fiscal simplificada",
    image: frustratedOwner,
    features: ["Controle de estoque inteligente", "Emissão de NFe automática", "Dashboard financeiro"]
  },
  {
    name: "Lucas, 28 anos", 
    business: "Vendedor em marketplaces",
    pain: "Falta de controle multicanal",
    solution: "Centralização de pedidos e estoque",
    image: successTeam,
    features: ["Integração com marketplaces", "Gestão multicanal", "Sincronização automática"]
  },
  {
    name: "Carla, 41 anos",
    business: "Pequena fábrica de salgados", 
    pain: "Falta de visibilidade financeira",
    solution: "Ordem de produção e dashboard financeiro",
    image: dashboardMockup,
    features: ["Ordem de produção", "DRE automatizado", "Controle de custos"]
  },
  {
    name: "Eduardo, 38 anos",
    business: "Distribuidor de bebidas",
    pain: "Logística e pedidos manuais", 
    solution: "Controle de estoque + separação de pedidos + envios",
    image: inventoryMockup,
    features: ["Separação de pedidos", "Controle logístico", "Etiquetas automáticas"]
  },
  {
    name: "Patrícia, 32 anos",
    business: "Prestadora de serviço",
    pain: "Emissão de NFSe e finanças",
    solution: "Nota fiscal de serviço automatizada + gestão financeira", 
    image: invoiceMockup,
    features: ["NFSe automática", "Gestão de serviços", "Controle financeiro"]
  }
];

const features = [
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Emissão Fiscal Completa",
    description: "NFe, NFSe, NFCe com certificado digital A1 integrado"
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Controle de Vendas + PDV",
    description: "Sistema de vendas completo com ponto de venda integrado"
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Estoque Inteligente",
    description: "Automação e relatórios detalhados de movimentação"
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Dashboard Financeiro",
    description: "DRE automatizado e visão completa das finanças"
  }
];

const plans = [
  {
    name: "Starter",
    price: "R$ 97",
    period: "/mês", 
    description: "Para pequenos negócios",
    features: [
      "Até 3 usuários",
      "NFe e NFCe ilimitadas",
      "Controle básico de estoque",
      "Dashboard financeiro",
      "Suporte por email"
    ],
    highlighted: false
  },
  {
    name: "Professional", 
    price: "R$ 197",
    period: "/mês",
    description: "Para negócios em crescimento",
    features: [
      "Até 10 usuários",
      "Todas as funcionalidades",
      "Integrações com marketplaces",
      "Relatórios avançados",
      "API personalizada",
      "Suporte prioritário"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "R$ 397", 
    period: "/mês",
    description: "Para grandes operações",
    features: [
      "Usuários ilimitados",
      "Whitelabel completo",
      "Múltiplos depósitos",
      "Integração bancária",
      "Consultor dedicado",
      "SLA garantido"
    ],
    highlighted: false
  }
];

export function LandingPage() {
  const navigate = useNavigate();
  const { sections, isLoading, getSection } = useLandingPageContent();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando página...</p>
        </div>
      </div>
    );
  }

  const heroSection = getSection('hero');
  const painSection = getSection('pain_section');
  const featuresSection = getSection('features');
  const mockupsSection = getSection('mockups');
  const testimonialsSection = getSection('testimonials');
  const securitySection = getSection('security');
  const howItWorksSection = getSection('how_it_works');
  const finalCtaSection = getSection('final_cta');
  const pricingSection = getSection('pricing');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PipelineLabsLogo size="md" showText={true} />
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Entrar
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Teste Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {heroSection && (
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <Badge variant="secondary" className="mb-4 flex items-center gap-2 w-fit mx-auto">
              {getIcon('rocket')}
              {heroSection.content_data?.trust_badge || heroSection.title}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {heroSection.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              {heroSection.subtitle}
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {heroSection.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
                {getIcon('rocket')}
                {heroSection.content_data?.button_text || 'Começar Agora'}
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                {heroSection.content_data?.secondary_button || 'Ver Demo'}
              </Button>
            </div>
            
            {/* Mockup Features com telas simuladas */}
            {heroSection.content_data?.mockup_features && (
              <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-4">Veja o sistema em ação:</h3>
                    
                    {/* Grid de mockups */}
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="space-y-2">
                        <MockupDashboard />
                        <p className="text-sm text-muted-foreground">Dashboard completo</p>
                      </div>
                      <div className="space-y-2">
                        <MockupPDV />
                        <p className="text-sm text-muted-foreground">PDV integrado</p>
                      </div>
                      <div className="space-y-2">
                        <MockupNFe />
                        <p className="text-sm text-muted-foreground">Emissão de NFe</p>
                      </div>
                    </div>

                    {/* Features destacadas */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {heroSection.content_data.mockup_features.map((feature: string, index: number) => (
                        <div key={index} className="bg-background/50 rounded-lg p-4 border border-primary/10 flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {index === 0 && getIcon('bar-chart')}
                            {index === 1 && getIcon('bell')}
                            {index === 2 && getIcon('pie-chart')}
                          </div>
                          <p className="font-medium text-sm">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Pain Section - Personas */}
      {painSection && (
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {painSection.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {painSection.subtitle}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {painSection.content_data?.personas?.map((persona: any, index: number) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl">{persona.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-red-50/50 p-4 rounded-lg border border-red-200">
                        <p className="text-sm text-muted-foreground mb-2">Antes:</p>
                        <p className="text-red-800 font-medium">{persona.before}</p>
                      </div>
                      <div className="bg-green-50/50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-muted-foreground mb-2">Depois:</p>
                        <p className="text-green-800 font-medium">{persona.after}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {featuresSection && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {featuresSection.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {featuresSection.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuresSection.content_data?.features?.map((feature: any, index: number) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">
                      {getIcon(feature.icon)}
                    </div>
                    <CardTitle className="mb-2">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            {featuresSection.content_data?.cta_text && (
              <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
                <p className="text-lg mb-4">{featuresSection.content_data.cta_text}</p>
                <Button size="lg" onClick={() => navigate('/auth')}>
                  {featuresSection.content_data.cta_button || 'Começar Agora'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Mockups Section */}
      {mockupsSection && (
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {mockupsSection.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {mockupsSection.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {mockupsSection.content_data?.mockups?.map((mockup: any, index: number) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                    {/* Simulação da tela */}
                    {index === 0 && (
                      <div className="bg-white rounded border p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          {getIcon('monitor')} <span>PDV Sistema</span>
                        </div>
                        <div className="bg-gray-100 h-2 rounded"></div>
                        <div className="bg-green-100 h-6 rounded flex items-center px-2 text-xs">
                          R$ 1.247,80 - Venda Finalizada
                        </div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="bg-white rounded border p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          {getIcon('file-text')} <span>NFe #001234</span>
                        </div>
                        <div className="bg-blue-100 h-2 rounded"></div>
                        <div className="text-xs">Status: Emitida ✓</div>
                      </div>
                    )}
                    {index === 2 && (
                      <div className="bg-white rounded border p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          {getIcon('pie-chart')} <span>Dashboard</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-green-100 h-4 rounded"></div>
                          <div className="bg-blue-100 h-4 rounded"></div>
                        </div>
                        <div className="text-xs">Meta: 85% atingida</div>
                      </div>
                    )}
                    {index === 3 && (
                      <div className="bg-white rounded border p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          {getIcon('package')} <span>Estoque</span>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-red-100 h-2 rounded"></div>
                          <div className="bg-yellow-100 h-2 rounded"></div>
                          <div className="bg-green-100 h-2 rounded"></div>
                        </div>
                        <div className="text-xs text-red-600">7 itens baixos</div>
                      </div>
                    )}
                    {index === 4 && (
                      <div className="bg-white rounded border p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          {getIcon('clipboard-check')} <span>Ordem #OS-001</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Iniciado</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>Em andamento</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      {getIcon('monitor')}
                      {mockup.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{mockup.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonialsSection && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {testimonialsSection.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {testimonialsSection.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonialsSection.content_data?.testimonials?.map((testimonial: any, index: number) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <blockquote className="text-lg mb-4 italic">
                      "{testimonial.testimonial}"
                    </blockquote>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Security Section */}
      {securitySection && (
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {securitySection.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {securitySection.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {securitySection.content_data?.security_items?.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-3 bg-background/50 p-4 rounded-lg border">
                  {getIcon(item.icon)}
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      {howItWorksSection && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {howItWorksSection.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {howItWorksSection.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {howItWorksSection.content_data?.steps?.map((step: any, index: number) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      {pricingSection && (
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {pricingSection.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {pricingSection.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingSection.content_data?.plans?.map((plan: any, index: number) => (
                <Card key={index} className={`relative ${plan.highlighted ? 'border-primary scale-105' : ''}`}>
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      R$ {plan.price}
                      <span className="text-base font-normal text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      onClick={() => navigate('/auth')}
                    >
                      Começar Agora
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      {finalCtaSection && (
        <section 
          className="py-20 px-4 text-white"
          style={{ backgroundColor: finalCtaSection.content_data?.background_color || '#0f172a' }}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {finalCtaSection.title}
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
              {finalCtaSection.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6"
              >
                {finalCtaSection.content_data?.primary_button || 'Começar Agora'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}