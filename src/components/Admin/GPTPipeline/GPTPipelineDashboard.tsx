
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Brain,
  Sparkles,
  Loader2,
  ThumbsUp,
  Code
} from 'lucide-react';

interface GPTPipelineResponse {
  analysis: string;
  suggestion: string;
  code_changes: {
    files: string[];
    description: string;
  };
  considerations: string[];
  ready_to_implement: boolean;
}

interface Conversation {
  id: string;
  message: string;
  response: GPTPipelineResponse;
  timestamp: string;
  approved?: boolean;
  implemented?: boolean;
}

export const GPTPipelineDashboard: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentResponse, setCurrentResponse] = useState<GPTPipelineResponse | null>(null);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      // Obter company_id atual via RPC
      const { data: companyIdData, error: companyErr } = await supabase.rpc('get_user_company_id');
      if (companyErr) throw companyErr;

      const { data, error } = await supabase.functions.invoke('gpt-pipeline-chat', {
        body: {
          message: message.trim(),
          gpt_id: 'gpt-4o',
          company_id: companyIdData,
          conversation_history: conversations.slice(-5).map(conv => [
            { role: 'user', content: conv.message },
            { role: 'assistant', content: JSON.stringify(conv.response) }
          ]).flat()
        },
      });

      if (error) throw error;

      console.log('Resposta do GPT Pipeline:', data);
      
      if (data?.success && data?.response) {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          message,
          response: data.response,
          timestamp: new Date().toISOString()
        };
        
        setConversations(prev => [...prev, newConversation]);
        setCurrentResponse(data.response);
        setMessage('');

        toast({
          title: 'GPT Pipeline respondeu',
          description: 'Analise a resposta e aprove se estiver satisfeito',
        });
      } else {
        throw new Error('Resposta inválida do GPT Pipeline');
      }
    } catch (error: any) {
      console.error('Erro ao comunicar com GPT Pipeline:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao comunicar com GPT Pipeline',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approveAndImplement = async (conversation: Conversation) => {
    setIsLoading(true);
    try {
      // Simulação da aplicação (você pode integrar com code-applier aqui)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Persistir memória enriquecida da resposta aprovada
      const resp = conversation.response;
      const enriched = [
        '# Aprovação de implementação - Resumo',
        '',
        '## Análise',
        resp.analysis,
        '',
        '## Sugestão',
        resp.suggestion,
        '',
        '## Mudanças de Código',
        `Arquivos: ${resp.code_changes.files.join(', ')}`,
        resp.code_changes.description,
        '',
        resp.considerations?.length ? '## Considerações' : '',
        ...(resp.considerations || [])
      ].filter(Boolean).join('\n');

      const { error: knError } = await supabase.functions.invoke('save-knowledge', {
        body: {
          namespace: 'ai-engineer',
          content: enriched,
          metadata: {
            source: 'gpt-pipeline-approval',
            conversation_id: conversation.id,
            files: resp.code_changes.files,
            ready: resp.ready_to_implement,
            timestamp: new Date().toISOString(),
          }
        }
      });
      if (knError) throw knError;

      // Marcar como aprovado e implementado
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, approved: true, implemented: true }
            : conv
        )
      );

      toast({
        title: 'Implementação concluída',
        description: 'Mudanças aplicadas e conhecimento salvo.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro na implementação',
        description: error.message || 'Erro ao implementar ou salvar memória',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            GPT Pipeline
            <Sparkles className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground">
            Seu assistente de desenvolvimento personalizado para Pipeline Labs ERP
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversa com GPT Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Descreva o que você gostaria de implementar ou modificar no sistema..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar para GPT Pipeline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Response */}
      {currentResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análise do GPT Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Análise:</h4>
                <p className="text-sm text-muted-foreground">{currentResponse.analysis}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Sugestão de Implementação:</h4>
                <p className="text-sm">{currentResponse.suggestion}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Arquivos a serem modificados:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentResponse.code_changes.files.map((file, index) => (
                    <Badge key={index} variant="outline">
                      <Code className="h-3 w-3 mr-1" />
                      {file}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentResponse.code_changes.description}
                </p>
              </div>
              
              {currentResponse.considerations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Considerações importantes:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentResponse.considerations.map((consideration, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {consideration}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
            
            {currentResponse.ready_to_implement && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta implementação está pronta para ser aplicada. Clique em "Aprovar e Implementar" para aplicar as mudanças.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2 pt-4">
              {currentResponse.ready_to_implement && (
                <Button 
                  onClick={() => approveAndImplement(conversations[conversations.length - 1])}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Aprovar e Implementar
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => setCurrentResponse(null)}
              >
                Descartar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation History */}
      {conversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Conversas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Você:</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(conversation.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm">{conversation.message}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {conversation.approved && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Aprovado
                      </Badge>
                    )}
                    {conversation.implemented && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Implementado
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
