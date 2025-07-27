
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  Eye,
  Play,
  Code,
  Database,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PromptLog {
  id: string;
  prompt: string;
  generated_code: any;
  model_used: string;
  temperature: number;
  status: 'pending' | 'applied' | 'error' | 'rolled_back';
  error_message?: string;
  applied_files: string[];
  created_at: string;
  applied_at?: string;
  rolled_back_at?: string;
}

export interface PromptHistoryProps {
  promptLogs: PromptLog[];
  onRollback: (logId: string) => void;
  onApplyCode: (logId: string) => void;
  onViewCode: (log: PromptLog) => void;
  isLoadingLogs: boolean;
}

export const PromptHistory: React.FC<PromptHistoryProps> = ({
  promptLogs,
  onRollback,
  onApplyCode,
  onViewCode,
  isLoadingLogs
}) => {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'rolled_back':
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Aplicado';
      case 'error':
        return 'Erro';
      case 'rolled_back':
        return 'Desfeito';
      default:
        return 'Pendente';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'applied':
        return 'default' as const;
      case 'error':
        return 'destructive' as const;
      case 'rolled_back':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getGeneratedContentSummary = (generatedCode: any) => {
    if (!generatedCode) return null;

    const fileCount = Object.keys(generatedCode.files || {}).length;
    const sqlCount = (generatedCode.sql || []).length;
    const hasDescription = !!generatedCode.description;
    const hasSuggestions = !!(generatedCode.suggestions && generatedCode.suggestions.length > 0);

    return {
      fileCount,
      sqlCount,
      hasDescription,
      hasSuggestions
    };
  };

  const renderGeneratedContent = (log: PromptLog) => {
    const content = log.generated_code;
    if (!content) return null;

    return (
      <div className="space-y-4 mt-4">
        {/* Descrição */}
        {content.description && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Descrição</span>
            </div>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </div>
        )}

        {/* Arquivos gerados */}
        {content.files && Object.keys(content.files).length > 0 && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Arquivos ({Object.keys(content.files).length})</span>
            </div>
            <div className="space-y-2">
              {Object.entries(content.files).map(([filePath, fileContent]) => (
                <div key={filePath} className="border rounded p-2 bg-background">
                  <div className="font-mono text-xs text-muted-foreground mb-1">{filePath}</div>
                  <div className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{String(fileContent).substring(0, 200)}...</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SQL Commands */}
        {content.sql && content.sql.length > 0 && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">SQL Commands ({content.sql.length})</span>
            </div>
            <div className="space-y-2">
              {content.sql.map((sqlCmd: string, index: number) => (
                <div key={index} className="border rounded p-2 bg-background">
                  <div className="font-mono text-xs text-muted-foreground mb-1">SQL {index + 1}</div>
                  <div className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{sqlCmd}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sugestões */}
        {content.suggestions && content.suggestions.length > 0 && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Sugestões ({content.suggestions.length})</span>
            </div>
            <div className="space-y-2">
              {content.suggestions.map((suggestion: any, index: number) => (
                <div key={index} className="border rounded p-2 bg-background">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={suggestion.type === 'improvement' ? 'default' : 
                                   suggestion.type === 'fix' ? 'destructive' : 'secondary'}>
                      {suggestion.type === 'improvement' ? 'Melhoria' : 
                       suggestion.type === 'fix' ? 'Correção' : 'Recurso'}
                    </Badge>
                    <span className="text-sm font-medium">{suggestion.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoadingLogs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Execuções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando histórico...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Execuções</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {promptLogs && promptLogs.length > 0 ? (
            <div className="space-y-4">
              {promptLogs.map((log) => {
                const isExpanded = expandedLogs.has(log.id);
                const contentSummary = getGeneratedContentSummary(log.generated_code);

                return (
                  <div key={log.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium line-clamp-2">
                          {log.prompt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(log.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <Badge variant={getStatusVariant(log.status)}>
                          {getStatusLabel(log.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">{log.model_used}</Badge>
                      <Badge variant="outline">T: {log.temperature}</Badge>
                      {contentSummary && (
                        <>
                          {contentSummary.fileCount > 0 && (
                            <Badge variant="outline">
                              {contentSummary.fileCount} arquivo{contentSummary.fileCount > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {contentSummary.sqlCount > 0 && (
                            <Badge variant="outline">
                              {contentSummary.sqlCount} SQL{contentSummary.sqlCount > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {contentSummary.hasSuggestions && (
                            <Badge variant="outline">Com sugestões</Badge>
                          )}
                        </>
                      )}
                    </div>

                    {log.error_message && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 rounded text-xs">
                        <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-red-700">{log.error_message}</span>
                      </div>
                    )}

                    {/* Expandir/Recolher detalhes */}
                    <div className="flex items-center justify-between pt-2">
                      <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(log.id)}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-1" />
                            )}
                            {isExpanded ? 'Ocultar' : 'Ver'} detalhes
                          </Button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          {renderGeneratedContent(log)}
                        </CollapsibleContent>
                      </Collapsible>

                      <div className="flex gap-2">
                        {log.generated_code && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewCode(log)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Visualizar Código
                          </Button>
                        )}
                        
                        {log.status === 'pending' && log.generated_code && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onApplyCode(log.id)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Aplicar
                          </Button>
                        )}
                        
                        {log.status === 'applied' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRollback(log.id)}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Desfazer
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum histórico encontrado</p>
              <p className="text-xs">Gere código para ver o histórico aqui</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
