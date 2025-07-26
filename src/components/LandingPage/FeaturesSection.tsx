
import React from 'react';
import { CheckCircle, DollarSign, Package, FileText, TrendingUp, Users, Shield } from 'lucide-react';
import { ResponsiveContainer, ResponsiveSection, ResponsiveGrid } from '@/components/ui/responsive-layout';
import { FeatureCard } from '@/components/ui/optimized-card';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    title: 'Gestão de Vendas',
    description: 'Controle completo de suas vendas com emissão automática de notas fiscais e relatórios detalhados.',
    icon: <DollarSign className="w-6 h-6" />
  },
  {
    title: 'Controle de Estoque',
    description: 'Gestão inteligente de estoque com alertas automáticos, relatórios e múltiplos depósitos.',
    icon: <Package className="w-6 h-6" />
  },
  {
    title: 'Dashboard Financeiro',
    description: 'Visão completa da saúde financeira com DRE, fluxo de caixa e análises preditivas.',
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    title: 'Emissão Fiscal',
    description: 'NFe, NFSe e NFCe automatizadas com integração direta com a Sefaz.',
    icon: <FileText className="w-6 h-6" />
  },
  {
    title: 'Gestão de Clientes',
    description: 'CRM completo com histórico de compras, análise de comportamento e automações.',
    icon: <Users className="w-6 h-6" />
  },
  {
    title: 'Segurança Total',
    description: 'Dados protegidos com criptografia, backups automáticos e conformidade LGPD.',
    icon: <Shield className="w-6 h-6" />
  }
];

interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
}

export function FeaturesSection({ 
  title = "Tudo que você precisa em um só lugar",
  subtitle = "Funcionalidades completas para gestão do seu negócio"
}: FeaturesSectionProps) {
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
            cols={{ default: 1, sm: 2, lg: 3 }} 
            gap="lg"
            className="max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              />
            ))}
          </ResponsiveGrid>

          {/* CTA */}
          <div className="pt-8">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-full border border-border/50">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Teste grátis por 14 dias • Sem compromisso</span>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </ResponsiveSection>
  );
}
