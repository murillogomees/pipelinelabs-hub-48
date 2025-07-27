
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useConversationFlow } from '@/hooks/useConversationFlow';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { InitialQuery } from './InitialQuery';
import { TechnicalApproval } from './TechnicalApproval';
import { ImplementationReport } from './ImplementationReport';
import { BuildVerification } from './BuildVerification';
import { ConversationState, ImplementationReport as IImplementationReport, PromptLog } from './types';
import { MessageSquare, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface ConversationalDashboardProps {
  onBackToTraditional: () => void;
}

export const ConversationalDashboard: React.FC<ConversationalDashboardProps> = ({
  onBackToTraditional
}) => {
  const { conversationState, updateConversationState, resetConversation } = useConversationFlow();
  const { promptLogs, generateCode, applyCode, isGenerating, isApplying } = usePromptGenerator();
  const [buildStatus, setBuildStatus] = useState<'success' | 'failed' | 'running'>('success');

  const handleInitialQuery = (prompt: string) => {
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
      technicalAnalysis: mockAnalysis,
      originalPrompt: prompt
    });
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
      buildStatus: 'success',
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
          buildStatus: 'success'
        }
      });
    }, 3000);
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
        return 'Consulta Inicial';
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
        return <InitialQuery onQuery={handleInitialQuery} />;
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
          <BuildVerification
            buildStatus={buildStatus}
            buildErrors={conversationState.implementationReport?.buildErrors || []}
            onRetry={() => setBuildStatus('running')}
            onComplete={resetConversation}
          />
        );
      default:
        return null;
    }
  };

  // Mock prompt logs with correct typing
  const mockPromptLogs: PromptLog[] = (promptLogs || []).map(log => ({
    id: log.id,
    prompt: log.prompt,
    generated_code: log.generated_code,
    status: (log.status as 'pending' | 'applied' | 'rolled_back' | 'error') || 'pending',
    created_at: log.created_at,
    applied_at: log.applied_at || undefined,
    rolled_back_at: log.rolled_back_at || undefined,
    error_message: log.error_message || undefined,
    user_id: log.user_id,
    company_id: log.company_id || '',
    model_used: log.model_used || 'gpt-4',
    temperature: log.temperature || 0.7,
    applied_files: log.applied_files || undefined,
    rollback_data: log.rollback_data || undefined
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getCurrentStepIcon()}
          <div>
            <h2 className="text-2xl font-bold">Modo Conversacional</h2>
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

      {/* Recent Logs */}
      {mockPromptLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockPromptLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.prompt.slice(0, 60)}...</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={log.status === 'applied' ? 'default' : 'secondary'}>
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
