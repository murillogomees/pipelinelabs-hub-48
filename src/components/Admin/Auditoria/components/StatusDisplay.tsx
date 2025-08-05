
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Clock, Mail } from 'lucide-react';

interface StatusDisplayProps {
  config: any;
  hasChanges: boolean;
}

export function StatusDisplay({ config, hasChanges }: StatusDisplayProps) {
  if (!config) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <Label>Status da Auditoria</Label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Última Execução</Label>
          <p className="text-sm text-muted-foreground">
            {config.ultima_execucao 
              ? new Date(config.ultima_execucao).toLocaleString('pt-BR')
              : 'Nunca executada'
            }
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium">Próxima Execução</Label>
          <p className="text-sm text-muted-foreground">
            {config.proxima_execucao 
              ? new Date(config.proxima_execucao).toLocaleString('pt-BR')
              : 'Não agendada'
            }
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={config.auditoria_ativa ? 'default' : 'secondary'}>
          {config.auditoria_ativa ? 'Ativa' : 'Inativa'}
        </Badge>
        {config.notificacoes_ativas && (
          <Badge variant="outline">
            <Mail className="h-3 w-3 mr-1" />
            Notificações
          </Badge>
        )}
        {hasChanges && (
          <Badge variant="destructive">
            Alterações Pendentes
          </Badge>
        )}
      </div>
    </div>
  );
}
