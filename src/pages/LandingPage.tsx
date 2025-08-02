
import React from 'react';
import { Link } from 'react-router-dom';
import { EnhancedButton as Button, buttonVariants } from '@/components/ui/enhanced-button';
import { ArrowRight } from 'lucide-react';
import { HeroSection } from '@/components/LandingPage/HeroSection';
import { FeaturesSection } from '@/components/LandingPage/FeaturesSection';
import { PersonasSection } from '@/components/LandingPage/PersonasSection';
import { PricingSection } from '@/components/LandingPage/PricingSection';
import { ResponsiveContainer, ResponsiveSection } from '@/components/ui/responsive-layout';
import { useLandingPageContent } from '@/hooks/useLandingPageContent';
import { useLandingPagePlans } from '@/hooks/useLandingPagePlans';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { sections, isLoading: isContentLoading, getSection } = useLandingPageContent();
  const { plans, isLoading: isPlansLoading, error: plansError } = useLandingPagePlans();

  console.log('LandingPage render:', { 
    isContentLoading, 
    isPlansLoading, 
    plansError,
    sectionsCount: sections?.length 
  });

  if (isContentLoading || isPlansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando conteúdo...</p>
          {plansError && (
            <p className="text-sm text-muted-foreground">
              Problemas ao carregar planos, usando dados padrão...
            </p>
          )}
        </div>
      </div>
    );
  }

  const heroSection = getSection('hero');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Hero Section */}
      <HeroSection
        title={heroSection?.title || 'Pipeline Labs'}
        subtitle={heroSection?.subtitle || 'Sistema completo de gestão para pequenos empreendedores. ERP inteligente, dinâmico e escalável.'}
      />

      {/* Features Section */}
      <FeaturesSection />

      {/* Personas Section */}
      <PersonasSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <ResponsiveSection spacing="lg">
        <ResponsiveContainer>
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h2 className="heading-section text-3xl sm:text-4xl lg:text-5xl">
                Pronto para transformar seu negócio?
              </h2>
              <p className="body-large text-lg sm:text-xl max-w-3xl mx-auto">
                Junte-se a milhares de empreendedores que já otimizaram sua gestão com o Pipeline Labs
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/auth"
                className={cn(buttonVariants({ size: "lg" }), "text-lg px-8 py-4")}
              >
                Começar Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                to="/app/dashboard"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-lg px-8 py-4")}
              >
                Ver Demo
              </Link>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>✓ 14 dias grátis • ✓ Sem cartão de crédito • ✓ Suporte em português</p>
            </div>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Footer */}
      <footer className="py-12 bg-secondary/50 border-t border-border/50">
        <ResponsiveContainer>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>
              © {new Date().getFullYear()} Pipeline Labs. Todos os direitos reservados.
            </span>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link to="/termos-de-uso" className="hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="hover:text-foreground transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </ResponsiveContainer>
      </footer>
    </div>
  );
}
