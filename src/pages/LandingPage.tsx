
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonaCard } from '@/components/ui/persona-card';
import { CheckCircle, ArrowRight, Star, Users, TrendingUp, Shield } from 'lucide-react';
import { useLandingPageContent } from '@/hooks/useLandingPageContent';
import { useLandingPagePlans } from '@/hooks/useLandingPagePlans';

// Simple SystemMockups component as fallback
const SystemMockups = () => (
  <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-8 flex items-center justify-center">
    <div className="text-center">
      <div className="w-24 h-24 bg-primary/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
        <TrendingUp className="w-12 h-12 text-primary" />
      </div>
      <p className="text-muted-foreground">Sistema Pipeline Labs</p>
    </div>
  </div>
);

export default function LandingPage() {
  const { sections, isLoading: isContentLoading, getSection } = useLandingPageContent();
  const { plans, isLoading: isPlansLoading } = useLandingPagePlans();

  if (isContentLoading || isPlansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  const heroSection = getSection('hero');
  const featuresSection = getSection('features');
  const testimonialsSection = getSection('testimonials');
  const pricingSection = getSection('pricing');
  const ctaSection = getSection('cta');

  if (!heroSection || !plans) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Falha ao carregar o conteúdo da página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="lg:flex items-center justify-between gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
                {heroSection.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {heroSection.subtitle}
              </p>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link to="/app/dashboard">
                    Acessar Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/termos-de-uso">
                    Termos de Uso
                  </Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2">
              <SystemMockups />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              {featuresSection?.title || 'Funcionalidades'}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {featuresSection?.subtitle || 'Conheça nossas principais funcionalidades'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Mock features if no content available */}
            <Card className="bg-card/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Gestão de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Controle completo de suas vendas e emissão de notas fiscais
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Controle de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gestão inteligente de estoque com relatórios detalhados
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Dashboard Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visão completa da saúde financeira do seu negócio
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              {testimonialsSection?.title || 'Depoimentos'}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {testimonialsSection?.subtitle || 'Veja o que nossos clientes dizem'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Mock personas as we don't have testimonials content */}
            <PersonaCard
              name="Ana Costa"
              age={34}
              location="São Paulo, SP"
              business="Loja de roupas femininas"
              image=""
            />
            <PersonaCard
              name="Lucas Silva"
              age={28}
              location="Rio de Janeiro, RJ"
              business="Vendedor em marketplaces"
              image=""
            />
            <PersonaCard
              name="Carla Santos"
              age={41}
              location="Belo Horizonte, MG"
              business="Pequena fábrica de salgados"
              image=""
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              {pricingSection?.title || 'Planos e Preços'}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {pricingSection?.subtitle || 'Escolha o plano ideal para seu negócio'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.id} className="bg-card/70 backdrop-blur">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-5xl font-extrabold">
                      R$ {plan.price}
                      <span className="text-sm text-muted-foreground font-normal">/mês</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6">
                    Escolher Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              {ctaSection?.title || 'Pronto para começar?'}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              {ctaSection?.subtitle || 'Comece a usar o Pipeline Labs hoje mesmo'}
            </p>
            <Button asChild size="lg">
              <Link to="/auth">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              © {new Date().getFullYear()} Pipeline Labs. Todos os direitos reservados.
            </span>
            <div className="space-x-4">
              <Link to="/termos-de-uso">Termos de Uso</Link>
              <Link to="/privacidade">Política de Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
