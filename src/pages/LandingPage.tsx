import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, ArrowRight, Users, TrendingUp, Shield, Zap, FileText, Package, Truck, ClipboardCheck, Building, Globe, Lock, Database, Cloud, Rocket, BarChart3, Calculator, CreditCard, ShoppingCart, Bell, Settings, Calendar, PieChart, Monitor, Smartphone, Tablet, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLandingPageContent } from '@/hooks/useLandingPageContent';
import { PipelineLabsLogo } from '@/components/Layout/PipelineLabsLogo';
import { Footer } from '@/components/Layout/Footer';

// Import the advanced mockup components
import { MockupDashboard, MockupPDV, MockupNFe, MockupInventory, MockupFinancial } from '@/components/ui/SystemMockups';

// Icon mapping helper
const getIcon = (iconName: string) => {
  const iconMap: {
    [key: string]: React.ReactNode;
  } = {
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
    'tablet': <Tablet className="h-6 w-6 text-primary" />
  };
  return iconMap[iconName] || <Star className="h-8 w-8 text-primary" />;
};
export function LandingPage() {
  const navigate = useNavigate();
  const {
    sections,
    isLoading,
    getSection
  } = useLandingPageContent();
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando página...</p>
        </div>
      </div>;
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
  return <div className="min-h-screen bg-background">
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
      {heroSection && <section className="py-20 px-4">
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
            
            {/* Demonstração do Sistema */}
            <div className="max-w-7xl mx-auto mt-16">
              <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-blue-50 rounded-3xl p-8 border border-primary/20 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    Sistema em funcionamento
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Veja o sistema em ação:</h3>
                  <p className="text-muted-foreground">Interface real do Pipeline Labs funcionando</p>
                </div>
                     
                {/* Grid de mockups - Sistema completo */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-3">
                    <MockupDashboard className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                  <div className="space-y-3">
                    <MockupPDV className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                  <div className="space-y-3">
                    <MockupNFe className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                </div>

                {/* Segunda linha de mockups */}
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div className="space-y-3">
                    <MockupInventory className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                  <div className="space-y-3">
                    <MockupFinancial className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                </div>

                {/* Features destacadas */}
                {heroSection.content_data?.mockup_features && <div className="grid md:grid-cols-3 gap-4">
                    {heroSection.content_data.mockup_features.map((feature: string, index: number) => <div key={index} className="bg-background/50 rounded-lg p-4 border border-primary/10 flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {index === 0 && getIcon('bar-chart')}
                          {index === 1 && getIcon('bell')}
                          {index === 2 && getIcon('pie-chart')}
                        </div>
                        <p className="font-medium text-sm">{feature}</p>
                      </div>)}
                  </div>}
              </div>
            </div>
          </div>
        </section>}

      {/* Pain Section - Personas */}
      {painSection && <section className="py-20 px-4 bg-muted/50">
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
              {painSection.content_data?.personas?.map((persona: any, index: number) => <Card key={index} className="overflow-hidden">
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
                </Card>)}
            </div>
          </div>
        </section>}

      {/* Features Section */}
      {featuresSection && <section className="py-20 px-4">
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
              {featuresSection.content_data?.features?.map((feature: any, index: number) => <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">
                      {getIcon(feature.icon)}
                    </div>
                    
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>)}
            </div>

            {/* Call to Action */}
            {featuresSection.content_data?.cta_text && <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
                <p className="text-lg mb-4">{featuresSection.content_data.cta_text}</p>
                <Button size="lg" onClick={() => navigate('/auth')}>
                  {featuresSection.content_data.cta_button || 'Começar Agora'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>}
          </div>
        </section>}

      {/* Mockups Section */}
      {mockupsSection && <section className="py-20 px-4 bg-muted/50">
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
              {mockupsSection.content_data?.mockups?.map((mockup: any, index: number) => <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                    {/* Simulação da tela */}
                    {index === 0 && <div className="bg-white rounded border p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          {getIcon('monitor')} <span>PDV Sistema</span>
                        </div>
                        <div className="bg-gray-100 h-2 rounded"></div>
                        <div className="bg-green-100 h-6 rounded flex items-center px-2 text-xs">
                          R$ 1.247,80 - Venda Finalizada
                        </div>
                      </div>}
                    {index === 1 && <div className="bg-white rounded border p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          {getIcon('file-text')} <span>NFe #001234</span>
                        </div>
                        <div className="bg-blue-100 h-2 rounded"></div>
                        <div className="text-xs">Status: Emitida ✓</div>
                      </div>}
                    {index === 2 && <div className="bg-white rounded border p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          {getIcon('pie-chart')} <span>Dashboard</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-green-100 h-4 rounded"></div>
                          <div className="bg-blue-100 h-4 rounded"></div>
                        </div>
                        <div className="text-xs">Meta: 85% atingida</div>
                      </div>}
                    {index === 3 && <div className="bg-white rounded border p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          {getIcon('package')} <span>Estoque</span>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-red-100 h-2 rounded"></div>
                          <div className="bg-yellow-100 h-2 rounded"></div>
                          <div className="bg-green-100 h-2 rounded"></div>
                        </div>
                        <div className="text-xs text-red-600">7 itens baixos</div>
                      </div>}
                    {index === 4 && <div className="bg-white rounded border p-3 space-y-2">
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
                      </div>}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      {getIcon('monitor')}
                      {mockup.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{mockup.description}</p>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>}

      {/* Testimonials Section */}
      {testimonialsSection && <section className="py-20 px-4">
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
              {testimonialsSection.content_data?.testimonials?.map((testimonial: any, index: number) => <Card key={index} className="text-center">
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
                </Card>)}
            </div>
          </div>
        </section>}

      {/* Security Section */}
      {securitySection && <section className="py-20 px-4 bg-muted/50">
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
              {securitySection.content_data?.security_items?.map((item: any, index: number) => <div key={index} className="flex items-center gap-3 bg-background/50 p-4 rounded-lg border">
                  {getIcon(item.icon)}
                  <span className="text-sm font-medium">{item.title}</span>
                </div>)}
            </div>
          </div>
        </section>}

      {/* How It Works Section */}
      {howItWorksSection && <section className="py-20 px-4">
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
              {howItWorksSection.content_data?.steps?.map((step: any, index: number) => <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>}

      {/* Pricing Section */}
      {pricingSection && <section className="py-20 px-4 bg-muted/50">
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
              {pricingSection.content_data?.plans?.map((plan: any, index: number) => <Card key={index} className={`relative ${plan.highlighted ? 'border-primary scale-105' : ''}`}>
                  {plan.highlighted && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Mais Popular
                      </Badge>
                    </div>}
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
                      {plan.features.map((feature: string, idx: number) => <li key={idx} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>)}
                    </ul>
                    <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} onClick={() => navigate('/auth')}>
                      Começar Agora
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>}

      {/* Final CTA Section */}
      {finalCtaSection && <section className="py-20 px-4 text-white" style={{
      backgroundColor: finalCtaSection.content_data?.background_color || '#0f172a'
    }}>
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {finalCtaSection.title}
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
              {finalCtaSection.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
                {finalCtaSection.content_data?.primary_button || 'Começar Agora'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>}

      <Footer />
    </div>;
}