
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ConversationalDashboard } from './ConversationalDashboard';
import { PromptEditor } from './PromptEditor';
import { CodePreview } from './CodePreview';
import { PromptHistory } from './PromptHistory';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { Bot, Code, History, MessageSquare, Zap } from 'lucide-react';
import { PromptLog } from './types';

export const PromptGeneratorDashboard: React.FC = () => {
  const [mode, setMode] = useState<'conversational' | 'traditional'>('conversational');
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  
  const { 
    promptLogs, 
    generateCode, 
    applyCode, 
    rollbackCode, 
    isGenerating, 
    isApplying 
  } = usePromptGenerator();

  const handleGenerateCode = (params: { prompt: string; temperature: number; model: string }) => {
    generateCode(
      params,
      {
        onSuccess: (data) => {
          setGeneratedCode(data);
        },
        onError: (error) => {
          console.error('Error generating code:', error);
        }
      }
    );
  };

  const handleApplyCode = (logId: string) => {
    applyCode(logId);
  };

  const handleRollbackCode = (logId: string) => {
    rollbackCode(logId);
  };

  const handleViewLog = (logId: string) => {
    setSelectedLog(logId);
  };

  if (mode === 'conversational') {
    return (
      <ConversationalDashboard 
        onBackToTraditional={() => setMode('traditional')}
      />
    );
  }

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
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gerador de Código IA</h1>
            <p className="text-muted-foreground">
              Gere, teste e implemente código automaticamente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setMode('conversational')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Modo Conversacional
          </Button>
          <Badge variant="secondary">Modo Tradicional</Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Gerador
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Prévia
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerador de Código</CardTitle>
            </CardHeader>
            <CardContent>
              <PromptEditor 
                onGenerate={handleGenerateCode}
                isGenerating={isGenerating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prévia do Código</CardTitle>
            </CardHeader>
            <CardContent>
              <CodePreview 
                generatedCode={generatedCode}
                onApply={handleApplyCode}
                isApplying={isApplying}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <PromptHistory 
                promptLogs={mockPromptLogs}
                onViewLog={handleViewLog}
                onApplyCode={handleApplyCode}
                onRollbackCode={handleRollbackCode}
                selectedLogId={selectedLog}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
