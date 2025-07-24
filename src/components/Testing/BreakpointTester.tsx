import React, { useState, useEffect } from 'react';
import { EnhancedButton as Button } from '@/components/ui/enhanced-button';
import { OptimizedCard, StatsCard, FeatureCard } from '@/components/ui/optimized-card';
import { ResponsiveGrid, ResponsiveContainer, ResponsiveSection } from '@/components/ui/responsive-layout';
import { LoadingSkeleton, LoadingSpinner, PageLoading, CardLoading } from '@/components/ui/optimized-loading';
import { OptimizedInput, OptimizedTextarea } from '@/components/ui/optimized-input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Smartphone, Tablet, Laptop, Eye, RefreshCw, Settings, Users, TrendingUp, Package, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreakpointInfo {
  name: string;
  width: string;
  icon: React.ReactNode;
  description: string;
  className: string;
}

const BREAKPOINTS: BreakpointInfo[] = [
  { 
    name: 'Mobile', 
    width: '375px', 
    icon: <Smartphone className="w-4 h-4" />,
    description: 'iPhone SE, Small phones',
    className: 'w-[375px]'
  },
  { 
    name: 'Mobile L', 
    width: '414px', 
    icon: <Smartphone className="w-4 h-4" />,
    description: 'iPhone 14 Pro, Large phones',
    className: 'w-[414px]'
  },
  { 
    name: 'Tablet', 
    width: '768px', 
    icon: <Tablet className="w-4 h-4" />,
    description: 'iPad Mini, Small tablets',
    className: 'w-[768px]'
  },
  { 
    name: 'Tablet L', 
    width: '1024px', 
    icon: <Tablet className="w-4 h-4" />,
    description: 'iPad Pro, Large tablets',
    className: 'w-[1024px]'
  },
  { 
    name: 'Desktop', 
    width: '1280px', 
    icon: <Laptop className="w-4 h-4" />,
    description: 'MacBook Air, Small desktop',
    className: 'w-[1280px]'
  },
  { 
    name: 'Desktop L', 
    width: '1920px', 
    icon: <Monitor className="w-4 h-4" />,
    description: 'Full HD, Large desktop',
    className: 'w-[1920px]'
  }
];

const getCurrentBreakpoint = (width: number): string => {
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return '2xl';
};

