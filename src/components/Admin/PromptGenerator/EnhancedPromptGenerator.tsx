
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Settings,
  Loader2
} from 'lucide-react';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';

interface EnhancedPromptGeneratorProps {
  onBackToSimple: () => void;
}

export const EnhancedPromptGenerator: React.FC<EnhancedPromptGeneratorProps> = ({ onBackToSimple }) => {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [prediction, setPrediction] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('generator');
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  
  const { 
    generateCode, 
    isGenerating,
    applyCode,
    isApplying 
  } = usePromptGenerator();

  const handlePromptChange = (value: string) => {
    setCurrentPrompt(value);
    // Auto-analyze on prompt change
    if (value.length > 10) {
      setPrediction({
        confidence: 0.85,
        expectedFiles: ['src/components/NewComponent.tsx', 'src/hooks/useNewHook.ts'],
        estimatedTime: 5000,
        reasoning: 'Baseado no seu prompt, vou criar um novo componente com hook personalizado'
      });
    }
  };

  const handleGenerate = async () => {
    if (!currentPrompt.trim()) return;

    const result = await generateCode(currentPrompt);
    if (result !== null) {
      setGeneratedCode(result);
      console.log('Código gerado com sucesso:', result);
    }
  };

  const getSuggestions = () => {
    return [
      'Criar componente',
      'Adicionar hook',
      'Implementar API',
      'Criar página',
      'Adicionar validação'
    ];
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
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Prévia
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
                <div className="space-y-2">
                  <Label htmlFor="prompt">Descreva o que você quer criar</Label>
                  <Textarea
                    id="prompt"
                    value={currentPrompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    placeholder="Ex: Criar um componente de lista de produtos com filtro e paginação"
                    className="min-h-[120px]"
                  />
                </div>
                
                {/* Intelligent Suggestions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sugestões Inteligentes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {getSuggestions().map((suggestion, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-primary/10"
                        onClick={() => setCurrentPrompt(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={!currentPrompt.trim() || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Gerando...
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

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prévia do Código Gerado</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedCode ? (
                <div className="space-y-4">
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      Código gerado com sucesso! Revise antes de aplicar.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(generatedCode, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => console.log('Aplicar código')}
                      disabled={isApplying}
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Aplicando...
                        </>
                      ) : (
                        'Aplicar Código'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum código gerado ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aprendizado Contínuo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidade de aprendizado em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configurações avançadas em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
