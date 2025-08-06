import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, Trash2, Edit3, Eye } from 'lucide-react';
import { useCodeAnalysis } from '@/hooks/useCodeAnalysis';

interface CodeUsageAnalyzerProps {
  searchTerm: string;
}

export function CodeUsageAnalyzer({ searchTerm }: CodeUsageAnalyzerProps) {
  const { analysisData, cleanupUnusedFiles } = useCodeAnalysis();

  const getIssueIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredIssues = analysisData?.hooks?.filter(hook => 
    hook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hook.path.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const unusedFiles = filteredIssues.filter(item => !item.isUsed);

  return (
    <div className="space-y-6">
      {/* Análise Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Arquivos Órfãos</CardTitle>
            <CardDescription>Arquivos não utilizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unusedFiles.length}</div>
            <Progress value={(unusedFiles.length / filteredIssues.length) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {((unusedFiles.length / filteredIssues.length) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Complexidade Média</CardTitle>
            <CardDescription>Complexidade ciclomática</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(filteredIssues.reduce((acc, item) => acc + item.complexity, 0) / filteredIssues.length || 0).toFixed(1)}
            </div>
            <Progress value={65} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Complexidade aceitável
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Problemas Críticos</CardTitle>
            <CardDescription>Issues de alta prioridade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {filteredIssues.reduce((acc, item) => 
                acc + item.issues.filter(issue => issue.severity === 'high').length, 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Requer atenção imediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Limpeza</CardTitle>
          <CardDescription>
            Remova arquivos não utilizados e otimize o projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => cleanupUnusedFiles(unusedFiles.map(f => f.path))}
              disabled={unusedFiles.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover {unusedFiles.length} arquivos órfãos
            </Button>
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Corrigir imports quebrados
            </Button>
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Otimizar dependências
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada de Arquivos</CardTitle>
          <CardDescription>
            Status de uso e problemas encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIssues.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {item.isUsed ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <Badge variant={item.isUsed ? "default" : "destructive"}>
                      {item.isUsed ? `${item.usageCount} usos` : 'Não usado'}
                    </Badge>
                    {item.complexity > 5 && (
                      <Badge variant="secondary">
                        Complexidade: {item.complexity}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {!item.isUsed && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => cleanupUnusedFiles([item.path])}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>{item.path}</p>
                  <p>Tamanho: {(item.size / 1024).toFixed(1)}KB • Modificado: {item.lastModified}</p>
                </div>

                {item.usedBy.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Usado por:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.usedBy.map((file, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {item.issues.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Problemas encontrados:</p>
                    <div className="space-y-1">
                      {item.issues.map((issue, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          {getIssueIcon(issue.severity)}
                          <span>{issue.message}</span>
                          {issue.line && (
                            <Badge variant="outline" className="text-xs">
                              Linha {issue.line}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 text-xs text-muted-foreground">
                  <span>Exports: {item.exports.join(', ')}</span>
                  <span>Imports: {item.imports.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}