export function BreakpointTester() {
  const [selectedBreakpoint, setSelectedBreakpoint] = useState<BreakpointInfo>(BREAKPOINTS[4]);
  const [showGrid, setShowGrid] = useState(true);
  const [showLoadingStates, setShowLoadingStates] = useState(false);
  const [currentViewport, setCurrentViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateViewport = () => {
      setCurrentViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const currentBreakpoint = getCurrentBreakpoint(currentViewport.width);

  const sampleData = {
    stats: [
      { title: 'Vendas Hoje', value: 'R$ 2.847', icon: <DollarSign className="w-4 h-4" />, trend: { value: 12, label: 'vs. ontem', isPositive: true } },
      { title: 'Pedidos', value: '47', icon: <Package className="w-4 h-4" />, trend: { value: 8, label: 'vs. ontem', isPositive: true } },
      { title: 'Clientes', value: '234', icon: <Users className="w-4 h-4" />, trend: { value: 23, label: 'vs. mês passado', isPositive: true } },
      { title: 'Crescimento', value: '15%', icon: <TrendingUp className="w-4 h-4" />, trend: { value: 5, label: 'vs. trimestre', isPositive: true } }
    ],
    features: [
      { title: 'Dashboard Inteligente', description: 'Visão completa do seu negócio com métricas em tempo real', icon: <Monitor className="w-6 h-6" /> },
      { title: 'Vendas Automatizadas', description: 'Sistema de vendas integrado com emissão automática de notas fiscais', icon: <Package className="w-6 h-6" /> },
      { title: 'Gestão Financeira', description: 'Controle total das finanças com fluxo de caixa e relatórios', icon: <DollarSign className="w-6 h-6" /> }
    ]
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header com informações do viewport */}
      <ResponsiveContainer>
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Teste Visual de Breakpoints</h1>
              <p className="text-muted-foreground">
                Viewport atual: {currentViewport.width}x{currentViewport.height}px 
                <Badge variant="secondary" className="ml-2">
                  {currentBreakpoint}
                </Badge>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={showLoadingStates ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLoadingStates(!showLoadingStates)}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Loading
              </Button>
            </div>
          </div>

          {/* Seletores de Breakpoint */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {BREAKPOINTS.map((bp) => (
              <Button
                key={bp.name}
                variant={selectedBreakpoint.name === bp.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBreakpoint(bp)}
                className="flex flex-col sm:flex-row items-center gap-1 p-2 h-auto"
              >
                {bp.icon}
                <div className="text-center sm:text-left">
                  <div className="text-xs font-medium">{bp.name}</div>
                  <div className="text-xs text-muted-foreground">{bp.width}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </ResponsiveContainer>

      {/* Container de Teste com Largura Específica */}
      <div className="w-full overflow-x-auto bg-muted/20 p-4 rounded-lg">
        <div className={cn(
          "mx-auto bg-background border rounded-lg p-4 space-y-6 transition-all duration-300",
          selectedBreakpoint.className,
          showGrid && "bg-grid-pattern"
        )}>
          {/* Header do Container de Teste */}
          <div className="text-center border-b pb-4">
            <h2 className="text-lg font-semibold flex items-center justify-center gap-2">
              {selectedBreakpoint.icon}
              {selectedBreakpoint.name} - {selectedBreakpoint.width}
            </h2>
            <p className="text-sm text-muted-foreground">{selectedBreakpoint.description}</p>
          </div>

          {/* Teste de Botões */}
          <div className="space-y-3">
            <h3 className="font-medium">Botões Responsivos</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="sm" fullWidth>Small Button</Button>
              <Button size="default" fullWidth>Default Button</Button>
              <Button size="lg" fullWidth>Large Button</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Success</Button>
            </div>
          </div>

          {/* Teste de Cards com Stats */}
          <div className="space-y-3">
            <h3 className="font-medium">Cards de Estatísticas</h3>
            {showLoadingStates ? (
              <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <CardLoading key={i} />
                ))}
              </ResponsiveGrid>
            ) : (
              <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
                {sampleData.stats.map((stat, index) => (
                  <StatsCard key={index} {...stat} />
                ))}
              </ResponsiveGrid>
            )}
          </div>

          {/* Teste de Feature Cards */}
          <div className="space-y-3">
            <h3 className="font-medium">Feature Cards</h3>
            {showLoadingStates ? (
              <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
                {Array.from({ length: 3 }, (_, i) => (
                  <CardLoading key={i} />
                ))}
              </ResponsiveGrid>
            ) : (
              <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
                {sampleData.features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} />
                ))}
              </ResponsiveGrid>
            )}
          </div>

          {/* Teste de Inputs */}
          <div className="space-y-3">
            <h3 className="font-medium">Inputs Responsivos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OptimizedInput
                label="Nome"
                placeholder="Digite seu nome"
                icon={<Users className="w-4 h-4" />}
              />
              <OptimizedInput
                label="Email"
                type="email"
                placeholder="seu@email.com"
                description="Seu email não será compartilhado"
              />
            </div>
            <OptimizedTextarea
              label="Observações"
              placeholder="Digite suas observações..."
              rows={3}
            />
          </div>

          {/* Teste de Loading States */}
          {showLoadingStates && (
            <div className="space-y-3">
              <h3 className="font-medium">Estados de Carregamento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Skeleton Loading</h4>
                  <LoadingSkeleton lines={3} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Spinner Loading</h4>
                  <div className="flex justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Card Loading</h4>
                  <CardLoading />
                </div>
              </div>
            </div>
          )}

          {/* Informações do Teste */}
          <div className="border-t pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações do Teste</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p><strong>Breakpoint Simulado:</strong> {selectedBreakpoint.name} ({selectedBreakpoint.width})</p>
                <p><strong>Breakpoint Real:</strong> {currentBreakpoint} ({currentViewport.width}px)</p>
                <p><strong>Grid Ativo:</strong> {showGrid ? 'Sim' : 'Não'}</p>
                <p><strong>Loading States:</strong> {showLoadingStates ? 'Ativo' : 'Inativo'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <ResponsiveContainer>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Como Usar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1.</strong> Selecione um breakpoint acima para simular diferentes tamanhos de tela</p>
            <p><strong>2.</strong> Use o botão "Grid" para visualizar a grade de layout</p>
            <p><strong>3.</strong> Use o botão "Loading" para testar estados de carregamento</p>
            <p><strong>4.</strong> Redimensione a janela do navegador para testar breakpoints reais</p>
            <p><strong>5.</strong> Verifique se todos os componentes se adaptam corretamente</p>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    </div>
  );
}