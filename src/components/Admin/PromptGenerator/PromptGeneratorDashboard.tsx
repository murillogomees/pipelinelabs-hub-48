
import React, { useState } from 'react';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { PromptEditor } from './PromptEditor';
import { CodePreview } from './CodePreview';
import { PromptHistory } from './PromptHistory';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

export const PromptGeneratorDashboard: React.FC = () => {
  const {
    promptLogs,
    isLoadingLogs,
    isGenerating,
    isApplying,
    generateCode,
    applyCode,
    rollbackCode
  } = usePromptGenerator();

  const [currentGeneration, setCurrentGeneration] = useState<{
    logId: string;
    generatedCode: any;
  } | null>(null);

  const handleGenerate = async (params: {
    prompt: string;
    temperature: number;
    model: string;
  }) => {
    try {
      const result = await new Promise<{
        logId: string;
        generatedCode: any;
      }>((resolve, reject) => {
        generateCode(params, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error)
        });
      });
      
      setCurrentGeneration(result);
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  const handleApply = (logId: string) => {
    applyCode(logId);
    setCurrentGeneration(null);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Painel Técnico do Desenvolvedor</strong> - Esta funcionalidade permite gerar e aplicar código automaticamente no projeto usando IA. 
          Use com cuidado e sempre revise o código antes de aplicar.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PromptEditor
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />

          {currentGeneration && (
            <CodePreview
              generatedCode={currentGeneration.generatedCode}
              logId={currentGeneration.logId}
              onApply={handleApply}
              isApplying={isApplying}
            />
          )}
        </div>

        <div>
          <PromptHistory
            promptLogs={promptLogs || []}
            onRollback={rollbackCode}
            isLoadingLogs={isLoadingLogs}
          />
        </div>
      </div>
    </div>
  );
};
