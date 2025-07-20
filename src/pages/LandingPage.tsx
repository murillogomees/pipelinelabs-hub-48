import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Users, TrendingUp, Package, FileText, DollarSign, Clock, AlertTriangle, BarChart3, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLandingPageContent } from '@/hooks/useLandingPageContent';

// Import das imagens
import dashboardMockup from '@/assets/dashboard-mockup.jpg';
import invoiceMockup from '@/assets/invoice-mockup.jpg';
import inventoryMockup from '@/assets/inventory-mockup.jpg';
import financialMockup from '@/assets/financial-mockup.jpg';
import frustratedBusinessOwner from '@/assets/frustrated-business-owner.jpg';
import successTeam from '@/assets/success-team.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  const { getContentBySection, getSettingValue, loading } = useLandingPageContent();

  // Conteúdo dinâmico das seções
  const heroContent = getContentBySection('hero');
  const painContent = getContentBySection('pain_section');
  const featuresContent = getContentBySection('features');
  const pricingContent = getContentBySection('pricing');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl">
            {getSettingValue('company_name') || 'Pipeline Labs'}
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="hover:text-primary transition-colors">Soluções</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Preços</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contato</a>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Login
          </Button>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  {heroContent?.title || 'Transforme Sua Gestão com o Pipeline Labs'}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  {heroContent?.subtitle || 'O ERP Completo Para Pequenos Empreendedores'}
                </p>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {heroContent?.description || 'Sistema completo de gestão de vendas com serviços financeiros, feito para ajudar pequenos empreendedores a tomar decisões melhores.'}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {heroContent?.content_data?.benefits?.map((benefit: string, index: number) => (
                  <Badge key={index} variant="secondary" className="px-4 py-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {benefit}
                  </Badge>
                )) || (
                  <>
                    <Badge variant="secondary" className="px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Automatize processos
                    </Badge>
                    <Badge variant="secondary" className="px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Facilite gestões estratégicas
                    </Badge>
                    <Badge variant="secondary" className="px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Integre com sistemas existentes
                    </Badge>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  onClick={() => navigate('/auth')}
                >
                  {heroContent?.content_data?.button_text || 'Comece Grátis Agora'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  ✨ 30 dias grátis • Sem cartão de crédito • Cancelamento a qualquer momento
                </p>
              </div>

              <div className="mt-16">
                <img
                  src={heroContent?.image_url || dashboardMockup}
                  alt="Dashboard do Pipeline Labs"
                  className="rounded-lg shadow-2xl mx-auto max-w-4xl w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  {painContent?.title || 'Você Está Perdendo Tempo e Dinheiro?'}
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  {painContent?.subtitle || 'Os Problemas Que Todo Empreendedor Enfrenta'}
                </p>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {painContent?.description || 'Descubra como esses problemas estão impactando seu negócio diariamente.'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  {painContent?.content_data?.pain_points?.map((pain: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4 p-6 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                      <AlertTriangle className="h-6 w-6 text-destructive mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{pain.title}</h3>
                        <p className="text-muted-foreground">{pain.description}</p>
                      </div>
                    </div>
                  )) || (
                    <>
                      <div className="flex items-start space-x-4 p-6 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                        <AlertTriangle className="h-6 w-6 text-destructive mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Planilhas Desatualizadas</h3>
                          <p className="text-muted-foreground">Controle manual gera erros e retrabalho constante</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-6 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                        <AlertTriangle className="h-6 w-6 text-destructive mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Falta de Controle Multicanal</h3>
                          <p className="text-muted-foreground">Vendas espalhadas sem visão unificada do negócio</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-6 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                        <Clock className="h-6 w-6 text-destructive mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Processos Manuais</h3>
                          <p className="text-muted-foreground">Tempo perdido com tarefas repetitivas que poderiam ser automatizadas</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center">
                  <img
                    src={painContent?.image_url || frustratedBusinessOwner}
                    alt="Empresário frustrado com gestão manual"
                    className="rounded-lg shadow-lg mx-auto max-w-md w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-4 italic">
                    "Não aguento mais perder vendas por falta de controle..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Personas Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Conheça Nossos <span className="text-primary">Clientes Reais</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Veja como diferentes tipos de negócios estão usando o Pipeline Labs para crescer
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Ana - Loja de Roupas */}
              <Card className="relative">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">👗</div>
                  <h3 className="font-bold text-lg mb-2">Ana, 34 anos</h3>
                  <p className="text-primary font-medium mb-4">Loja de roupas femininas</p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-destructive">Problema:</span>
                      <p className="text-muted-foreground">Usava planilhas com falhas constantes</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Solução:</span>
                      <p>Estoque automatizado e emissão fiscal simplificada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lucas - Vendedor Online */}
              <Card className="relative">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">🛒</div>
                  <h3 className="font-bold text-lg mb-2">Lucas, 28 anos</h3>
                  <p className="text-primary font-medium mb-4">Vendedor em marketplaces</p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-destructive">Problema:</span>
                      <p className="text-muted-foreground">Falta de controle multicanal</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Solução:</span>
                      <p>Centralização de pedidos e estoque</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Carla - Fábrica */}
              <Card className="relative">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">🏭</div>
                  <h3 className="font-bold text-lg mb-2">Carla, 41 anos</h3>
                  <p className="text-primary font-medium mb-4">Pequena fábrica de salgados</p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-destructive">Problema:</span>
                      <p className="text-muted-foreground">Falta de visibilidade financeira</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Solução:</span>
                      <p>Dashboard financeiro e ordem de produção</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Eduardo - Distribuidor */}
              <Card className="relative">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">🚛</div>
                  <h3 className="font-bold text-lg mb-2">Eduardo, 38 anos</h3>
                  <p className="text-primary font-medium mb-4">Distribuidor de bebidas</p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-destructive">Problema:</span>
                      <p className="text-muted-foreground">Logística e pedidos manuais</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Solução:</span>
                      <p>Controle de estoque e separação automatizada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  {featuresContent?.title || 'Soluções Completas Para Seu Negócio'}
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  {featuresContent?.subtitle || 'Tudo que Você Precisa em Um Só Lugar'}
                </p>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {featuresContent?.description || 'Descubra como o Pipeline Labs resolve cada um dos seus problemas de gestão.'}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {featuresContent?.content_data?.features?.map((feature: any, index: number) => (
                  <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        {feature.icon === 'package' && <Package className="h-8 w-8 text-primary" />}
                        {feature.icon === 'file-text' && <FileText className="h-8 w-8 text-secondary" />}
                        {feature.icon === 'trending-up' && <TrendingUp className="h-8 w-8 text-primary" />}
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                )) || (
                  <>
                    <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                      <CardContent className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Gestão de Estoque Inteligente</h3>
                        <p className="text-muted-foreground">
                          Controle automático com alertas de estoque baixo e relatórios de giro de produtos
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                      <CardContent className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                          <FileText className="h-8 w-8 text-secondary" />
                        </div>
                        <h3 className="text-xl font-semibold">Emissão Fiscal Automatizada</h3>
                        <p className="text-muted-foreground">
                          NFe, NFSe e NFCe em poucos cliques, integrado com a Receita Federal
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                      <CardContent className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Dashboard Financeiro</h3>
                        <p className="text-muted-foreground">
                          Visão completa do seu DRE, fluxo de caixa e indicadores em tempo real
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Feature Images */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <img src={dashboardMockup} alt="Dashboard" className="rounded-lg shadow-lg" />
                  <img src={inventoryMockup} alt="Estoque" className="rounded-lg shadow-lg" />
                </div>
                <div className="space-y-4">
                  <img src={invoiceMockup} alt="Notas Fiscais" className="rounded-lg shadow-lg" />
                  <img src={financialMockup} alt="Financeiro" className="rounded-lg shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-bold">
                    Mais de <span className="text-primary">5.000 empresas</span> já transformaram seus resultados
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
                      <div className="text-3xl font-bold text-primary">24h</div>
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
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  {pricingContent?.title || 'Planos que Cabem no Seu Orçamento'}
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  {pricingContent?.subtitle || 'Escolha o Plano Ideal Para Seu Negócio'}
                </p>
                <p className="text-lg text-muted-foreground">
                  {pricingContent?.description || 'Comece grátis e evolua conforme sua empresa cresce.'}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {pricingContent?.content_data?.plans?.map((plan: any, index: number) => (
                  <Card key={index} className={`relative ${index === 1 ? 'border-primary border-2' : ''}`}>
                    {index === 1 && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Mais Popular</Badge>
                      </div>
                    )}
                    <CardContent className="p-8">
                      <div className="text-center space-y-4">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <div className="space-y-2">
                          <div className="text-4xl font-bold">R$ {plan.price}</div>
                          <p className="text-muted-foreground">{plan.period}</p>
                        </div>
                        <Button 
                          className="w-full"
                          variant={index === 1 ? "default" : "outline"}
                          onClick={() => navigate('/auth')}
                        >
                          {index === 0 ? 'Começar Grátis' : index === 1 ? 'Começar Agora' : 'Falar com Vendas'}
                        </Button>
                      </div>
                      
                      <div className="mt-8 space-y-4">
                        {plan.features?.map((feature: string, featureIndex: number) => (
                          <div key={featureIndex} className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <>
                    {/* Planos padrão caso não haja conteúdo dinâmico */}
                    <Card className="relative">
                      <CardContent className="p-8">
                        <div className="text-center space-y-4">
                          <h3 className="text-2xl font-bold">Starter</h3>
                          <div className="space-y-2">
                            <div className="text-4xl font-bold">R$ 0</div>
                            <p className="text-muted-foreground">30 dias grátis</p>
                          </div>
                          <Button 
                            className="w-full"
                            variant="outline"
                            onClick={() => navigate('/auth')}
                          >
                            Começar Grátis
                          </Button>
                        </div>
                        
                        <div className="mt-8 space-y-4">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Até 100 produtos</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>1 usuário</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Suporte por email</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative border-primary border-2">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Mais Popular</Badge>
                      </div>
                      <CardContent className="p-8">
                        <div className="text-center space-y-4">
                          <h3 className="text-2xl font-bold">Professional</h3>
                          <div className="space-y-2">
                            <div className="text-4xl font-bold">R$ 99</div>
                            <p className="text-muted-foreground">por mês</p>
                          </div>
                          <Button 
                            className="w-full"
                            onClick={() => navigate('/auth')}
                          >
                            Começar Agora
                          </Button>
                        </div>
                        
                        <div className="mt-8 space-y-4">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Produtos ilimitados</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>5 usuários</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Integrações avançadas</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Suporte prioritário</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative">
                      <CardContent className="p-8">
                        <div className="text-center space-y-4">
                          <h3 className="text-2xl font-bold">Enterprise</h3>
                          <div className="space-y-2">
                            <div className="text-4xl font-bold">R$ 299</div>
                            <p className="text-muted-foreground">por mês</p>
                          </div>
                          <Button 
                            className="w-full"
                            variant="outline"
                            onClick={() => navigate('/auth')}
                          >
                            Falar com Vendas
                          </Button>
                        </div>
                        
                        <div className="mt-8 space-y-4">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Tudo do Professional</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Usuários ilimitados</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Whitelabel</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Suporte dedicado</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* CTA Final */}
              <div className="text-center mt-16">
                <div className="bg-gradient-to-r from-primary to-secondary p-8 rounded-lg text-white">
                  <h3 className="text-3xl font-bold mb-4">Pronto para Transformar Seu Negócio?</h3>
                  <p className="text-xl mb-6 opacity-90">
                    Junte-se a milhares de empresas que já estão crescendo com o Pipeline Labs
                  </p>
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="text-lg px-8 py-6"
                    onClick={() => navigate('/auth')}
                  >
                    Começar Agora - É Grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-background border-t">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4">
                  {getSettingValue('company_name') || 'Pipeline Labs'}
                </h4>
                <p className="text-muted-foreground">
                  ERP inteligente, dinâmico e escalável para pequenos empreendedores.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Produto</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#features" className="hover:text-primary">Funcionalidades</a></li>
                  <li><a href="#pricing" className="hover:text-primary">Preços</a></li>
                  <li><a href="#" className="hover:text-primary">Integrações</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#" className="hover:text-primary">Sobre</a></li>
                  <li><a href="#" className="hover:text-primary">Blog</a></li>
                  <li><a href="#" className="hover:text-primary">Carreiras</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contato</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>{getSettingValue('contact_email') || 'contato@pipelinelabs.com.br'}</li>
                  <li>{getSettingValue('contact_phone') || '(11) 99999-9999'}</li>
                  <li><a href="#" className="hover:text-primary">Suporte</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
              <p>&copy; 2024 Pipeline Labs. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}