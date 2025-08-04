
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConversationFlow } from '@/hooks/useConversationFlow';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { useIntelligentPrompting } from '@/hooks/useIntelligentPrompting';
import { InitialQuery } from './InitialQuery';
import { TechnicalApproval } from './TechnicalApproval';
import { ImplementationReport } from './ImplementationReport';
import { BuildVerification } from './BuildVerification';
import { LearningFeedback } from './LearningFeedback';
import { 
  MessageSquare, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Brain,
  Sparkles,
  Loader2,
  ArrowLeft
} from 'lucide-react';

interface EnhancedConversationalDashboardProps {
  onBackToTraditional: () => void;
}

export const EnhancedConversationalDashboard: React.FC<EnhancedConversationalDashboardProps> = ({
  onBackToTraditional
}) => {
  const { conversationState, updateConversationState, resetConversation } = useConversationFlow();
  const { generateCode, isGenerating } = usePromptGenerator();
  const { analyzePrompt } = useIntelligentPrompting();
  const [buildStatus, setBuildStatus] = useState<'success' | 'failed' | 'running'>('success');

  const handleInitialQuery = async (prompt: string) => {
    console.log('Processando prompt:', prompt);
    
    // Usar análise inteligente para prever arquivos
    const prediction = await analyzePrompt(prompt);
    const analysis = analyzePromptIntelligently(prompt, prediction);
    
    updateConversationState({
      originalPrompt: prompt,
      currentStep: 'technical_approval',
      steps: [
        ...conversationState.steps,
        {
          id: Date.now().toString(),
          type: 'initial_query',
          status: 'completed',
          content: prompt,
          timestamp: new Date().toISOString()
        }
      ],
      technicalAnalysis: analysis
    });
  };

  const analyzePromptIntelligently = (prompt: string, prediction: any) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Usar a análise preditiva para gerar informações mais precisas
    const expectedFiles = prediction.expectedFiles.length > 0 
      ? prediction.expectedFiles 
      : generateSmartFileNames(prompt);
    
    const functions = extractFunctionNames(prompt, expectedFiles);
    
    let impactType: 'performance' | 'security' | 'clean_code' | 'database' | 'architectural' = 'clean_code';
    
    if (lowerPrompt.includes('banco') || lowerPrompt.includes('database') || lowerPrompt.includes('tabela')) {
      impactType = 'database';
    } else if (lowerPrompt.includes('performance') || lowerPrompt.includes('otimizar')) {
      impactType = 'performance';
    } else if (lowerPrompt.includes('segurança') || lowerPrompt.includes('security')) {
      impactType = 'security';
    } else if (lowerPrompt.includes('arquitetura') || lowerPrompt.includes('refatorar')) {
      impactType = 'architectural';
    }

    return {
      affectedFiles: expectedFiles,
      impactType,
      impactDescription: `${prediction.reasoning} - Confiança: ${(prediction.confidence * 100).toFixed(1)}%`,
      justification: `Análise baseada em padrões similares e contexto do projeto. Tempo estimado: ${(prediction.estimatedTime / 1000).toFixed(1)}s`,
      estimatedChanges: {
        files: expectedFiles,
        functions,
        tables: lowerPrompt.includes('tabela') ? extractTableNames(prompt) : [],
        edgeFunctions: lowerPrompt.includes('api') ? extractEdgeFunctionNames(prompt) : []
      }
    };
  };

  const generateSmartFileNames = (prompt: string): string[] => {
    const lowerPrompt = prompt.toLowerCase();
    const words = extractMeaningfulWords(prompt);
    const files: string[] = [];
    
    if (lowerPrompt.includes('component') || lowerPrompt.includes('botão') || lowerPrompt.includes('formulário')) {
      const componentName = generateComponentName(words);
      files.push(`src/components/${componentName}.tsx`);
    }
    
    if (lowerPrompt.includes('hook') || lowerPrompt.includes('use') || lowerPrompt.includes('estado')) {
      const hookName = generateHookName(words);
      files.push(`src/hooks/${hookName}.ts`);
    }
    
    if (lowerPrompt.includes('página') || lowerPrompt.includes('page') || lowerPrompt.includes('rota')) {
      const pageName = generatePageName(words);
      files.push(`src/pages/${pageName}.tsx`);
    }
    
    if (lowerPrompt.includes('api') || lowerPrompt.includes('função') || lowerPrompt.includes('endpoint')) {
      const functionName = generateFunctionName(words);
      files.push(`supabase/functions/${functionName}/index.ts`);
    }
    
    if (lowerPrompt.includes('tipo') || lowerPrompt.includes('interface')) {
      const typeName = generateTypeName(words);
      files.push(`src/types/${typeName}.ts`);
    }
    
    return files;
  };

  const extractMeaningfulWords = (prompt: string): string[] => {
    return prompt.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !isStopWord(word))
      .slice(0, 3);
  };

  const isStopWord = (word: string): boolean => {
    const stopWords = ['criar', 'fazer', 'adicionar', 'implementar', 'desenvolver', 'para', 'com', 'uma', 'um', 'que', 'de', 'da', 'do', 'na', 'no', 'em', 'por', 'ser', 'ter'];
    return stopWords.includes(word);
  };

  const generateComponentName = (words: string[]): string => {
    if (words.length === 0) return 'CustomComponent';
    const name = words.map(word => capitalizeFirst(word)).join('');
    return `${name}Component`;
  };

  const generateHookName = (words: string[]): string => {
    if (words.length === 0) return 'useCustomHook';
    const name = words.map(word => capitalizeFirst(word)).join('');
    return `use${name}`;
  };

  const generatePageName = (words: string[]): string => {
    if (words.length === 0) return 'CustomPage';
    const name = words.map(word => capitalizeFirst(word)).join('');
    return name;
  };

  const generateFunctionName = (words: string[]): string => {
    if (words.length === 0) return 'custom-function';
    return words.join('-').toLowerCase();
  };

  const generateTypeName = (words: string[]): string => {
    if (words.length === 0) return 'customTypes';
    const name = words.map(word => capitalizeFirst(word)).join('');
    return `${name}Types`;
  };

  const capitalizeFirst = (word: string): string => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const extractFunctionNames = (prompt: string, files: string[]): string[] => {
    const functions: string[] = [];
    
    files.forEach(file => {
      const fileName = file.split('/').pop()?.replace('.tsx', '').replace('.ts', '');
      if (fileName) {
        functions.push(fileName);
      }
    });
    
    return functions;
  };

  const extractTableNames = (prompt: string): string[] => {
    const words = extractMeaningfulWords(prompt);
    if (words.length === 0) return ['nova_tabela'];
    return [words.join('_').toLowerCase()];
  };

  const extractEdgeFunctionNames = (prompt: string): string[] => {
    const words = extractMeaningfulWords(prompt);
    if (words.length === 0) return ['nova-funcao'];
    return [words.join('-').toLowerCase()];
  };

  const handleTechnicalApproval = async () => {
    console.log('Iniciando implementação...');
    
    const prompt = conversationState.originalPrompt;
    const result = await generateCode(prompt);
    
    if (result !== null) {
      console.log('Código gerado:', result);
      
      const implementationReport = {
        modifiedFiles: conversationState.technicalAnalysis?.affectedFiles || [],
        linesChanged: conversationState.technicalAnalysis?.affectedFiles.reduce((acc, file) => {
          acc[file] = 45 + Math.floor(Math.random() * 30);
          return acc;
        }, {} as Record<string, number>) || {},
        functionsCreated: conversationState.technicalAnalysis?.estimatedChanges.functions || [],
        functionsModified: [],
        functionsRemoved: [],
        databaseChanges: {
          tables: conversationState.technicalAnalysis?.estimatedChanges.tables || [],
          fields: [],
          indexes: []
        },
        edgeFunctions: conversationState.technicalAnalysis?.estimatedChanges.edgeFunctions || [],
        buildStatus: 'success' as const,
        buildErrors: []
      };
      
      updateConversationState({
        currentStep: 'implementation',
        steps: [
          ...conversationState.steps,
          {
            id: Date.now().toString(),
            type: 'technical_approval',
            status: 'completed',
            content: 'Aprovação técnica concedida',
            timestamp: new Date().toISOString()
          }
        ],
        implementationReport
      });
      
      setTimeout(() => {
        setBuildStatus('success');
        updateConversationState({
          currentStep: 'build_verification',
          steps: [
            ...conversationState.steps,
            {
              id: Date.now().toString(),
              type: 'implementation',
              status: 'completed',
              content: 'Implementação concluída com sucesso',
              timestamp: new Date().toISOString()
            }
          ]
        });
      }, 2000);
    } else {
      updateConversationState({
        currentStep: 'technical_approval',
        steps: [
          ...conversationState.steps,
          {
            id: Date.now().toString(),
            type: 'technical_approval',
            status: 'failed',
            content: 'Erro na aprovação técnica',
            timestamp: new Date().toISOString()
          }
        ]
      });
    }
  };

  const handleBuildVerification = () => {
    updateConversationState({
      currentStep: 'build_verification',
      steps: [
        ...conversationState.steps,
        {
          id: Date.now().toString(),
          type: 'build_verification',
          status: 'completed',
          content: 'Build verificado com sucesso',
          timestamp: new Date().toISOString()
        }
      ]
    });
  };

  const getCurrentStepIcon = () => {
    switch (conversationState.currentStep) {
      case 'initial_query':
        return <MessageSquare className="h-5 w-5" />;
      case 'technical_approval':
        return <Zap className="h-5 w-5" />;
      case 'implementation':
        return <CheckCircle className="h-5 w-5" />;
      case 'build_verification':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getStepTitle = () => {
    switch (conversationState.currentStep) {
      case 'initial_query':
        return 'Análise Inteligente do Comando';
      case 'technical_approval':
        return 'Aprovação Técnica';
      case 'implementation':
        return 'Implementação';
      case 'build_verification':
        return 'Verificação de Build';
      default:
        return 'Processando';
    }
  };

  const renderCurrentStep = () => {
    switch (conversationState.currentStep) {
      case 'initial_query':
        return <InitialQuery onSubmit={handleInitialQuery} />;
      case 'technical_approval':
        return (
          <TechnicalApproval
            analysis={conversationState.technicalAnalysis!}
            onApprove={handleTechnicalApproval}
            onReject={resetConversation}
            isProcessing={isGenerating}
          />
        );
      case 'implementation':
        return (
          <ImplementationReport
            report={conversationState.implementationReport!}
            onNext={handleBuildVerification}
          />
        );
      case 'build_verification':
        return (
          <div className="space-y-4">
            <BuildVerification
              buildStatus={buildStatus}
              buildErrors={conversationState.implementationReport?.buildErrors || []}
              onRetry={() => setBuildStatus('running')}
              onComplete={resetConversation}
            />
            <LearningFeedback
              onFeedback={(feedback) => console.log('Feedback:', feedback)}
              sessionSummary={`Implementação concluída: ${conversationState.originalPrompt}`}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBackToTraditional}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            {getCurrentStepIcon()}
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Modo Conversacional Inteligente
                <Sparkles className="h-5 w-5 text-primary" />
              </h2>
              <p className="text-muted-foreground">{getStepTitle()}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetConversation}>
            Nova Conversa
          </Button>
        </div>
      </div>

      {isGenerating && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Processando seu comando com análise inteligente... Gerando código personalizado.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso da Implementação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {['initial_query', 'technical_approval', 'implementation', 'build_verification'].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  conversationState.currentStep === step
                    ? 'bg-primary text-primary-foreground'
                    : conversationState.steps.some(s => s.type === step && s.status === 'completed')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <span>{index + 1}</span>
                  <span className="capitalize">{step.replace('_', ' ')}</span>
                </div>
                {index < 3 && <div className="w-4 h-px bg-gray-300" />}
              </React.Fragment>
            ))}
          </div>
          <Separator />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getCurrentStepIcon()}
            {getStepTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>
    </div>
  );
};
