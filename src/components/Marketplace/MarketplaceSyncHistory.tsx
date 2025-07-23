import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMarketplaceSyncLogs, MarketplaceSyncLog } from '@/hooks/useMarketplaceSyncLogs';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

interface MarketplaceSyncHistoryProps {
  integrationId?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-warning" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-success text-success-foreground';
    case 'error':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-warning text-warning-foreground';
  }
};

const getDirectionIcon = (direction: string) => {
  return direction === 'import' ? (
    <ArrowDownLeft className="h-4 w-4 text-blue-500" />
  ) : (
    <ArrowUpRight className="h-4 w-4 text-green-500" />
  );
};

export const MarketplaceSyncHistory = ({ integrationId }: MarketplaceSyncHistoryProps) => {
  const { logs, isLoading } = useMarketplaceSyncLogs(integrationId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logs?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Nenhuma sincronização encontrada ainda. As sincronizações aparecem aqui quando executadas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Sincronização</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Direção</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <Badge className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{log.event_type}</span>
                    {log.error_message && (
                      <p className="text-xs text-destructive mt-1">
                        {log.error_message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getDirectionIcon(log.direction)}
                      <span className="capitalize">{log.direction}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-success">
                        ✓ {log.records_processed} processados
                      </div>
                      {log.records_failed > 0 && (
                        <div className="text-destructive">
                          ✗ {log.records_failed} falharam
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.duration_ms ? (
                      <span className="text-sm">
                        {log.duration_ms < 1000 
                          ? `${log.duration_ms}ms` 
                          : `${(log.duration_ms / 1000).toFixed(1)}s`
                        }
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};