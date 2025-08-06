import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Blocks, Eye, Edit3, Trash2, GitBranch, FileText } from 'lucide-react';
import { useCodeAnalysis } from '@/hooks/useCodeAnalysis';

interface ComponentsAnalysisProps {
  searchTerm: string;
}

export function ComponentsAnalysis({ searchTerm }: ComponentsAnalysisProps) {
  const { analysisData, cleanupUnusedFiles } = useCodeAnalysis();

  // Mock data para componentes - em produção viria da análise real
  const components = [
    {
      name: 'CustomersList',
      path: 'src/components/Customers/CustomersList.tsx',
      size: 4096,
      lastModified: '2024-01-15',
      isUsed: true,
      usageCount: 8,
      usedBy: ['CustomersPage.tsx', 'Dashboard.tsx'],
      exports: ['CustomersList'],
      imports: ['React', 'useCustomers', 'Card'],
      issues: [],
      complexity: 4,
      type: 'component'
    },
    {
      name: 'OldButton',
      path: 'src/components/ui/OldButton.tsx',
      size: 1024,
      lastModified: '2023-10-01',
      isUsed: false,
      usageCount: 0,
      usedBy: [],
      exports: ['OldButton'],
      imports: ['React', 'clsx'],
      issues: [
        {
          type: 'warning' as const,
          message: 'Componente não utilizado - substituído por Button do shadcn',
          severity: 'medium' as const
        }
      ],
      complexity: 2,
      type: 'component'
    }
  ];

  const filteredComponents = components.filter(comp => 
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeComponents = filteredComponents.filter(c => c.isUsed);
  const unusedComponents = filteredComponents.filter(c => !c.isUsed);
  const complexComponents = filteredComponents.filter(c => c.complexity > 5);

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Componentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredComponents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Componentes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeComponents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Não Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unusedComponents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alta Complexidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{complexComponents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Componentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Blocks className="h-5 w-5" />
            Componentes do Projeto
          </CardTitle>
          <CardDescription>
            Gerencie todos os componentes React do projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredComponents.map((component, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Blocks className="h-4 w-4 text-primary" />
                    <span className="font-medium">{component.name}</span>
                    <div className="flex gap-1">
                      <Badge variant={component.isUsed ? "default" : "destructive"}>
                        {component.isUsed ? `${component.usageCount} usos` : 'Não usado'}
                      </Badge>
                      {component.complexity > 5 && (
                      <Badge variant="secondary">
                        Complexidade: {component.complexity}
                      </Badge>
                      )}
                      {component.issues.length > 0 && (
                        <Badge variant="destructive">
                          {component.issues.length} problemas
                        </Badge>
                      )}
                      <Badge variant="outline">{component.type}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {!component.isUsed && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => cleanupUnusedFiles([component.path])}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>{component.path}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span>Tamanho: {(component.size / 1024).toFixed(1)}KB</span>
                    <span>Modificado: {component.lastModified}</span>
                    <span>Complexidade: {component.complexity}/10</span>
                  </div>
                </div>

                {component.usedBy.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Usado por:</p>
                    <div className="flex flex-wrap gap-1">
                      {component.usedBy.map((file, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {component.issues.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1 text-destructive">Problemas:</p>
                    <div className="space-y-1">
                      {component.issues.map((issue, idx) => (
                        <div key={idx} className="text-sm p-2 bg-destructive/10 rounded">
                          <Badge variant="destructive" className="mr-2 text-xs">
                            {issue.severity}
                          </Badge>
                          {issue.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 text-xs text-muted-foreground">
                  <span>Exports: {component.exports.join(', ')}</span>
                  <span>Imports: {component.imports.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}