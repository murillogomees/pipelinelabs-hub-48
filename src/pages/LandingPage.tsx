import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, ArrowRight, Users, TrendingUp, Shield, Zap, FileText, Package, Truck, ClipboardCheck, Building, Globe, Lock, Database, Cloud, Rocket, BarChart3, Calculator, CreditCard, ShoppingCart, Bell, Settings, Calendar, PieChart, Monitor, Smartphone, Tablet, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLandingPageContent } from '@/hooks/useLandingPageContent';
import { PipelineLabsLogo } from '@/components/Layout/PipelineLabsLogo';
import { Footer } from '@/components/Layout/Footer';
import { PersonaCard } from '@/components/ui/persona-card';

// Import the advanced mockup components (mantido para seção hero)
import { MockupDashboard, MockupPDV, MockupNFe, MockupInventory, MockupFinancial, MockupNotifications, MockupDailySales } from '@/components/ui/SystemMockups';
// PersonaCard removido - implementação inline

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
  const personasSection = getSection('personas');
  const featuresSection = getSection('features');
  const testimonialsSection = getSection('testimonials');
  const securitySection = getSection('security');
  
  const pricingSection = getSection('pricing');
  const finalCtaSection = getSection('final_cta');
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
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <MockupDashboard className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                  <div className="space-y-6">
                    <MockupNotifications className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                </div>

                {/* Segunda linha - Vendas e sistemas específicos */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-6">
                    <MockupDailySales className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                  <div className="space-y-6">
                    <MockupPDV className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                  <div className="space-y-6">
                    <MockupNFe className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                </div>

                {/* Terceira linha - Estoque e financeiro */}
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div className="space-y-6">
                    <MockupInventory className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                  <div className="space-y-6">
                    <MockupFinancial className="transform hover:scale-105 transition-transform" />
                    <div className="text-center">
                      
                      
                    </div>
                  </div>
                </div>

                {/* Features destacadas */}
                {heroSection.content_data?.mockup_features && <div className="grid md:grid-cols-3 gap-4">
                    {heroSection.content_data.mockup_features.map((feature: string, index: number) => {})}
                  </div>}
              </div>
            </div>
          </div>
        </section>}


      {/* Pain/Personas Section */}
      {personasSection && (
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {personasSection.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {personasSection.subtitle}
              </p>
            </div>

            {/* Cards de personas com novo layout responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto px-4">
              {personasSection.content_data?.personas?.map((persona: any, index: number) => (
                <PersonaCard
                  key={index}
                  name={persona.name}
                  age={persona.age}
                  location={persona.location}
                  business={persona.business}
                  image={persona.image}
                  problems={persona.problems}
                  solutions={persona.solutions}
                  result={persona.result}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        </section>
       )}

      {/* ERP Modules Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto">
              O ERP completo, pensado para pequenos negócios
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-12">
              Gerencie todo seu negócio de forma inteligente e integrada
            </p>
          </div>

          {/* Grid de Cards com Mockups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-screen-xl mx-auto">
            {/* Card Financeiro */}
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="aspect-video relative overflow-hidden rounded-t-xl">
                <MockupFinancial className="w-full h-full transform transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="text-md font-medium text-foreground">Financeiro</h3>
              </CardContent>
            </Card>

            {/* Card Dashboard */}
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="aspect-video relative overflow-hidden rounded-t-xl">
                <MockupDashboard className="w-full h-full transform transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="text-md font-medium text-foreground">Dashboard</h3>
              </CardContent>
            </Card>

            {/* Card Estoque */}
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="aspect-video relative overflow-hidden rounded-t-xl">
                <MockupInventory className="w-full h-full transform transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="text-md font-medium text-foreground">Estoque</h3>
              </CardContent>
            </Card>

            {/* Card Vendas PDV */}
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="aspect-video relative overflow-hidden rounded-t-xl">
                <MockupPDV className="w-full h-full transform transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="text-md font-medium text-foreground">PDV</h3>
              </CardContent>
            </Card>

            {/* Card NFe */}
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="aspect-video relative overflow-hidden rounded-t-xl">
                <MockupNFe className="w-full h-full transform transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="text-md font-medium text-foreground">Nota Fiscal</h3>
              </CardContent>
            </Card>

            {/* Card Vendas Diárias */}
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="aspect-video relative overflow-hidden rounded-t-xl">
                <MockupDailySales className="w-full h-full transform transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="text-md font-medium text-foreground">Vendas</h3>
              </CardContent>
            </Card>

            {/* Card Notificações */}
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="aspect-video relative overflow-hidden rounded-t-xl">
                <MockupNotifications className="w-full h-full transform transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="text-md font-medium text-foreground">Notificações</h3>
              </CardContent>
            </Card>

            {/* Card CRM - Usando Dashboard como placeholder */}
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="aspect-video relative overflow-hidden rounded-t-xl">
                <MockupDashboard className="w-full h-full transform transition-transform duration-300 group-hover:scale-110" />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="text-md font-medium text-foreground">CRM</h3>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section - DISABLED */}
      {false && featuresSection && <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {featuresSection.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {featuresSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-screen-xl mx-auto mb-12">
              {featuresSection.content_data?.features?.map((feature: any, index: number) => (
                <div 
                  key={index} 
                  className="group rounded-xl shadow-lg overflow-hidden relative bg-white hover:shadow-xl transition-all duration-300 hover:scale-105"
                  aria-label={`Card de Módulo ${feature.title}`}
                >
                  {/* Container da Imagem com Overlay */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={feature.image_url || "/placeholder.svg"}
                      alt={`Tela do módulo ${feature.title} do ERP`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
                    
                    {/* Título Sobreposto */}
                    <div className="absolute bottom-4 left-4 flex items-center text-white">
                      {getIcon(feature.icon)}
                      <h3 className="ml-2 text-xl md:text-2xl font-semibold drop-shadow-md">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Descrição Abaixo da Imagem */}
                  <div className="mt-4 px-4 pb-6">
                    <p className="text-base md:text-lg text-gray-800 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
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

      {/* Security Section - Movida para logo após Features */}
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