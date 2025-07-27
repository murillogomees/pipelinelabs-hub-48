
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useProjectHistory } from '@/hooks/useProjectHistory';
import { 
  Brain, 
  TrendingUp, 
  History, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Zap,
  Target,
  BarChart3,
  Clock,
  Database,
  RefreshCw
} from 'lucide-react';

interface ContinuousLearningProps {
  currentPrompt?: string;
  onSuggestionApply?: (suggestion: any) => void;
  onPatternDetected?: (pattern: any) => void;
}

export const ContinuousLearning: React.FC<ContinuousLearningProps> = ({
  currentPrompt,
  onSuggestionApply,
  onPatternDetected
}) => {
  const {
    projectHistory,
    isLoadingHistory,
    indexLovableHistory,
    isIndexing,
    findSimilarEntries,
    analyzePatterns
  } = useProjectHistory();

  const [similarEntries, setSimilarEntries] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any>({});
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [indexingProgress, setIndexingProgress] = useState(0);

  useEffect(() => {
    if (currentPrompt) {
      analyzeCurrent();
    }
  }, [currentPrompt]);

  useEffect(() => {
    if (projectHistory && projectHistory.length > 0) {
      setPatterns(analyzePatterns());
    }
  }, [projectHistory, analyzePatterns]);

  const analyzeCurrent = async () => {
    if (!currentPrompt) return;

    // Buscar entradas similares
    const similar = await findSimilarEntries(currentPrompt);
    setSimilarEntries(similar);

    // Gerar sugestões baseadas no histórico
    const newSuggestions = generateSuggestions(similar, currentPrompt);
    setSuggestions(newSuggestions);

    // Detectar padrões
    const detectedPatterns = detectPatterns(similar, currentPrompt);
    if (detectedPatterns.length > 0 && onPatternDetected) {
      onPatternDetected(detectedPatterns);
    }
  };

  const generateSuggestions = (similar: any[], prompt: string) => {
    const suggestions: any[] = [];

    // Sugestões baseadas em soluções anteriores
    similar.forEach(entry => {
      if (entry.build_status === 'success') {
        suggestions.push({
          id: `reuse_${entry.id}`,
          type: 'reuse',
          title: 'Reutilizar Solução Anterior',
          description: `Esta solicitação é similar a "${entry.prompt.substring(0, 100)}..." que foi implementada com sucesso`,
          confidence: 0.8,
          data: {
            original_prompt: entry.prompt,
            files_modified: entry.files_modified,
            technical_decisions: entry.technical_decisions
          }
        });
      }
    });

    // Sugestões baseadas em erros comuns
    const commonErrors = Object.entries(patterns.mostCommonErrors || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);

    commonErrors.forEach(([error, count]) => {
      if (prompt.toLowerCase().includes(error.toLowerCase().substring(0, 20))) {
        suggestions.push({
          id: `error_prevention_${error}`,
          type: 'prevention',
          title: 'Prevenção de Erro Comum',
          description: `Este erro apareceu ${count} vezes anteriormente: "${error.substring(0, 100)}..."`,
          confidence: 0.9,
          data: { error, frequency: count }
        });
      }
    });

    // Sugestões baseadas em arquivos frequentes
    const frequentFiles = Object.entries(patterns.frequentFiles || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    frequentFiles.forEach(([file, count]) => {
      if (prompt.toLowerCase().includes(file.split('/').pop()?.toLowerCase() || '')) {
        suggestions.push({
          id: `frequent_file_${file}`,
          type: 'optimization',
          title: 'Arquivo Frequentemente Modificado',
          description: `O arquivo "${file}" foi modificado ${count} vezes. Considere refatoração.`,
          confidence: 0.7,
          data: { file, modifications: count }
        });
      }
    });

    return suggestions.slice(0, 10);
  };

  const detectPatterns = (similar: any[], prompt: string) => {
    const detectedPatterns: any[] = [];

    // Detectar padrão de repetição
    if (similar.length >= 3) {
      detectedPatterns.push({
        type: 'repetition',
        message: 'Padrão de repetição detectado',
        confidence: 0.8,
        data: similar
      });
    }

    // Detectar padrão de erro recorrente
    const errorPattern = similar.filter(entry => 
      entry.build_status === 'failed' && 
      entry.errors_fixed.length > 0
    );

    if (errorPattern.length >= 2) {
      detectedPatterns.push({
        type: 'error_pattern',
        message: 'Padrão de erro recorrente detectado',
        confidence: 0.9,
        data: errorPattern
      });
    }

    return detectedPatterns;
  };

  const handleIndexHistory = async () => {
    // Simular dados do histórico do Lovable
    const mockLovableHistory = {
      messages: [], // Seria preenchido com dados reais
      builds: [],
      errors: [],
      migrations: [],
      executions: [],
      file_changes: []
    };

    setIndexingProgress(0);
    const progressInterval = setInterval(() => {
      setIndexingProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      await indexLovableHistory(mockLovableHistory);
      setIndexingProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      setIndexingProgress(0);
    }
  };

  const applySuggestion = (suggestion: any) => {
    if (onSuggestionApply) {
      onSuggestionApply(suggestion);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'reuse':
        return <RefreshCw className="h-4 w-4" />;
      case 'prevention':
        return <AlertTriangle className="h-4 w-4" />;
      case 'optimization':
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'reuse':
        return 'bg-blue-100 text-blue-800';
      case 'prevention':
        return 'bg-red-100 text-red-800';
      case 'optimization':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Aprendizado Contínuo</h2>
        </div>
        <Button onClick={handleIndexHistory} disabled={isIndexing}>
          <Database className="h-4 w-4 mr-2" />
          {isIndexing ? 'Indexando...' : 'Indexar Histórico'}
        </Button>
      </div>

      {isIndexing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Indexando histórico do projeto</span>
                <span className="text-sm text-muted-foreground">{indexingProgress}%</span>
              </div>
              <Progress value={indexingProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
          <TabsTrigger value="similar">Similares</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Sugestões Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                      <div key={suggestion.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getSuggestionIcon(suggestion.type)}
                            <span className="font-medium">{suggestion.title}</span>
                          </div>
                          <Badge className={getSuggestionColor(suggestion.type)}>
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          Aplicar Sugestão
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma sugestão disponível</p>
                    <p className="text-xs">Digite um prompt para ver sugestões inteligentes</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="similar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Implementações Similares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {similarEntries.length > 0 ? (
                  <div className="space-y-3">
                    {similarEntries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="font-medium line-clamp-1">{entry.prompt}</span>
                          <Badge variant={entry.build_status === 'success' ? 'default' : 'destructive'}>
                            {entry.build_status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {entry.files_modified.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Arquivos: {entry.files_modified.slice(0, 3).join(', ')}
                            {entry.files_modified.length > 3 && '...'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma implementação similar encontrada</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Erros Mais Comuns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {Object.entries(patterns.mostCommonErrors || {})
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([error, count]) => (
                      <div key={error} className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm font-mono line-clamp-1">{error}</span>
                        <Badge variant="destructive">{count}</Badge>
                      </div>
                    ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Arquivos Mais Modificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {Object.entries(patterns.frequentFiles || {})
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([file, count]) => (
                      <div key={file} className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm font-mono line-clamp-1">{file}</span>
                        <Badge>{count}</Badge>
                      </div>
                    ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Total de Entradas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projectHistory?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Histórico completo indexado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Taxa de Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {projectHistory ? Math.round(
                    (projectHistory.filter(entry => entry.build_status === 'success').length / 
                     projectHistory.length) * 100
                  ) : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Builds bem-sucedidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Evolução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {patterns.successPatterns?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Padrões de sucesso identificados
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
