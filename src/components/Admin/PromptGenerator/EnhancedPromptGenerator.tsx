
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContinuousLearning } from './ContinuousLearning';
import { PromptEditor } from './PromptEditor';
import { CodePreview } from './CodePreview';
import { useIntelligentPrompting } from '@/hooks/useIntelligentPrompting';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  Shield,
  TrendingUp,
  Target,
  Clock
} from 'lucide-react';

interface EnhancedPromptGeneratorProps {
  onBackToSimple?: () => void;
}

export const EnhancedPromptGenerator: React.FC<EnhancedPromptGeneratorProps> = ({
  onBackToSimple
}) => {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState('input');
  const [showPreAnalysis, setShowPreAnalysis] = useState(false);

  const { analyzePrompt, saveExecutionContext, isAnalyzing } = useIntelligentPrompting();
  const { generateCode, isGenerating } = usePromptGenerator();

  // Analisar prompt automaticamente
  useEffect(() => {
    if (currentPrompt && currentPrompt.length > 10) {
      const timeoutId = setTimeout(() => {
        handleAnalyzePrompt();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentPrompt]);

  const handleAnalyzePrompt = async () => {
    if (!currentPrompt.trim()) return;
    
    try {
      const result = await analyzePrompt(currentPrompt);
      setAnalysisResult(result);
      setShowPreAnalysis(true);
    } catch (error) {
      console.error('Erro na análise:', error);
    }
  };

  const handleGenerateCode = async (params: {
    prompt: string;
    temperature: number;
    model: string;
  }) => {
    setCurrentPrompt(params.prompt);
    
    // Se não há análise prévia, fazer análise primeiro
    if (!analysisResult) {
      await handleAnalyzePrompt();
    }
    
    // Verificar se deve prosseguir
    if (analysisResult && !analysisResult.shouldProceed) {
      // Mostrar opções para o usuário
      setSelectedTab('analysis');
      return;
    }
    
    // Gerar código
    generateCode(params, {
      onSuccess: async (data) => {
        setGeneratedCode(data);
        setSelectedTab('preview');
        
        // Salvar contexto da execução
        await saveExecutionContext(
          params.prompt,
          data,
          Object.keys(data.files || {}),
          []
        );
      },
      onError: (error) => {
        console.error('Erro na geração:', error);
      }
    });
  };

  const handleSuggestionApply = (suggestion: any) => {
    if (suggestion.type === 'reuse') {
      setCurrentPrompt(suggestion.data.original_prompt);
    } else if (suggestion.type === 'prevention') {
      // Adicionar aviso sobre erro comum
      setCurrentPrompt(prev => `${prev}\n\n⚠️ Atenção: ${suggestion.data.error}`);
    }
  };

  const handlePatternDetected = (patterns: any[]) => {
    // Atualizar análise com padrões detectados
    setAnalysisResult(prev => ({
      ...prev,
      detectedPatterns: patterns
    }));
  };

  const handleForceGenerate = async () => {
    if (!currentPrompt.trim()) return;
    
    await handleGenerateCode({
      prompt: currentPrompt,
      temperature: 0.7,
      model: 'gpt-4o-mini'
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gerador Inteligente com IA</h1>
            <p className="text-muted-foreground">
              Aprendizado contínuo e análise preditiva
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onBackToSimple && (
            <Button variant="outline" onClick={onBackToSimple}>
              Modo Simples
            </Button>
          )}
          <Badge variant="secondary">Modo Avançado</Badge>
        </div>
      </div>

      {/* Análise Prévia */}
      {showPreAnalysis && analysisResult && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Análise Preditiva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Risco:</span>
                <Badge className={getRiskColor(analysisResult.riskLevel)}>
                  {analysisResult.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Confiança:</span>
                <span className={`font-bold ${getConfidenceColor(analysisResult.confidence)}`}>
                  {Math.round(analysisResult.confidence * 100)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              {analysisResult.shouldProceed ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {analysisResult.shouldProceed ? 'Aprovado para execução' : 'Atenção necessária'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysisResult.reason}
                </p>
              </div>
            </div>

            {analysisResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <span className="font-medium">Sugestões:</span>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysisResult.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-muted-foreground">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {!analysisResult.shouldProceed && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPreAnalysis(false)}
                >
                  Revisar Prompt
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleForceGenerate}
                  disabled={isGenerating}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Gerar Mesmo Assim
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs principais */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="input">Entrada</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="preview">Resultado</TabsTrigger>
          <TabsTrigger value="learning">Aprendizado</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Prompt Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PromptEditor 
                onGenerate={handleGenerateCode}
                isGenerating={isGenerating || isAnalyzing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {analysisResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Análise Detalhada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {analysisResult.riskLevel.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">Nível de Risco</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {Math.round(analysisResult.confidence * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Confiança</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {analysisResult.alternatives.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Alternativas</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Recomendações:</h4>
                  {analysisResult.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Digite um prompt para ver a análise preditiva
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultado Gerado</CardTitle>
            </CardHeader>
            <CardContent>
              <CodePreview 
                generatedCode={generatedCode}
                isApplying={false}
                onApply={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <ContinuousLearning
            currentPrompt={currentPrompt}
            onSuggestionApply={handleSuggestionApply}
            onPatternDetected={handlePatternDetected}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
