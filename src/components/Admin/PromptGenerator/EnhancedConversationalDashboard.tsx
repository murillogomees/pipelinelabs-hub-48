
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConversationFlow } from '@/hooks/useConversationFlow';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { useLearningSystem } from '@/hooks/useLearningSystem';
import { InitialQuery } from './InitialQuery';
import { TechnicalApproval } from './TechnicalApproval';
import { ImplementationReport } from './ImplementationReport';
import { BuildVerification } from './BuildVerification';
import { IntelligentAnalysis } from './IntelligentAnalysis';
import { LearningFeedback } from './LearningFeedback';
import { 
  ConversationState, 
  ImplementationReport as IImplementationReport, 
  PromptLog,
  LearningContext,
  SimilarSolution,
  KnowledgeEntry,
  Pattern
} from './types';
import { 
  MessageSquare, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Brain,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react';

interface EnhancedConversationalDashboardProps {
  onBackToTraditional: () => void;
}

export const EnhancedConversationalDashboard: React.FC<EnhancedConversationalDashboardProps> = ({
  onBackToTraditional
}) => {
  const { conversationState, updateConversationState, resetConversation } = useConversationFlow();
  const { promptLogs, generateCode, applyCode, isGenerating, isApplying } = usePromptGenerator();
  const { 
    learningContext, 
    analyzeContext, 
    isAnalyzing, 
    saveLearningSession, 
    updateKnowledgeBase,
    provideFeedback
  } = useLearningSystem();
  
  const [buildStatus, setBuildStatus] = useState<'success' | 'failed' | 'running'>('success');
  const [showIntelligentAnalysis, setShowIntelligentAnalysis] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Analisar contexto quando um novo prompt é recebido
  const handleInitialQuery = async (prompt: string) => {
    setShowIntelligentAnalysis(true);
    
    // Analisar contexto inteligente
    analyzeContext(prompt, {
      onSuccess: (context: LearningContext) => {
        updateConversationState({
          learningContext: context,
          originalPrompt: prompt
        });

        // Se encontrou soluções similares, mostrar análise primeiro
        if (context.similarSolutions.length > 0 || context.knowledgeBase.length > 0) {
          updateConversationState({
            currentStep: 'initial_query',
            steps: [
              ...conversationState.steps,
              {
                id: Date.now().toString(),
                type: 'initial_query',
                status: 'completed',
                content: `Análise inteligente concluída: ${context.suggestions.join(', ')}`,
                timestamp: new Date().toISOString(),
                metadata: { hasLearningContext: true }
              }
            ]
          });
        } else {
          // Continuar com análise técnica normal
          proceedWithTechnicalAnalysis(prompt);
        }
      }
    });
  };

  const proceedWithTechnicalAnalysis = (prompt: string) => {
    // Simulate AI understanding and analysis
    const mockAnalysis = {
      affectedFiles: ['src/components/ProductDialog.tsx', 'src/hooks/useProducts.ts'],
      impactType: 'performance' as const,
      impactDescription: 'Otimização de performance em listagem de produtos',
      justification: 'Melhoria necessária para reduzir tempo de carregamento',
      estimatedChanges: {
        files: ['ProductDialog.tsx', 'useProducts.ts'],
        functions: ['handleProductSubmit', 'fetchProducts'],
        tables: ['products'],
        edgeFunctions: []
      }
    };

    updateConversationState({
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
      technicalAnalysis: mockAnalysis
    });
  };

  const handleUseSimilarSolution = (solution: SimilarSolution) => {
    updateConversationState({
      currentStep: 'technical_approval',
      steps: [
        ...conversationState.steps,
        {
          id: Date.now().toString(),
          type: 'initial_query',
          status: 'completed',
          content: `Reaproveitando solução similar: ${solution.prompt}`,
          timestamp: new Date().toISOString(),
          metadata: { reusedSolution: solution }
        }
      ],
      technicalAnalysis: {
        affectedFiles: solution.tags.filter(tag => tag.includes('.')),
        impactType: 'clean_code' as const,
        impactDescription: `Solução baseada em implementação anterior com ${Math.round(solution.similarity * 100)}% de similaridade`,
        justification: `Esta solução foi usada ${solution.usage_count} vezes com taxa de sucesso de ${Math.round(solution.effectiveness_score * 100)}%`,
        estimatedChanges: {
          files: solution.tags.filter(tag => tag.includes('.')),
          functions: [],
          tables: [],
          edgeFunctions: []
        }
      }
    });
    setShowIntelligentAnalysis(false);
  };

  const handleApplyKnowledge = (entry: KnowledgeEntry) => {
    updateConversationState({
      currentStep: 'technical_approval',
      steps: [
        ...conversationState.steps,
        {
          id: Date.now().toString(),
          type: 'initial_query',
          status: 'completed',
          content: `Aplicando conhecimento: ${entry.title}`,
          timestamp: new Date().toISOString(),
          metadata: { appliedKnowledge: entry }
        }
      ],
      technicalAnalysis: {
        affectedFiles: entry.files_affected,
        impactType: entry.solution_type as any,
        impactDescription: entry.description,
        justification: `Baseado em conhecimento com ${Math.round(entry.success_rate * 100)}% de taxa de sucesso`,
        estimatedChanges: {
          files: entry.files_affected,
          functions: [],
          tables: [],
          edgeFunctions: []
        }
      }
    });
    setShowIntelligentAnalysis(false);
  };

  const handleApplyPattern = (pattern: Pattern) => {
    updateConversationState({
      currentStep: 'technical_approval',
      steps: [
        ...conversationState.steps,
        {
          id: Date.now().toString(),
          type: 'initial_query',
          status: 'completed',
          content: `Aplicando padrão: ${pattern.description}`,
          timestamp: new Date().toISOString(),
          metadata: { appliedPattern: pattern }
        }
      ],
      technicalAnalysis: {
        affectedFiles: [],
        impactType: pattern.pattern_type as any,
        impactDescription: pattern.description,
        justification: pattern.recommended_solution,
        estimatedChanges: {
          files: [],
          functions: [],
          tables: [],
          edgeFunctions: []
        }
      }
    });
    setShowIntelligentAnalysis(false);
  };

  const handleTechnicalApproval = () => {
    // Simulate implementation
    const mockImplementation: IImplementationReport = {
      modifiedFiles: ['src/components/ProductDialog.tsx', 'src/hooks/useProducts.ts'],
      linesChanged: {
        'ProductDialog.tsx': 15,
        'useProducts.ts': 8
      },
      functionsCreated: ['optimizeProductQuery'],
      functionsModified: ['handleProductSubmit'],
      functionsRemoved: [],
      databaseChanges: {
        tables: ['products'],
        fields: ['indexed_name'],
        indexes: ['idx_products_name']
      },
      edgeFunctions: ['product-optimizer'],
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
      implementationReport: mockImplementation
    });

    // Simulate build verification
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
            content: 'Implementação concluída',
            timestamp: new Date().toISOString()
          }
        ],
        implementationReport: {
          ...mockImplementation,
          buildStatus: 'success' as const
        }
      });
    }, 3000);
  };

  const handleBuildVerification = () => {
    // Salvar sessão de aprendizado
    if (conversationState.technicalAnalysis && conversationState.implementationReport) {
      saveLearningSession({
        prompt: conversationState.originalPrompt,
        context: conversationState.learningContext || {
          similarSolutions: [],
          knowledgeBase: [],
          patterns: [],
          suggestions: []
        },
        analysis: conversationState.technicalAnalysis,
        implementation: conversationState.implementationReport,
        build_result: {
          success: buildStatus === 'success',
          errors: conversationState.implementationReport.buildErrors || [],
          warnings: [],
          timestamp: new Date().toISOString(),
          build_time_ms: 2000
        },
        improvements_made: []
      });
    }

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

  const handleUserFeedback = (feedback: 'positive' | 'negative') => {
    if (currentSessionId) {
      provideFeedback({ sessionId: currentSessionId, feedback });
    }
  };

  const getCurrentStepIcon = () => {
    switch (conversationState.currentStep) {
      case 'initial_query':
        return showIntelligentAnalysis ? <Brain className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />;
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
        return showIntelligentAnalysis ? 'Análise Inteligente' : 'Consulta Inicial';
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
    if (showIntelligentAnalysis && conversationState.learningContext) {
      return (
        <IntelligentAnalysis
          context={conversationState.learningContext}
          originalPrompt={conversationState.originalPrompt}
          onUseSimilarSolution={handleUseSimilarSolution}
          onApplyKnowledge={handleApplyKnowledge}
          onApplyPattern={handleApplyPattern}
        />
      );
    }

    switch (conversationState.currentStep) {
      case 'initial_query':
        return <InitialQuery onSubmit={handleInitialQuery} />;
      case 'technical_approval':
        return (
          <TechnicalApproval
            analysis={conversationState.technicalAnalysis!}
            onApprove={handleTechnicalApproval}
            onReject={resetConversation}
            isProcessing={false}
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
              onFeedback={handleUserFeedback}
              sessionSummary={`Implementação concluída com ${conversationState.implementationReport?.modifiedFiles.length || 0} arquivos modificados`}
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

      {/* Indicador de análise inteligente */}
      {isAnalyzing && (
        <Alert>
          <Brain className="h-4 w-4 animate-pulse" />
          <AlertDescription>
            Analisando contexto inteligente... Buscando soluções similares e padrões na base de conhecimento.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso da Conversa</CardTitle>
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

      {/* Continue with normal flow button */}
      {showIntelligentAnalysis && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setShowIntelligentAnalysis(false);
                  proceedWithTechnicalAnalysis(conversationState.originalPrompt);
                }}
              >
                Continuar com Análise Normal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
