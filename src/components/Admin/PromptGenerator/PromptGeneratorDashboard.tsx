
import React, { useState, useCallback, useMemo } from 'react';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { PromptEditor } from './PromptEditor';
import { CodeEditor } from './CodeEditor';
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
    reviseCode,
    applyCode,
    rollbackCode
  } = usePromptGenerator();

  const [currentGeneration, setCurrentGeneration] = useState<{
    logId: string;
    generatedCode: any;
  } | null>(null);

  const handleGenerate = useCallback(async (params: {
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
          onSuccess: (data) => {
            console.log('Generate success:', data);
            resolve(data);
          },
          onError: (error) => {
            console.error('Generate error:', error);
            reject(error);
          }
        });
      });
      
      setCurrentGeneration(result);
    } catch (error) {
      console.error('Error generating code:', error);
      setCurrentGeneration(null);
    }
  }, [generateCode]);

  const handleRevise = useCallback(async (prompt: string, originalCode: any) => {
    try {
      const result = await new Promise<{
        logId: string;
        generatedCode: any;
      }>((resolve, reject) => {
        reviseCode(prompt, originalCode, {
          onSuccess: (data) => {
            console.log('Revise success:', data);
            resolve(data);
          },
          onError: (error) => {
            console.error('Revise error:', error);
            reject(error);
          }
        });
      });
      
      setCurrentGeneration(result);
    } catch (error) {
      console.error('Error revising code:', error);
    }
  }, [reviseCode]);

  const handleApply = useCallback((logId: string) => {
    applyCode(logId);
    setCurrentGeneration(null);
  }, [applyCode]);

  const handleRollback = useCallback((logId: string) => {
    rollbackCode(logId);
  }, [rollbackCode]);

  // Memoizar propriedades para evitar re-renders desnecessários
  const promptLogsData = useMemo(() => promptLogs || [], [promptLogs]);

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
            <CodeEditor
              generatedCode={currentGeneration.generatedCode}
              logId={currentGeneration.logId}
              onApply={handleApply}
              onRevise={handleRevise}
              isApplying={isApplying}
              isRevising={isGenerating}
            />
          )}
        </div>

        <div>
          <PromptHistory
            promptLogs={promptLogsData}
            onRollback={handleRollback}
            isLoadingLogs={isLoadingLogs}
          />
        </div>
      </div>
    </div>
  );
};
