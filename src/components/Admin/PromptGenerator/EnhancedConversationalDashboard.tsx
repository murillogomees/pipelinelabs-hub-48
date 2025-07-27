
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConversationFlow } from '@/hooks/useConversationFlow';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
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
  Loader2
} from 'lucide-react';

interface EnhancedConversationalDashboardProps {
  onBackToTraditional: () => void;
}

export const EnhancedConversationalDashboard: React.FC<EnhancedConversationalDashboardProps> = ({
  onBackToTraditional
}) => {
  const { conversationState, updateConversationState, resetConversation } = useConversationFlow();
  const { generateCode, isGenerating } = usePromptGenerator();
  const [buildStatus, setBuildStatus] = useState<'success' | 'failed' | 'running'>('success');

  const handleInitialQuery = async (prompt: string) => {
    console.log('Processando prompt:', prompt);
    
    // Análise mais detalhada do prompt
    const analysis = analyzePrompt(prompt);
    
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

  const analyzePrompt = (prompt: string) => {
    // Análise mais inteligente do prompt
    const lowerPrompt = prompt.toLowerCase();
    
    let impactType: 'performance' | 'security' | 'clean_code' | 'database' | 'architectural' = 'clean_code';
    let affectedFiles: string[] = [];
    let functions: string[] = [];
    
    // Detectar tipo de operação
    if (lowerPrompt.includes('criar') || lowerPrompt.includes('adicionar')) {
      if (lowerPrompt.includes('componente')) {
        affectedFiles.push('src/components/NewComponent.tsx');
        functions.push('NewComponent');
      }
      if (lowerPrompt.includes('hook')) {
        affectedFiles.push('src/hooks/useNewHook.ts');
        functions.push('useNewHook');
      }
      if (lowerPrompt.includes('página') || lowerPrompt.includes('page')) {
        affectedFiles.push('src/pages/NewPage.tsx');
        functions.push('NewPage');
      }
      if (lowerPrompt.includes('api') || lowerPrompt.includes('endpoint')) {
        affectedFiles.push('supabase/functions/new-function/index.ts');
        functions.push('newFunction');
      }
    }
    
    if (lowerPrompt.includes('banco') || lowerPrompt.includes('database') || lowerPrompt.includes('tabela')) {
      impactType = 'database';
    }
    
    if (lowerPrompt.includes('performance') || lowerPrompt.includes('otimizar')) {
      impactType = 'performance';
    }
    
    if (lowerPrompt.includes('segurança') || lowerPrompt.includes('security')) {
      impactType = 'security';
    }

    return {
      affectedFiles,
      impactType,
      impactDescription: `Implementação baseada no comando: "${prompt}"`,
      justification: 'Análise automática do prompt para determinar arquivos e funções necessárias',
      estimatedChanges: {
        files: affectedFiles,
        functions,
        tables: lowerPrompt.includes('tabela') ? ['nova_tabela'] : [],
        edgeFunctions: lowerPrompt.includes('api') ? ['nova-funcao'] : []
      }
    };
  };

  const handleTechnicalApproval = async () => {
    console.log('Iniciando implementação...');
    
    const prompt = conversationState.originalPrompt;
    
    // Gerar código baseado no prompt
    generateCode(
      {
        prompt,
        temperature: 0.7,
        model: 'gpt-4o-mini'
      },
      {
        onSuccess: (data) => {
          console.log('Código gerado:', data);
          
          const implementationReport = {
            modifiedFiles: Object.keys(data.files || {}),
            linesChanged: Object.keys(data.files || {}).reduce((acc, file) => {
              acc[file] = 50; // Estimativa
              return acc;
            }, {} as Record<string, number>),
            functionsCreated: data.suggestions?.map((s: any) => s.title) || [],
            functionsModified: [],
            functionsRemoved: [],
            databaseChanges: {
              tables: data.sql?.length > 0 ? ['nova_tabela'] : [],
              fields: [],
              indexes: []
            },
            edgeFunctions: data.files && Object.keys(data.files).some(f => f.includes('functions')) ? ['nova-funcao'] : [],
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
          
          // Simular build
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
        },
        onError: (error) => {
          console.error('Erro na geração:', error);
          updateConversationState({
            currentStep: 'technical_approval',
            steps: [
              ...conversationState.steps,
              {
                id: Date.now().toString(),
                type: 'technical_approval',
                status: 'failed',
                content: `Erro na aprovação técnica: ${error.message}`,
                timestamp: new Date().toISOString()
              }
            ]
          });
        }
      }
    );
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
        return 'Análise do Comando';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getCurrentStepIcon()}
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Modo Conversacional Inteligente
              <Sparkles className="h-5 w-5 text-primary" />
            </h2>
            <p className="text-muted-foreground">{getStepTitle()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBackToTraditional}>
            Modo Tradicional
          </Button>
          <Button variant="outline" onClick={resetConversation}>
            Nova Conversa
          </Button>
        </div>
      </div>

      {/* Indicador de processamento */}
      {isGenerating && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Processando seu comando... Analisando e gerando código personalizado.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Steps */}
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

      {/* Current Step Content */}
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
