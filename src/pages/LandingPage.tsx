import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, ArrowRight, Users, TrendingUp, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLandingPageConfig } from '@/hooks/useLandingPageConfig';

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
  const { config } = useLandingPageConfig();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {config.logo_url ? (
              <img src={config.logo_url} alt={config.company_name} className="h-8 w-8" />
            ) : (
              <div className="h-8 w-8 bg-primary rounded-md"></div>
            )}
            <span className="font-bold text-xl">{config.company_name}</span>
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
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            {config.hero_badge}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {config.hero_title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {config.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
              {config.hero_cta_button}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              {config.hero_secondary_button}
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Você reconhece esses problemas?
            </h2>
            <p className="text-xl text-muted-foreground">
              Milhares de empreendedores enfrentam os mesmos desafios diariamente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Planilhas desorganizadas e sujeitas a erros",
              "Falta de controle sobre vendas multicanais", 
              "Dificuldade na emissão de notas fiscais",
              "Visibilidade limitada das finanças",
              "Processos manuais que consomem tempo",
              "Falta de integração entre sistemas"
            ].map((problem, index) => (
              <Card key={index} className="border-red-200 bg-red-50/50">
                <CardContent className="p-6">
                  <p className="text-red-800 font-medium">{problem}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Conheça quem já transformou seu negócio
            </h2>
            <p className="text-xl text-muted-foreground">
              Veja como diferentes empreendedores usam o Pipeline Labs
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {personas.map((persona, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img 
                      src={persona.image} 
                      alt={persona.name}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-xl">{persona.name}</CardTitle>
                      <CardDescription className="text-primary font-medium">
                        {persona.business}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Problema:</p>
                        <p className="text-red-600 font-medium">{persona.pain}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Solução:</p>
                        <p className="text-green-600 font-medium">{persona.solution}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Funcionalidades usadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {persona.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Funcionalidades que fazem a diferença
            </h2>
            <p className="text-xl text-muted-foreground">
              Tudo que você precisa para gerenciar seu negócio em um só lugar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <CardTitle className="mb-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mockups Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <img 
                src={dashboardMockup} 
                alt="Dashboard do Pipeline Labs"
                className="rounded-lg shadow-lg w-full"
              />
              <p className="text-center text-muted-foreground">
                Dashboard com visão completa do negócio
              </p>
            </div>
            <div className="space-y-4">
              <img 
                src={financialMockup} 
                alt="Relatórios Financeiros"
                className="rounded-lg shadow-lg w-full"
              />
              <p className="text-center text-muted-foreground">
                Relatórios financeiros em tempo real
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos que crescem com seu negócio
            </h2>
            <p className="text-xl text-muted-foreground">
              Escolha o plano ideal para sua empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
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
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-base font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empreendedores que já automatizaram 
            seus processos e aumentaram seus resultados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6"
            >
              Teste Grátis por 14 Dias
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary"
            >
              Falar com Consultor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 bg-primary rounded"></div>
                <span className="font-bold">Pipeline Labs</span>
              </div>
              <p className="text-muted-foreground text-sm">
                ERP inteligente, dinâmico e escalável para pequenos empreendedores.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Funcionalidades</li>
                <li>Integrações</li>
                <li>Preços</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Contato</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Privacidade</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
            © 2024 Pipeline Labs. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}