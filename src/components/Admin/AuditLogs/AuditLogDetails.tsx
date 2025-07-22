import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { AuditLog } from '@/hooks/useAuditLogs';

interface AuditLogDetailsProps {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
}

export const AuditLogDetails = ({ log, open, onClose }: AuditLogDetailsProps) => {
  if (!log) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Informações Gerais</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Ação:</strong> {log.action}
                  </div>
                  <div>
                    <strong>Recurso:</strong> {log.resource_type}
                  </div>
                  <div>
                    <strong>ID do Recurso:</strong> {log.resource_id || 'N/A'}
                  </div>
                  <div>
                    <strong>Data:</strong> {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Usuário</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Nome:</strong> {log.user_name || 'N/A'}
                  </div>
                  <div>
                    <strong>Email:</strong> {log.user_email || 'N/A'}
                  </div>
                  <div>
                    <strong>ID:</strong> {log.user_id}
                  </div>
                </div>
              </div>
            </div>

            {/* Status and Severity */}
            <div className="flex gap-4">
              <div>
                <strong>Severidade:</strong>
                <Badge 
                  variant={getSeverityColor(log.severity)} 
                  className="ml-2"
                >
                  {log.severity}
                </Badge>
              </div>
              <div>
                <strong>Status:</strong>
                <Badge 
                  variant={getStatusColor(log.status)} 
                  className="ml-2"
                >
                  {log.status}
                </Badge>
              </div>
            </div>

            {/* Network Information */}
            {(log.ip_address || log.user_agent) && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Informações de Rede</h4>
                  <div className="space-y-2 text-sm">
                    {log.ip_address && (
                      <div>
                        <strong>IP:</strong> {log.ip_address}
                      </div>
                    )}
                    {log.user_agent && (
                      <div>
                        <strong>User Agent:</strong> 
                        <div className="bg-muted p-2 rounded mt-1 text-xs font-mono">
                          {log.user_agent}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Changes */}
            {(log.old_values || log.new_values) && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Alterações</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {log.old_values && (
                      <div>
                        <strong>Valores Anteriores:</strong>
                        <pre className="bg-muted p-3 rounded mt-1 text-xs overflow-x-auto">
                          {JSON.stringify(log.old_values, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.new_values && (
                      <div>
                        <strong>Novos Valores:</strong>
                        <pre className="bg-muted p-3 rounded mt-1 text-xs overflow-x-auto">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Additional Details */}
            {log.details && Object.keys(log.details).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Detalhes Adicionais</h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};