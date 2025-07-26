import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonaCard } from '@/components/ui/persona-card';
import { SystemMockups } from '@/components/ui/SystemMockups';
import { CheckCircle, ArrowRight, Star, Users, TrendingUp, Shield } from 'lucide-react';
import { useLandingPageContent } from '@/hooks/useLandingPageContent';
import { useLandingPagePlans } from '@/hooks/useLandingPagePlans';

export default function LandingPage() {
  const { content, isLoading: isContentLoading } = useLandingPageContent();
  const { plans, isLoading: isPlansLoading } = useLandingPagePlans();
  const [selectedPlan, setSelectedPlan] = useState(null);

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

  if (!content || !plans) {
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
                {content.hero_title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {content.hero_subtitle}
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
              {content.features_title}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {content.features_subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.features.map((feature, index) => (
              <Card key={index} className="bg-card/70 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              {content.testimonials_title}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {content.testimonials_subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.testimonials.map((testimonial, index) => (
              <PersonaCard
                key={index}
                name={testimonial.name}
                title={testimonial.title}
                avatar={testimonial.avatar}
                description={testimonial.comment}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              {content.pricing_title}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {content.pricing_subtitle}
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
                    <p className="text-muted-foreground">
                      {plan.price_description}
                    </p>
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
              {content.cta_title}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              {content.cta_subtitle}
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
