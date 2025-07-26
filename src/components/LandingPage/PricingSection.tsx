
import React from 'react';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { EnhancedButton as Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, ResponsiveSection, ResponsiveGrid, ResponsiveCard } from '@/components/ui/responsive-layout';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para começar seu negócio',
    price: '0',
    popular: false,
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Até 100 produtos',
      'Vendas básicas',
      'Emissão de NFe',
      '1 usuário',
      'Suporte por email'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Para negócios em crescimento',
    price: '49',
    popular: true,
    icon: <Crown className="w-6 h-6" />,
    features: [
      'Produtos ilimitados',
      'Dashboard completo',
      'Múltiplos usuários',
      'Integrações avançadas',
      'Suporte prioritário',
      'Relatórios personalizados'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes operações',
    price: '149',
    popular: false,
    icon: <Rocket className="w-6 h-6" />,
    features: [
      'Tudo do Professional',
      'API personalizada',
      'Whitelabel completo',
      'Suporte 24/7',
      'Treinamento incluído',
      'Gerente de conta dedicado'
    ]
  }
];

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
}

export function PricingSection({
  title = "Planos que se adaptam ao seu negócio",
  subtitle = "Comece grátis e escale conforme sua necessidade"
}: PricingSectionProps) {
  return (
    <ResponsiveSection spacing="lg" className="bg-secondary/30">
      <ResponsiveContainer>
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <h2 className="heading-section">
              {title}
            </h2>
            <p className="body-large max-w-3xl mx-auto">
              {subtitle}
            </p>
          </div>

          <ResponsiveGrid 
            cols={{ default: 1, md: 2, lg: 3 }}
            gap="lg"
            className="max-w-6xl mx-auto"
          >
            {plans.map((plan) => (
              <ResponsiveCard
                key={plan.id}
                variant={plan.popular ? "elevated" : "default"}
                className={`relative h-full ${plan.popular ? 'border-primary/50 shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                )}

                <div className="space-y-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-center">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl sm:text-5xl font-bold">R$ {plan.price}</span>
                      <span className="text-muted-foreground ml-2">/mês</span>
                    </div>
                    {plan.price === '0' && (
                      <p className="text-sm text-success mt-1">14 dias grátis</p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 flex-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    className="w-full mt-auto"
                  >
                    {plan.price === '0' ? 'Começar Grátis' : 'Escolher Plano'}
                  </Button>
                </div>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>

          {/* Additional info */}
          <div className="text-center space-y-4 pt-8">
            <p className="text-sm text-muted-foreground">
              Todos os planos incluem SSL, backup automático e suporte técnico
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>✓ Sem taxa de setup</span>
              <span>✓ Cancele quando quiser</span>
              <span>✓ Garantia de 30 dias</span>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </ResponsiveSection>
  );
}
