
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, CheckCircle, XCircle, Clock, RotateCcw, AlertCircle } from 'lucide-react';
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

interface PromptHistoryProps {
  promptLogs: PromptLog[];
  onRollback: (logId: string) => void;
  isLoadingLogs: boolean;
}

export const PromptHistory: React.FC<PromptHistoryProps> = ({
  promptLogs,
  onRollback,
  isLoadingLogs
}) => {
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

  if (isLoadingLogs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
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
              {promptLogs.map((log) => (
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
                    {log.applied_files.length > 0 && (
                      <Badge variant="outline">
                        {log.applied_files.length} arquivo{log.applied_files.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {log.error_message && (
                    <div className="flex items-start gap-2 p-2 bg-red-50 rounded text-xs">
                      <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-red-700">{log.error_message}</span>
                    </div>
                  )}

                  {log.status === 'applied' && (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRollback(log.id)}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Desfazer
                      </Button>
                    </div>
                  )}

                  <Separator />
                </div>
              ))}
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
