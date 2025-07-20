import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Star, TrendingUp, Shield, Clock, Users, Target, Zap, BarChart3, Receipt, Package, DollarSign, Settings, FileText, Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import das imagens
import dashboardMockup from '@/assets/dashboard-mockup.jpg';
import invoiceMockup from '@/assets/invoice-mockup.jpg';
import inventoryMockup from '@/assets/inventory-mockup.jpg';
import financialMockup from '@/assets/financial-mockup.jpg';
import frustratedOwner from '@/assets/frustrated-business-owner.jpg';
import successTeam from '@/assets/success-team.jpg';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartTrial = () => {
    navigate('/cadastro-empresa');
  };

  const personas = [
    {
      name: "Ana, 34 anos",
      business: "Loja de Roupas Femininas",
      pain: "Perde vendas por falhas no controle de estoque e demora na emissão de notas fiscais",
      solution: "Estoque automatizado e emissão fiscal em segundos",
      image: "👗",
      savings: "R$ 3.500/mês em vendas perdidas"
    },
    {
      name: "Lucas, 28 anos", 
      business: "Vendedor em Marketplaces",
      pain: "Não consegue acompanhar pedidos de múltiplos canais e perde controle do estoque",
      solution: "Centralização completa de pedidos e estoque multicanal",
      image: "🛒",
      savings: "40% mais eficiência operacional"
    },
    {
      name: "Carla, 41 anos",
      business: "Fábrica de Salgados",
      pain: "Sem visibilidade financeira e dificuldade para calcular custos de produção",
      solution: "Dashboard financeiro completo e controle de produção",
      image: "🏭",
      savings: "25% redução nos custos"
    },
    {
      name: "Eduardo, 38 anos",
      business: "Distribuidor de Bebidas", 
      pain: "Logística manual e pedidos desorganizados causam atrasos constantes",
      solution: "Controle inteligente de estoque e otimização de entregas",
      image: "🚛",
      savings: "60% menos atrasos nas entregas"
    }
  ];

  const features = [
    {
      icon: <Receipt className="h-8 w-8" />,
      title: "Emissão Fiscal Completa",
      description: "NFe, NFSe e NFCe em segundos com validação automática",
      mockup: invoiceMockup
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Estoque Inteligente", 
      description: "Controle automatizado com alertas e relatórios em tempo real",
      mockup: inventoryMockup
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Dashboard Financeiro",
      description: "DRE, fluxo de caixa e análises estratégicas",
      mockup: financialMockup
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Gestão de Vendas",
      description: "PDV completo com controle multicanal",
      mockup: dashboardMockup
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 97",
      period: "/mês",
      description: "Perfeito para começar",
      features: [
        "Até 100 produtos",
        "Emissão de NFCe",
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
      description: "Mais vendido",
      features: [
        "Produtos ilimitados",
        "NFe, NFSe e NFCe",
        "Estoque multicanal",
        "Relatórios avançados",
        "Integrações",
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
        "Tudo do Professional",
        "Multi-empresas",
        "API personalizada",
        "Suporte 24/7",
        "Consultoria inclusa",
        "Implementação gratuita"
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PL</span>
            </div>
            <span className="font-bold text-xl">Pipeline Labs</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Soluções</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Preços</a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">Contato</a>
          </nav>
          <Button onClick={handleStartTrial} className="bg-primary hover:bg-primary/90">
            Teste Grátis
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Mais de 10.000 empresas confiam
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Pare de perder dinheiro com
                  <span className="text-primary"> gestão manual</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  O ERP completo que automatiza sua operação, elimina erros custosos e multiplica seus resultados.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleStartTrial} className="bg-primary hover:bg-primary/90">
                  Começar Teste Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Ver Demonstração
                </Button>
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Redução de erros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">5x</div>
                  <div className="text-sm text-muted-foreground">Mais rápido</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">R$ 12k</div>
                  <div className="text-sm text-muted-foreground">Economia média/mês</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={dashboardMockup} 
                alt="Dashboard Pipeline Labs" 
                className="rounded-lg shadow-2xl border"
              />
              <div className="absolute -bottom-4 -left-4 bg-card p-4 rounded-lg shadow-lg border">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">+247% de crescimento</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-destructive/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={frustratedOwner} 
                alt="Empresário frustrado" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Quantos <span className="text-destructive">R$ milhares você perde</span> todo mês?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold">Vendas perdidas por falta de controle</h3>
                    <p className="text-muted-foreground">Produtos em falta, preços desatualizados, clientes insatisfeitos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold">Horas perdidas com planilhas e processos manuais</h3>
                    <p className="text-muted-foreground">Tempo que poderia ser usado para vender e crescer</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold">Multas fiscais por erros na emissão</h3>
                    <p className="text-muted-foreground">NFe rejeitadas, atrasos na entrega, problemas com a Receita</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold">Decisões erradas por falta de dados</h3>
                    <p className="text-muted-foreground">Não saber o que vende, quanto ganha, onde está o dinheiro</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="font-semibold text-destructive">
                  Em média, nossos clientes perdiam R$ 8.500 por mês antes do Pipeline Labs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Veja como outros empreendedores <span className="text-primary">transformaram seus negócios</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Histórias reais de quem saiu do caos para a organização total
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <div className="text-4xl mb-2">{persona.image}</div>
                  <CardTitle className="text-lg">{persona.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {persona.business}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-destructive mb-1">Problema:</h4>
                    <p className="text-sm text-muted-foreground">{persona.pain}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-600 mb-1">Solução:</h4>
                    <p className="text-sm">{persona.solution}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="font-semibold text-primary text-sm">Resultado:</div>
                    <div className="text-sm font-medium">{persona.savings}</div>
                  </div>
                </CardContent>
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-xs">
                    Caso Real
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              A solução completa que seu negócio precisa
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo integrado em uma plataforma poderosa e fácil de usar
            </p>
          </div>

          <div className="space-y-20">
            {features.map((feature, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-lg text-muted-foreground">{feature.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Automatização completa</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Relatórios em tempo real</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Integração total</span>
                    </div>
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <img 
                    src={feature.mockup} 
                    alt={feature.title} 
                    className="rounded-lg shadow-xl border"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Junte-se a mais de <span className="text-primary">10.000 empresas</span> que já transformaram seus resultados
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Taxa de satisfação</div>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-primary">3x</div>
                  <div className="text-sm text-muted-foreground">Aumento médio de vendas</div>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-primary">72h</div>
                  <div className="text-sm text-muted-foreground">Implementação média</div>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Suporte disponível</div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src={successTeam} 
                alt="Equipe de sucesso" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Escolha o plano ideal para seu negócio
            </h2>
            <p className="text-xl text-muted-foreground">
              Todos os planos incluem 30 dias grátis. Cancele quando quiser.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.highlighted ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">{plan.price}</div>
                    <div className="text-muted-foreground">{plan.period}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={handleStartTrial}
                  >
                    Começar Teste Grátis
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              Precisa de algo personalizado? Fale com nosso time comercial.
            </p>
            <Button variant="outline" size="lg">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Pare de perder dinheiro hoje mesmo
            </h2>
            <p className="text-xl opacity-90">
              Comece seu teste gratuito agora e veja a diferença em 30 dias. 
              Sem cartão de crédito, sem compromisso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleStartTrial}
                className="bg-background text-foreground hover:bg-background/90"
              >
                <Zap className="mr-2 h-5 w-5" />
                Começar Teste Grátis Agora
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Agendar Demonstração
              </Button>
            </div>
            <div className="flex justify-center items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Dados 100% seguros</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Suporte 24/7</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>10.000+ empresas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">PL</span>
                </div>
                <span className="font-bold text-xl">Pipeline Labs</span>
              </div>
              <p className="text-muted-foreground">
                O ERP inteligente que automatiza sua gestão e multiplica seus resultados.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">(11) 99999-9999</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">contato@pipelinelabs.com.br</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">São Paulo, SP</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Imprensa</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Pipeline Labs. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;