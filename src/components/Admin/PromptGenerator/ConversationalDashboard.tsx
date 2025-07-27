
import React, { useState, useCallback } from 'react';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { useConversationFlow } from '@/hooks/useConversationFlow';
import { PromptEditor } from './PromptEditor';
import { CodeEditor } from './CodeEditor';
import { PromptHistory } from './PromptHistory';
import { InitialQuery } from './InitialQuery';
import { TechnicalApproval } from './TechnicalApproval';
import { ImplementationReport } from './ImplementationReport';
import { BuildVerification } from './BuildVerification';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ConversationalDashboard: React.FC = () => {
  const {
    promptLogs,
    isLoadingLogs,
    isGenerating,
    isApplying,
    generateCode,
    reviseCode,
    applyCode,
    rollbackCode
  } = usePromptGenerator();

  const {
    conversationState,
    initializeConversation,
    addStep,
    updateCurrentStep,
    setTechnicalAnalysis,
    setImplementationReport,
    moveToNextStep,
    resetConversation
  } = useConversationFlow();

  const [currentGeneration, setCurrentGeneration] = useState<{
    logId: string;
    generatedCode: any;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRunningBuild, setIsRunningBuild] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const handleGenerate = useCallback(async (params: {
    prompt: string;
    temperature: number;
    model: string;
  }) => {
    // Inicializar conversa
    initializeConversation(params.prompt);
    setIsAnalyzing(true);
    
    // Simular delay para análise
    setTimeout(() => {
      setIsAnalyzing(false);
      moveToNextStep('technical_approval');
    }, 2000);
  }, [initializeConversation, moveToNextStep]);

  const handleAnalysisComplete = useCallback((analysis: any) => {
    setTechnicalAnalysis(analysis);
    addStep({
      type: 'initial_query',
      status: 'completed',
      content: `Análise concluída: ${analysis.impactDescription}`
    });
  }, [setTechnicalAnalysis, addStep]);

  const handleApprove = useCallback(async () => {
    moveToNextStep('implementation');
    
    try {
      const result = await new Promise<{
        logId: string;
        generatedCode: any;
      }>((resolve, reject) => {
        generateCode({
          prompt: conversationState.originalPrompt,
          temperature: 0.7,
          model: 'gpt-4o-mini'
        }, {
          onSuccess: (data) => {
            resolve(data);
          },
          onError: (error) => {
            reject(error);
          }
        });
      });
      
      setCurrentGeneration(result);
      
      // Simular relatório de implementação
      const mockReport = {
        modifiedFiles: ['src/components/Products/ProductDialog.tsx', 'src/hooks/useProducts.ts'],
        linesChanged: { 'ProductDialog.tsx': 45, 'useProducts.ts': 23 },
        functionsCreated: ['validateProduct', 'optimizeProductQuery'],
        functionsModified: ['handleProductSubmit'],
        functionsRemoved: [],
        databaseChanges: {
          tables: ['products'],
          fields: ['validation_status'],
          indexes: ['idx_products_validation']
        },
        edgeFunctions: ['product-validation'],
        buildStatus: 'pending' as const,
        buildErrors: []
      };
      
      setImplementationReport(mockReport);
      moveToNextStep('build_verification');
    } catch (error) {
      console.error('Error in implementation:', error);
    }
  }, [conversationState.originalPrompt, generateCode, setImplementationReport, moveToNextStep]);

  const handleReject = useCallback(() => {
    resetConversation();
  }, [resetConversation]);

  const handleRunBuild = useCallback(() => {
    setIsRunningBuild(true);
    
    // Simular build
    setTimeout(() => {
      setIsRunningBuild(false);
      
      const updatedReport = {
        ...conversationState.implementationReport!,
        buildStatus: 'success' as const
      };
      
      setImplementationReport(updatedReport);
    }, 3000);
  }, [conversationState.implementationReport, setImplementationReport]);

  const handleFixAutomatically = useCallback(() => {
    setIsFixing(true);
    
    // Simular correção automática
    setTimeout(() => {
      setIsFixing(false);
      handleRunBuild();
    }, 2000);
  }, [handleRunBuild]);

  const renderCurrentStep = () => {
    switch (conversationState.currentStep) {
      case 'initial_query':
        return (
          <InitialQuery
            prompt={conversationState.originalPrompt}
            onAnalysisComplete={handleAnalysisComplete}
            isAnalyzing={isAnalyzing}
          />
        );
      
      case 'technical_approval':
        return conversationState.technicalAnalysis ? (
          <TechnicalApproval
            analysis={conversationState.technicalAnalysis}
            onApprove={handleApprove}
            onReject={handleReject}
            isProcessing={isGenerating}
          />
        ) : null;
      
      case 'implementation':
        return conversationState.implementationReport ? (
          <ImplementationReport
            report={conversationState.implementationReport}
            onRunBuild={handleRunBuild}
            isRunningBuild={isRunningBuild}
          />
        ) : null;
      
      case 'build_verification':
        return conversationState.implementationReport ? (
          <BuildVerification
            buildStatus={conversationState.implementationReport.buildStatus}
            errors={conversationState.implementationReport.buildErrors?.map(error => ({
              file: 'src/components/example.tsx',
              line: 1,
              column: 1,
              message: error,
              type: 'error' as const
            }))}
            onFixAutomatically={handleFixAutomatically}
            onRunBuild={handleRunBuild}
            isFixing={isFixing}
            isRunning={isRunningBuild}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  const getStepBadge = (step: string) => {
    const stepLabels = {
      initial_query: 'Consulta Inicial',
      technical_approval: 'Aprovação Técnica',
      implementation: 'Implementação',
      build_verification: 'Verificação de Build'
    };
    return stepLabels[step as keyof typeof stepLabels];
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Painel Técnico Conversacional</strong> - Sistema aprimorado com 4 etapas de interação para 
          garantir implementações seguras e eficientes. Cada etapa é explicada de forma clara e acessível.
        </AlertDescription>
      </Alert>

      {/* Progresso das Etapas */}
      {conversationState.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progresso da Conversa</span>
              <Button
                variant="outline"
                size="sm"
                onClick={resetConversation}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reiniciar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {['initial_query', 'technical_approval', 'implementation', 'build_verification'].map((step, index) => {
                const isActive = conversationState.currentStep === step;
                const isCompleted = conversationState.steps.some(s => s.type === step && s.status === 'completed');
                
                return (
                  <div key={step} className="flex items-center space-x-2">
                    <Badge
                      variant={isActive ? 'default' : isCompleted ? 'secondary' : 'outline'}
                      className="whitespace-nowrap"
                    >
                      {index + 1}. {getStepBadge(step)}
                    </Badge>
                    {index < 3 && (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {conversationState.steps.length === 0 ? (
            <PromptEditor
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          ) : (
            renderCurrentStep()
          )}

          {currentGeneration && conversationState.currentStep === 'implementation' && (
            <CodeEditor
              generatedCode={currentGeneration.generatedCode}
              logId={currentGeneration.logId}
              onApply={applyCode}
              onRevise={reviseCode}
              isApplying={isApplying}
              isRevising={isGenerating}
            />
          )}
        </div>

        <div>
          <PromptHistory
            promptLogs={promptLogs || []}
            onRollback={rollbackCode}
            onApplyCode={applyCode}
            onViewCode={(log) => {
              setCurrentGeneration({
                logId: log.id,
                generatedCode: log.generated_code
              });
            }}
            isLoadingLogs={isLoadingLogs}
          />
        </div>
      </div>
    </div>
  );
};
