import React, { useState } from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Zap, Database, Settings, Trash2, Edit3, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { CodeFilesList } from '@/components/Admin/CodeAnalysis/CodeFilesList';
import { HooksAnalysis } from '@/components/Admin/CodeAnalysis/HooksAnalysis';
import { ComponentsAnalysis } from '@/components/Admin/CodeAnalysis/ComponentsAnalysis';
import { EdgeFunctionsAnalysis } from '@/components/Admin/CodeAnalysis/EdgeFunctionsAnalysis';
import { EnvironmentManager } from '@/components/Admin/CodeAnalysis/EnvironmentManager';
import { CodeUsageAnalyzer } from '@/components/Admin/CodeAnalysis/CodeUsageAnalyzer';
import { useCodeAnalysis } from '@/hooks/useCodeAnalysis';

export default function AdminCodeAnalysis() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { analysisData, isLoading, refreshAnalysis } = useCodeAnalysis();

  return (
    <AdminPageLayout
      title="Análise e Gerenciamento de Código"
      description="Visualize, analise e gerencie todos os arquivos do projeto"
      icon={<FileText className="h-8 w-8" />}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar arquivos, hooks, componentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshAnalysis} disabled={isLoading}>
              <Zap className="h-4 w-4 mr-2" />
              Analisar Projeto
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Arquivos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisData?.totalFiles || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{analysisData?.newFiles || 0} novos esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hooks Ativos</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisData?.activeHooks || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analysisData?.unusedHooks || 0} não utilizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Edge Functions</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisData?.edgeFunctions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analysisData?.activeEdgeFunctions || 0} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score de Limpeza</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisData?.cleanupScore || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {analysisData?.issuesFound || 0} problemas encontrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="hooks">Hooks</TabsTrigger>
            <TabsTrigger value="components">Componentes</TabsTrigger>
            <TabsTrigger value="pages">Páginas</TabsTrigger>
            <TabsTrigger value="edge-functions">Edge Functions</TabsTrigger>
            <TabsTrigger value="environment">Ambiente</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <CodeUsageAnalyzer searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="hooks" className="space-y-4">
            <HooksAnalysis searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <ComponentsAnalysis searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            <CodeFilesList 
              fileType="pages" 
              searchTerm={searchTerm}
              basePath="src/pages"
            />
          </TabsContent>

          <TabsContent value="edge-functions" className="space-y-4">
            <EdgeFunctionsAnalysis searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="environment" className="space-y-4">
            <EnvironmentManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}