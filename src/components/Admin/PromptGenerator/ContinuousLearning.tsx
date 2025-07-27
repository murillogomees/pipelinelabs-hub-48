
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectHistory } from '@/hooks/useProjectHistory';
import { useLearningSystem } from '@/hooks/useLearningSystem';
import { 
  Brain, 
  TrendingUp, 
  FileText, 
  GitBranch, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Target,
  Zap,
  BarChart3,
  History,
  Lightbulb,
  Settings,
  Database
} from 'lucide-react';

interface ContinuousLearningProps {
  currentPrompt: string;
  onSuggestionApply: (suggestion: any) => void;
  onPatternDetected: (patterns: any[]) => void;
}

export const ContinuousLearning: React.FC<ContinuousLearningProps> = ({
  currentPrompt,
  onSuggestionApply,
  onPatternDetected
}) => {
  const [activeTab, setActiveTab] = useState('insights');
  const [feedback, setFeedback] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    projectHistory,
    isLoadingHistory,
    findSimilarEntries,
    analyzePatterns,
    saveHistoryEntry,
    indexLovableHistory
  } = useProjectHistory();

  const {
    learningContext,
    analyzeContext,
    isAnalyzing,
    findSimilarSolutions,
    searchKnowledgeBase,
    updateKnowledgeBase,
    provideFeedback
  } = useLearningSystem();

  const [insights, setInsights] = useState<any>(null);
  const [similarEntries, setSimilarEntries] = useState<any[]>([]);

  // Analisar contexto quando prompt mudar
  useEffect(() => {
    if (currentPrompt && currentPrompt.length > 10) {
      analyzeContext(currentPrompt);
      findSimilarEntries(currentPrompt, 5).then(setSimilarEntries);
    }
  }, [currentPrompt, analyzeContext, findSimilarEntries]);

  // Gerar insights do histórico
  useEffect(() => {
    if (projectHistory?.length) {
      const patterns = analyzePatterns();
      setInsights(patterns);
      
      // Detectar padrões para o prompt atual
      if (currentPrompt) {
        const detectedPatterns = detectCurrentPatterns(currentPrompt, patterns);
        onPatternDetected(detectedPatterns);
      }
    }
  }, [projectHistory, analyzePatterns, currentPrompt, onPatternDetected]);

  const detectCurrentPatterns = (prompt: string, patterns: any) => {
    const detected: any[] = [];
    const promptLower = prompt.toLowerCase();
    
    // Detectar padrões baseados em erros comuns
    Object.entries(patterns.mostCommonErrors || {}).forEach(([error, count]) => {
      if (promptLower.includes(error.toLowerCase()) && (count as number) > 2) {
        detected.push({
          type: 'error_pattern',
          description: `Erro comum detectado: ${error}`,
          frequency: count,
          recommendation: 'Verificar implementações anteriores que corrigiram este erro'
        });
      }
    });
    
    // Detectar padrões de arquivos frequentes
    Object.entries(patterns.frequentFiles || {}).forEach(([file, count]) => {
      if (promptLower.includes(file.toLowerCase()) && (count as number) > 3) {
        detected.push({
          type: 'file_pattern',
          description: `Arquivo frequentemente modificado: ${file}`,
          frequency: count,
          recommendation: 'Considerar refatoração para reduzir modificações frequentes'
        });
      }
    });
    
    return detected;
  };

  const handleApplySuggestion = (suggestion: any) => {
    onSuggestionApply(suggestion);
    
    // Salvar feedback positivo
    if (suggestion.id) {
      provideFeedback({
        sessionId: suggestion.id,
        feedback: 'positive'
      });
    }
  };

  const handleProvideFeedback = async () => {
    if (!selectedEntry || !feedback.trim()) return;
    
    try {
      await provideFeedback({
        sessionId: selectedEntry.id,
        feedback: feedback.includes('positiv') ? 'positive' : 'negative'
      });
      
      setFeedback('');
      setSelectedEntry(null);
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
    }
  };

  const handleIndexHistory = () => {
    // Simular dados do histórico do Lovable
    const mockHistory = {
      messages: [],
      builds: [],
      errors: [],
      migrations: [],
      executions: [],
      file_changes: []
    };
    
    indexLovableHistory(mockHistory);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const filteredHistory = projectHistory?.filter(entry =>
    entry.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (isLoadingHistory) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Aprendizado Contínuo</h2>
            <p className="text-muted-foreground">
              Sistema inteligente baseado no histórico do projeto
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleIndexHistory} disabled={isAnalyzing}>
            <Database className="h-4 w-4 mr-2" />
            Indexar Histórico
          </Button>
        </div>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="similar">Similares</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Insights Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {learningContext.suggestions.length > 0 ? (
                <div className="space-y-3">
                  {learningContext.suggestions.map((suggestion: string, index: number) => (
                    <Alert key={index}>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>{suggestion}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Digite um prompt para ver insights inteligentes
                </p>
              )}
            </CardContent>
          </Card>

          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Erros Mais Comuns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(insights.mostCommonErrors || {})
                      .slice(0, 5)
                      .map(([error, count]) => (
                        <div key={error} className="flex justify-between items-center">
                          <span className="text-sm truncate">{error}</span>
                          <Badge variant="secondary">{String(count)}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Arquivos Frequentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(insights.frequentFiles || {})
                      .slice(0, 5)
                      .map(([file, count]) => (
                        <div key={file} className="flex justify-between items-center">
                          <span className="text-sm truncate">{file}</span>
                          <Badge variant="secondary">{String(count)}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="similar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Implementações Similares
              </CardTitle>
            </CardHeader>
            <CardContent>
              {similarEntries.length > 0 ? (
                <div className="space-y-3">
                  {similarEntries.map((entry) => (
                    <div key={entry.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium truncate">{entry.prompt}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskColor(entry.impact_level)}>
                            {entry.impact_level}
                          </Badge>
                          <span className={`text-sm ${getStatusColor(entry.build_status)}`}>
                            {entry.build_status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                          {entry.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleApplySuggestion(entry)}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma implementação similar encontrada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Padrões Detectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights?.successPatterns?.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Padrões de Sucesso ({insights.successPatterns.length})
                    </h4>
                    <div className="space-y-2">
                      {insights.successPatterns.slice(0, 3).map((pattern: any, index: number) => (
                        <div key={index} className="p-2 bg-green-50 rounded">
                          <p className="text-sm">{pattern.prompt}</p>
                          <div className="flex gap-1 mt-1">
                            {pattern.files.slice(0, 2).map((file: string) => (
                              <Badge key={file} variant="outline" className="text-xs">
                                {file}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      Padrões de Falha ({insights.failurePatterns?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {insights.failurePatterns?.slice(0, 3).map((pattern: any, index: number) => (
                        <div key={index} className="p-2 bg-red-50 rounded">
                          <p className="text-sm">{pattern.prompt}</p>
                          <div className="flex gap-1 mt-1">
                            {pattern.errors?.slice(0, 2).map((error: string) => (
                              <Badge key={error} variant="destructive" className="text-xs">
                                {error}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Nenhum padrão detectado ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Buscar no histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredHistory.map((entry) => (
                    <div key={entry.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium truncate">{entry.prompt}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskColor(entry.impact_level)}>
                            {entry.impact_level}
                          </Badge>
                          <span className={`text-sm ${getStatusColor(entry.build_status)}`}>
                            {entry.build_status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                          {entry.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Feedback
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Feedback */}
      {selectedEntry && (
        <Card className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CardContent className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="font-semibold mb-4">Feedback para: {selectedEntry.prompt}</h3>
            <Textarea
              placeholder="Deixe seu feedback sobre esta implementação..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={handleProvideFeedback} disabled={!feedback.trim()}>
                Enviar Feedback
              </Button>
              <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
