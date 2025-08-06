import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Database, Code, Settings, Shield, Trash2, Check, Eye, GitMerge } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SuperAdminOnly } from '@/components/ProtectedRoute/SuperAdminOnly';

type AuditItemStatus = 'pending' | 'keep' | 'remove' | 'merge' | 'investigate';

interface AuditItem {
  id: string;
  name: string;
  type: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  recommendations: string[];
  status: AuditItemStatus;
  usage?: {
    queries?: number;
    records?: number;
    lastUsed?: string;
  };
}

export default function SystemAudit() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [auditData, setAuditData] = useState<{
    unusedTables: AuditItem[];
    unusedFunctions: AuditItem[];
    unusedHooks: AuditItem[];
    unusedComponents: AuditItem[];
    securityIssues: AuditItem[];
  }>({
    unusedTables: [
      {
        id: 'table_performance_metrics',
        name: 'performance_metrics',
        type: 'table',
        description: 'Tabela para métricas de performance nunca utilizada',
        risk: 'low',
        recommendations: ['Remover tabela', 'Não há dependências'],
        status: 'pending',
        usage: { queries: 9, records: 0, lastUsed: 'Nunca' }
      },
      {
        id: 'table_csrf_tokens',
        name: 'csrf_tokens',
        type: 'table',
        description: 'Sistema de CSRF tokens não implementado',
        risk: 'medium',
        recommendations: ['Implementar sistema CSRF', 'Ou remover tabela'],
        status: 'pending',
        usage: { queries: 12, records: 0, lastUsed: 'Nunca' }
      },
      {
        id: 'table_similarity_patterns',
        name: 'similarity_patterns',
        type: 'table',
        description: 'Padrões de similaridade para ML não utilizados',
        risk: 'low',
        recommendations: ['Remover tabela', 'Funcionalidade não implementada'],
        status: 'pending',
        usage: { queries: 26, records: 0, lastUsed: 'Nunca' }
      },
      {
        id: 'table_auditoria_historico',
        name: 'auditoria_historico',
        type: 'table',
        description: 'Histórico de auditorias automatizadas',
        risk: 'low',
        recommendations: ['Implementar sistema de auditoria', 'Ou remover'],
        status: 'pending',
        usage: { queries: 28, records: 0, lastUsed: 'Nunca' }
      },
      {
        id: 'table_learning_sessions',
        name: 'learning_sessions',
        type: 'table',
        description: 'Sessões de aprendizado de máquina',
        risk: 'low',
        recommendations: ['Remover tabela', 'Funcionalidade não utilizada'],
        status: 'pending',
        usage: { queries: 28, records: 0, lastUsed: 'Nunca' }
      },
      {
        id: 'table_notifications',
        name: 'notifications',
        type: 'table',
        description: 'Sistema de notificações muito consultado mas vazio',
        risk: 'medium',
        recommendations: ['Implementar notificações', 'Ou desabilitar consultas'],
        status: 'pending',
        usage: { queries: 661, records: 0, lastUsed: 'Nunca' }
      }
    ],
    unusedFunctions: [
      {
        id: 'func_cache_manager',
        name: 'cache-manager',
        type: 'edge_function',
        description: 'Edge function para gerenciamento de cache não implementada',
        risk: 'low',
        recommendations: ['Remover do config.toml', 'Pasta não existe'],
        status: 'pending'
      },
      {
        id: 'func_demo_rate_limit',
        name: 'demo-rate-limit',
        type: 'edge_function',
        description: 'Demo de rate limiting, provavelmente temporária',
        risk: 'low',
        recommendations: ['Remover do config.toml', 'Era apenas demo'],
        status: 'pending'
      },
      {
        id: 'func_executar_auditoria',
        name: 'executar-auditoria',
        type: 'edge_function',
        description: 'Function para auditoria automatizada não implementada',
        risk: 'low',
        recommendations: ['Implementar auditoria', 'Ou remover do config'],
        status: 'pending'
      },
      {
        id: 'func_marketplace_auth',
        name: 'marketplace-auth',
        type: 'edge_function',
        description: 'Autenticação para marketplace não implementada',
        risk: 'medium',
        recommendations: ['Implementar marketplace', 'Ou remover funcionalidade'],
        status: 'pending'
      }
    ],
    unusedHooks: [
      {
        id: 'hook_auditoria_projeto',
        name: 'useAuditoriaProjeto',
        type: 'hook',
        description: 'Hook para auditoria de projeto não utilizado',
        risk: 'low',
        recommendations: ['Remover hook', 'Implementar auditoria', 'Ou mover para admin'],
        status: 'pending'
      },
      {
        id: 'hook_marketplace_auth',
        name: 'useMarketplaceAuth',
        type: 'hook',
        description: 'Hook de autenticação do marketplace pouco usado',
        risk: 'medium',
        recommendations: ['Implementar marketplace completo', 'Ou remover funcionalidade'],
        status: 'pending'
      },
      {
        id: 'hook_performance_monitoring',
        name: 'usePerformanceMonitoring',
        type: 'hook',
        description: 'Hook de monitoramento de performance complexo',
        risk: 'low',
        recommendations: ['Simplificar monitoramento', 'Usar métricas básicas'],
        status: 'pending'
      }
    ],
    unusedComponents: [
      {
        id: 'comp_code_analysis',
        name: 'CodeAnalysis',
        type: 'component_tree',
        description: 'Sistema completo de análise de código muito complexo',
        risk: 'medium',
        recommendations: ['Simplificar análise', 'Remover funcionalidades avançadas', 'Manter básico'],
        status: 'pending'
      },
      {
        id: 'comp_marketplace_grid',
        name: 'MarketplaceGrid',
        type: 'component',
        description: 'Grid do marketplace sem funcionalidade real',
        risk: 'low',
        recommendations: ['Implementar marketplace', 'Ou remover componentes'],
        status: 'pending'
      },
      {
        id: 'comp_production_dashboard',
        name: 'ProductionDashboard',
        type: 'component',
        description: 'Dashboard de produção complexo sem dados reais',
        risk: 'medium',
        recommendations: ['Implementar sistema de produção', 'Ou simplificar'],
        status: 'pending'
      }
    ],
    securityIssues: [
      {
        id: 'sec_function_search_path',
        name: 'Function Search Path Mutable',
        type: 'security',
        description: '17 funções sem search_path definido (problema de segurança)',
        risk: 'high',
        recommendations: ['Adicionar SET search_path às funções', 'Aplicar fix imediatamente'],
        status: 'pending'
      },
      {
        id: 'sec_foreign_tables',
        name: 'Foreign Tables in API',
        type: 'security',
        description: 'Tabelas estrangeiras expostas na API sem RLS',
        risk: 'high',
        recommendations: ['Revisar exposição de tabelas', 'Aplicar RLS adequado'],
        status: 'pending'
      }
    ]
  });

  const updateItemStatus = (itemId: string, status: AuditItemStatus) => {
    setAuditData(prev => {
      const newData = { ...prev };
      
      // Encontrar e atualizar o item em todas as categorias
      Object.keys(newData).forEach(category => {
        const categoryData = newData[category as keyof typeof newData] as AuditItem[];
        const itemIndex = categoryData.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          categoryData[itemIndex] = { ...categoryData[itemIndex], status };
        }
      });
      
      return newData;
    });

    toast({
      title: "Status atualizado",
      description: `Item marcado como: ${getStatusLabel(status)}`,
    });
  };

  const getStatusLabel = (status: AuditItemStatus) => {
    switch (status) {
      case 'keep': return 'Manter';
      case 'remove': return 'Remover';
      case 'merge': return 'Mesclar';
      case 'investigate': return 'Investigar';
      default: return 'Pendente';
    }
  };

  const getStatusColor = (status: AuditItemStatus) => {
    switch (status) {
      case 'keep': return 'bg-green-100 text-green-800';
      case 'remove': return 'bg-red-100 text-red-800';
      case 'merge': return 'bg-yellow-100 text-yellow-800';
      case 'investigate': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const executeActions = () => {
    const actions = Object.values(auditData).flat().filter(item => item.status !== 'pending');
    
    if (actions.length === 0) {
      toast({
        title: "Nenhuma ação selecionada",
        description: "Selecione pelo menos um item para executar ações.",
        variant: "destructive"
      });
      return;
    }

    // Simular execução das ações
    toast({
      title: "Executando ações",
      description: `${actions.length} ações serão executadas. Isso pode levar alguns minutos.`,
    });

    // Aqui seria implementada a lógica real de execução
    console.log('Ações a executar:', actions);
  };

  const AuditItemCard = ({ item, category }: { item: AuditItem; category: string }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox 
              checked={selectedItems.includes(item.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedItems([...selectedItems, item.id]);
                } else {
                  setSelectedItems(selectedItems.filter(id => id !== item.id));
                }
              }}
            />
            <div>
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getRiskColor(item.risk)}>
              {item.risk === 'high' ? 'Alto Risco' : item.risk === 'medium' ? 'Médio Risco' : 'Baixo Risco'}
            </Badge>
            <Badge className={getStatusColor(item.status)}>
              {getStatusLabel(item.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {item.usage && (
          <div className="mb-3 p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Consultas:</span> {item.usage.queries || 0}
              </div>
              <div>
                <span className="font-medium">Registros:</span> {item.usage.records || 0}
              </div>
              <div>
                <span className="font-medium">Último uso:</span> {item.usage.lastUsed || 'N/A'}
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="font-medium mb-2">Recomendações:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {item.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={item.status === 'keep' ? 'default' : 'outline'}
            onClick={() => updateItemStatus(item.id, 'keep')}
          >
            <Check className="w-4 h-4 mr-1" />
            Manter
          </Button>
          <Button
            size="sm"
            variant={item.status === 'remove' ? 'destructive' : 'outline'}
            onClick={() => updateItemStatus(item.id, 'remove')}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remover
          </Button>
          <Button
            size="sm"
            variant={item.status === 'merge' ? 'default' : 'outline'}
            onClick={() => updateItemStatus(item.id, 'merge')}
          >
            <GitMerge className="w-4 h-4 mr-1" />
            Mesclar
          </Button>
          <Button
            size="sm"
            variant={item.status === 'investigate' ? 'default' : 'outline'}
            onClick={() => updateItemStatus(item.id, 'investigate')}
          >
            <Eye className="w-4 h-4 mr-1" />
            Investigar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const getSummaryStats = () => {
    const allItems = Object.values(auditData).flat();
    const pending = allItems.filter(item => item.status === 'pending').length;
    const toRemove = allItems.filter(item => item.status === 'remove').length;
    const toKeep = allItems.filter(item => item.status === 'keep').length;
    const toMerge = allItems.filter(item => item.status === 'merge').length;
    const toInvestigate = allItems.filter(item => item.status === 'investigate').length;

    return { total: allItems.length, pending, toRemove, toKeep, toMerge, toInvestigate };
  };

  const stats = getSummaryStats();

  return (
    <SuperAdminOnly>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auditoria do Sistema</h1>
        <p className="text-muted-foreground">
          Análise completa de recursos não utilizados e problemas do sistema
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Esta página é acessível apenas para Super Administradores. 
          As ações executadas aqui podem afetar significativamente o sistema.
        </AlertDescription>
      </Alert>

      {/* Resumo Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total de Itens</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.toRemove}</div>
            <div className="text-sm text-muted-foreground">Para Remover</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.toKeep}</div>
            <div className="text-sm text-muted-foreground">Para Manter</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.toMerge}</div>
            <div className="text-sm text-muted-foreground">Para Mesclar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.toInvestigate}</div>
            <div className="text-sm text-muted-foreground">Investigar</div>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Execução */}
      <div className="flex justify-end">
        <Button 
          onClick={executeActions}
          disabled={stats.pending === stats.total}
          size="lg"
        >
          <Settings className="w-4 h-4 mr-2" />
          Executar Ações Selecionadas ({stats.total - stats.pending})
        </Button>
      </div>

      <Tabs defaultValue="tables" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Tabelas ({auditData.unusedTables.length})
          </TabsTrigger>
          <TabsTrigger value="functions" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Functions ({auditData.unusedFunctions.length})
          </TabsTrigger>
          <TabsTrigger value="hooks" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Hooks ({auditData.unusedHooks.length})
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Componentes ({auditData.unusedComponents.length})
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Segurança ({auditData.securityIssues.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tabelas Não Utilizadas ou Vazias</CardTitle>
              <CardDescription>
                Tabelas que nunca foram utilizadas ou estão vazias mas sendo consultadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {auditData.unusedTables.map(item => (
                  <AuditItemCard key={item.id} item={item} category="tables" />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edge Functions Não Utilizadas</CardTitle>
              <CardDescription>
                Functions configuradas no supabase/config.toml mas não implementadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {auditData.unusedFunctions.map(item => (
                  <AuditItemCard key={item.id} item={item} category="functions" />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hooks Não Utilizados</CardTitle>
              <CardDescription>
                Hooks customizados que não estão sendo utilizados ou são muito complexos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {auditData.unusedHooks.map(item => (
                  <AuditItemCard key={item.id} item={item} category="hooks" />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Componentes Complexos Não Utilizados</CardTitle>
              <CardDescription>
                Componentes ou árvores de componentes que não estão sendo utilizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {auditData.unusedComponents.map(item => (
                  <AuditItemCard key={item.id} item={item} category="components" />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Problemas de Segurança</CardTitle>
              <CardDescription>
                Problemas de segurança identificados pelo linter do Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {auditData.securityIssues.map(item => (
                  <AuditItemCard key={item.id} item={item} category="security" />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </SuperAdminOnly>
  );
}