import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Eye, Edit3, Trash2, Activity, Clock, AlertTriangle } from 'lucide-react';
import { useCodeAnalysis } from '@/hooks/useCodeAnalysis';

interface EdgeFunctionsAnalysisProps {
  searchTerm: string;
}

export function EdgeFunctionsAnalysis({ searchTerm }: EdgeFunctionsAnalysisProps) {
  const { analysisData } = useCodeAnalysis();

  // Mock data para edge functions - em produção viria da análise real
  const edgeFunctions = [
    {
      name: 'nfe-io-integration',
      path: 'supabase/functions/nfe-io-integration',
      isActive: true,
      lastDeployed: '2024-01-15T10:30:00Z',
      errorCount: 2,
      invocations: 1234,
      averageResponseTime: 250,
      dependencies: ['supabase-js', 'crypto'],
      secrets: ['NFE_API_TOKEN', 'WEBHOOK_SECRET']
    },
    {
      name: 'code-analyzer',
      path: 'supabase/functions/code-analyzer',
      isActive: false,
      lastDeployed: '2024-01-10T08:15:00Z',
      errorCount: 0,
      invocations: 45,
      averageResponseTime: 1200,
      dependencies: ['typescript', 'ast-parser'],
      secrets: []
    },
    {
      name: 'backup-manager',
      path: 'supabase/functions/backup-manager',
      isActive: true,
      lastDeployed: '2024-01-14T22:00:00Z',
      errorCount: 0,
      invocations: 15,
      averageResponseTime: 5000,
      dependencies: ['pg-dump', 'aws-sdk'],
      secrets: ['AWS_ACCESS_KEY', 'AWS_SECRET_KEY']
    }
  ];

  const filteredFunctions = edgeFunctions.filter(func => 
    func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeFunctions = filteredFunctions.filter(f => f.isActive);
  const inactiveFunctions = filteredFunctions.filter(f => !f.isActive);
  const functionsWithErrors = filteredFunctions.filter(f => f.errorCount > 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (isActive: boolean, errorCount: number) => {
    if (!isActive) return 'secondary';
    if (errorCount > 0) return 'destructive';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredFunctions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeFunctions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{inactiveFunctions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Com Erros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{functionsWithErrors.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Edge Functions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Edge Functions
          </CardTitle>
          <CardDescription>
            Gerencie e monitore todas as Edge Functions do projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFunctions.map((func, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="font-medium">{func.name}</span>
                    <div className="flex gap-1">
                      <Badge variant={getStatusColor(func.isActive, func.errorCount)}>
                        {func.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                      {func.errorCount > 0 && (
                        <Badge variant="destructive">
                          {func.errorCount} erros
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {func.invocations} invocações
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>{func.path}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span>Último deploy: {formatDate(func.lastDeployed)}</span>
                    <span>Tempo médio: {func.averageResponseTime}ms</span>
                  </div>
                </div>

                {/* Métricas de Performance */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded">
                  <div className="text-center">
                    <div className="text-lg font-bold">{func.invocations}</div>
                    <div className="text-xs text-muted-foreground">Invocações</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{func.averageResponseTime}ms</div>
                    <div className="text-xs text-muted-foreground">Tempo Médio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-destructive">{func.errorCount}</div>
                    <div className="text-xs text-muted-foreground">Erros</div>
                  </div>
                </div>

                {/* Dependências */}
                {func.dependencies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Dependências:</p>
                    <div className="flex flex-wrap gap-1">
                      {func.dependencies.map((dep, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secrets */}
                {func.secrets.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Secrets configurados:</p>
                    <div className="flex flex-wrap gap-1">
                      {func.secrets.map((secret, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {secret}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Warnings */}
                {func.errorCount > 0 && (
                  <div className="flex items-center space-x-2 p-2 bg-destructive/10 rounded">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">
                      Esta função apresentou {func.errorCount} erro(s) recentemente
                    </span>
                  </div>
                )}

                {!func.isActive && (
                  <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Função inativa - último deploy em {formatDate(func.lastDeployed)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}