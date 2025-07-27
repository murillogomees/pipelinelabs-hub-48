
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Code, 
  Zap, 
  ArrowLeft,
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  FileText,
  Settings
} from 'lucide-react';
import { useProjectHistory } from '@/hooks/useProjectHistory';
import { useIntelligentPrompting } from '@/hooks/useIntelligentPrompting';
import { ContinuousLearning } from './ContinuousLearning';

interface EnhancedPromptGeneratorProps {
  onBackToSimple: () => void;
}

export const EnhancedPromptGenerator: React.FC<EnhancedPromptGeneratorProps> = ({ onBackToSimple }) => {
  const { history, addHistoryEntry } = useProjectHistory();
  const { analyzePrompt, getIntelligentSuggestions, isAnalyzing } = useIntelligentPrompting();
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [prediction, setPrediction] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('generator');

  const handlePromptChange = (value: string) => {
    setCurrentPrompt(value);
    // Auto-analyze on prompt change
    if (value.length > 10) {
      analyzePrompt(value).then(setPrediction);
    }
  };

  const handleGenerate = async () => {
    if (!currentPrompt.trim()) return;

    // Add to history
    await addHistoryEntry({
      user_id: 'current-user',
      action_type: 'enhanced_generation',
      prompt: currentPrompt,
      generated_code: 'Generated code would be here',
      files_modified: prediction?.expectedFiles || [],
      execution_time: prediction?.estimatedTime || 5000,
      success: true,
      context_data: { prediction, enhanced: true }
    });

    // Mock generation
    console.log('Generating enhanced code for:', currentPrompt);
  };

  const getSuggestions = () => {
    return getIntelligentSuggestions(currentPrompt);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBackToSimple}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Gerador Inteligente</h1>
              <p className="text-sm text-muted-foreground">
                Com análise preditiva e aprendizado contínuo
              </p>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Modo Avançado
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Gerador
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Aprendizado
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt Inteligente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={currentPrompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  placeholder="Descreva o que você quer criar..."
                  className="w-full h-32 p-3 border rounded-lg resize-none"
                />
                
                {/* Intelligent Suggestions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sugestões Inteligentes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {getSuggestions().map((suggestion, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={!currentPrompt.trim() || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Gerar Código
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Prediction Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Preditiva</CardTitle>
              </CardHeader>
              <CardContent>
                {prediction ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Confiança:</span>
                      <Progress value={prediction.confidence * 100} className="flex-1" />
                      <Badge variant="outline">
                        {(prediction.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Arquivos Esperados:</h4>
                      <div className="space-y-1">
                        {prediction.expectedFiles.map((file: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <FileText className="h-3 w-3" />
                            {file}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Tempo estimado: {(prediction.estimatedTime / 1000).toFixed(1)}s</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Raciocínio:</h4>
                      <p className="text-sm text-muted-foreground">
                        {prediction.reasoning}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Digite um prompt para ver a análise preditiva</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Padrões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Análise detalhada de padrões será exibida aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning">
          <ContinuousLearning />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configurações avançadas serão implementadas aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
