
import React from 'react';
import { Link } from 'react-router-dom';
import { EnhancedButton as Button, buttonVariants } from '@/components/ui/enhanced-button';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, ResponsiveSection } from '@/components/ui/responsive-layout';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title: string;
  subtitle: string;
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <ResponsiveSection spacing="xl" className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <ResponsiveContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh] lg:min-h-[70vh]">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <h1 className="heading-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                {title}
              </h1>
              <p className="body-large text-lg sm:text-xl lg:text-2xl max-w-2xl mx-auto lg:mx-0">
                {subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/app/dashboard"
                className={cn(buttonVariants({ size: "lg" }), "text-base sm:text-lg px-8 py-4")}
              >
                Acessar Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                to="/auth"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-base sm:text-lg px-8 py-4")}
              >
                Começar Grátis
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Grátis para começar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Suporte brasileiro</span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative order-first lg:order-last">
            <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 backdrop-blur-sm border border-border/50">
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-card to-card/80 rounded-lg border border-border flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-xl mx-auto flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Sistema Pipeline Labs</h3>
                    <p className="text-muted-foreground text-sm">ERP completo para seu negócio</p>
                  </div>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-3 shadow-lg">
                <div className="text-xs text-muted-foreground">Vendas hoje</div>
                <div className="text-lg font-bold text-success">+R$ 2.847</div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-3 shadow-lg">
                <div className="text-xs text-muted-foreground">Pedidos</div>
                <div className="text-lg font-bold text-primary">47</div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </ResponsiveSection>
  );
}
