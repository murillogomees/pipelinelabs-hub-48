import React from 'react';
import { EnhancedButton as Button } from '@/components/ui/enhanced-button';
import { OptimizedCard, StatsCard, FeatureCard } from '@/components/ui/optimized-card';
import { ResponsiveGrid, ResponsiveCard, ResponsiveContainer, ResponsiveSection } from '@/components/ui/responsive-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, ArrowRight, Users, TrendingUp, Shield, Zap, FileText, Package, Truck, ClipboardCheck, Building, Globe, Lock, Database, Cloud, Rocket, BarChart3, Calculator, CreditCard, ShoppingCart, Bell, Settings, Calendar, PieChart, Monitor, Smartphone, Tablet, DollarSign, Banknote, LayoutDashboard, Warehouse, Receipt, Megaphone, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLandingPageContent } from '@/hooks/useLandingPageContent';
import { useLandingPagePlans } from '@/hooks/useLandingPagePlans';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { supabase } from '@/integrations/supabase/client';
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
    'lock': <Lock className="h-4 w-4 text-success" />,
    'database': <Database className="h-4 w-4 text-success" />,
    'cloud': <Cloud className="h-4 w-4 text-success" />,
    'rocket': <Rocket className="h-5 w-5" />,
    'bell': <Bell className="h-4 w-4 text-info" />,
    'settings': <Settings className="h-4 w-4 text-muted-foreground" />,
    'calendar': <Calendar className="h-4 w-4 text-accent" />,
    'monitor': <Monitor className="h-6 w-6 text-primary" />,
    'smartphone': <Smartphone className="h-6 w-6 text-primary" />,
    'tablet': <Tablet className="h-6 w-6 text-primary" />
  };
  return iconMap[iconName] || <Star className="h-8 w-8 text-primary" />;
};
export function LandingPage() {
  const navigate = useNavigate();
  const { plans: billingPlans, isLoading: plansLoading } = useLandingPagePlans();
  const { createCheckoutSession, isLoading: checkoutLoading } = useStripeCheckout();
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
            {/* Development test button */}
            {import.meta.env.DEV && (
              <Button variant="outline" size="sm" onClick={() => window.open('/#/app/breakpoint-test', '_blank')}>
                <Eye className="w-4 h-4 mr-1" />
                Teste UI
              </Button>
            )}
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hero-title">
              {heroSection.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto hero-subtitle">
              {heroSection.subtitle}
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto hero-subtitle">
              {heroSection.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 hero-cta">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
                {getIcon('rocket')}
                {heroSection.content_data?.button_text || 'Começar Agora'}
              </Button>
              
            </div>
            
            {/* Demonstração do Sistema */}
            <div className="max-w-7xl mx-auto mt-16">
              <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-blue-50 rounded-3xl p-8 border border-primary/20 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4 border border-border/20">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
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
                <div 
                  key={index} 
                  className="animate-fade-in hover-scale"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <PersonaCard
                    name={persona.name}
                    age={persona.age}
                    location={persona.location}
                    business={persona.business}
                    image={persona.image}
                    problems={persona.problems}
                    solutions={persona.solutions}
                    result={persona.result}
                    className="h-full transition-all duration-300 hover:shadow-xl"
                  />
                </div>
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

          {/* Grid de Cards com Mockups Modernos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-screen-xl mx-auto">
            
            {/* Card Financeiro */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Módulo Financeiro"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <MockupFinancial className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <Banknote className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    Financeiro
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Controle financeiro completo com fluxo de caixa e cobranças automatizadas.
                </p>
              </div>
            </div>

            {/* Card Dashboard */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Módulo Dashboard"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <MockupDashboard className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <LayoutDashboard className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    Dashboard
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Visão completa do seu negócio com relatórios e métricas em tempo real.
                </p>
              </div>
            </div>

            {/* Card Estoque */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Módulo Estoque"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <MockupInventory className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <Warehouse className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    Estoque
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Gestão inteligente de produtos com controle automático de baixas.
                </p>
              </div>
            </div>

            {/* Card Vendas PDV */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Módulo PDV"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <MockupPDV className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <Monitor className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    PDV
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Terminal de vendas rápido e intuitivo para atendimento ágil.
                </p>
              </div>
            </div>

            {/* Card NFe */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Módulo Nota Fiscal"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <MockupNFe className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <Receipt className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    Nota Fiscal
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Emissão automática de NFe, NFSe e NFCe integrada com a Sefaz.
                </p>
              </div>
            </div>

            {/* Card Vendas Diárias */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Módulo Vendas"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <MockupDailySales className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <TrendingUp className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    Vendas
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Relatórios detalhados de vendas com análise de performance.
                </p>
              </div>
            </div>

            {/* Card Notificações */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Módulo Notificações"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <MockupNotifications className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <Bell className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    Notificações
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Central de alertas para manter você sempre informado sobre seu negócio.
                </p>
              </div>
            </div>

            {/* Card CRM */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Módulo CRM"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <MockupDashboard className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent"></div>
                 <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <Users className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    CRM
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Gestão completa de clientes e relacionamento comercial integrado.
                </p>
              </div>
            </div>

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

      {/* Security Section - Nova implementação completa */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-4xl mx-auto">
              Segurança de Ponta para o Seu Negócio
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-12">
              Proteção total dos seus dados com tecnologia de última geração
            </p>
          </div>

          {/* Grid de Cards de Segurança com Mockups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Card Autenticação */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Autenticação Segura"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-1.5 bg-primary/30 rounded mx-auto"></div>
                    <div className="w-10 h-1 bg-muted rounded mx-auto"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <Shield className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    Autenticação Forte
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Login seguro com autenticação de dois fatores e controle de acesso rigoroso.
                </p>
              </div>
            </div>

            {/* Card Criptografia */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Criptografia de Dados"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-success/10 to-success/5 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-6 h-6 text-success" />
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-1.5 bg-success/30 rounded mx-auto"></div>
                    <div className="w-10 h-1 bg-muted rounded mx-auto"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <Lock className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    Criptografia
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Todos os dados são criptografados com algoritmos de segurança militar.
                </p>
              </div>
            </div>

            {/* Card Backup Seguro */}
            <div 
              className="group rounded-xl shadow-lg overflow-hidden relative bg-card hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label="Card de Backup Seguro"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-info/10 to-info/5 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Database className="w-6 h-6 text-info" />
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-1.5 bg-info/30 rounded mx-auto"></div>
                    <div className="w-10 h-1 bg-muted rounded mx-auto"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center text-primary-foreground drop-shadow-lg">
                  <Database className="w-5 h-5 text-primary-foreground mr-2" />
                  <h3 className="text-xl md:text-2xl font-semibold drop-shadow-md">
                    Backup Seguro
                  </h3>
                </div>
              </div>
              <div className="mt-4 px-4 pb-6">
                <p className="text-base md:text-lg text-card-foreground font-medium leading-relaxed">
                  Backups automáticos diários com redundância geográfica garantida.
                </p>
              </div>
            </div>

          </div>

          {/* Recursos de Segurança Adiccionais */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border/20">
              <Shield className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">SSL/TLS</span>
            </div>
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border/20">
              <Lock className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">LGPD</span>
            </div>
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border/20">
              <Database className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">ISO 27001</span>
            </div>
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border/20">
              <Cloud className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">AWS Seguro</span>
            </div>
          </div>

          {/* CTA de Segurança */}
          <div className="mt-12 text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Seus dados sempre protegidos</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Utilizamos as melhores práticas de segurança do mercado para garantir a proteção total das suas informações.
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="gradient-primary">
              <Shield className="w-5 h-5 mr-2" />
              Experimente com Segurança
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {false && testimonialsSection && <section className="py-20 px-4">
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
              {plansLoading ? (
                <div className="col-span-3 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Carregando planos...</p>
                </div>
              ) : billingPlans.length > 0 ? (
                billingPlans.slice(0, 3).map((plan, index) => (
                  <Card key={plan.id} className={`relative ${index === 1 ? 'border-primary scale-105' : ''}`}>
                    {index === 1 && (
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
                          /{plan.interval === 'month' ? 'mês' : 'ano'}
                        </span>
                      </div>
                      {plan.description && (
                        <CardDescription>{plan.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center">
                            <Check className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant={index === 1 ? "default" : "outline"}
                        disabled={checkoutLoading}
                        onClick={async () => {
                          // Verificar se o usuário está logado
                          const { data: { user } } = await supabase.auth.getUser();
                          
                          if (user) {
                            // Buscar company_id do usuário
                            const { data: userCompany } = await supabase
                              .from('user_companies')
                              .select('company_id')
                              .eq('user_id', user.id)
                              .eq('is_active', true)
                              .single();
                            
                            if (userCompany?.company_id) {
                              createCheckoutSession(plan.id, userCompany.company_id);
                            } else {
                              navigate('/auth');
                            }
                          } else {
                            navigate('/auth');
                          }
                        }}
                      >
                        {checkoutLoading ? 'Processando...' : 'Começar Agora'}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Fallback para planos estáticos se não carregar do banco
                pricingSection.content_data?.plans?.map((plan: any, index: number) => (
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
                            <Check className="h-4 w-4 text-success mr-2 flex-shrink-0" />
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
                ))
              )}
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