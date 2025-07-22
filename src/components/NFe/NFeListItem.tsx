import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileX, Send, Check, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface NFe {
  id: string;
  invoice_number: string;
  series?: string;
  status: string;
  total_amount: number;
  issue_date: string;
  customer_name?: string;
  access_key?: string;
  protocol_number?: string;
}

interface NFeListItemProps {
  nfe: NFe;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onCancel: (id: string) => void;
  onSend: (id: string) => void;
}

const statusConfig = {
  draft: { label: 'Rascunho', color: 'default', icon: Clock },
  pending: { label: 'Pendente', color: 'secondary', icon: Clock },
  sent: { label: 'Enviada', color: 'default', icon: Send },
  approved: { label: 'Aprovada', color: 'default', icon: Check },
  rejected: { label: 'Rejeitada', color: 'destructive', icon: AlertTriangle },
  cancelled: { label: 'Cancelada', color: 'secondary', icon: FileX },
};

export function NFeListItem({ nfe, onView, onDownload, onCancel, onSend }: NFeListItemProps) {
  const status = statusConfig[nfe.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            NFe {nfe.invoice_number}
            {nfe.series && (
              <span className="text-sm text-muted-foreground">
                - Série {nfe.series}
              </span>
            )}
          </CardTitle>
          <Badge variant={status.color as any} className="flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Data de Emissão:</span>
            <p className="font-medium">
              {new Date(nfe.issue_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Valor Total:</span>
            <p className="font-medium">{formatCurrency(nfe.total_amount)}</p>
          </div>
          {nfe.customer_name && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Cliente:</span>
              <p className="font-medium">{nfe.customer_name}</p>
            </div>
          )}
          {nfe.access_key && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Chave de Acesso:</span>
              <p className="font-mono text-xs bg-muted p-2 rounded">
                {nfe.access_key}
              </p>
            </div>
          )}
          {nfe.protocol_number && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Protocolo:</span>
              <p className="font-medium">{nfe.protocol_number}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(nfe.id)}
            className="flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            Visualizar
          </Button>
          
          {(nfe.status === 'approved' || nfe.status === 'sent') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(nfe.id)}
              className="flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}
          
          {nfe.status === 'draft' && (
            <Button
              size="sm"
              onClick={() => onSend(nfe.id)}
              className="flex items-center gap-1"
            >
              <Send className="w-4 h-4" />
              Enviar
            </Button>
          )}
          
          {(nfe.status === 'sent' || nfe.status === 'approved') && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(nfe.id)}
              className="flex items-center gap-1"
            >
              <FileX className="w-4 h-4" />
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}