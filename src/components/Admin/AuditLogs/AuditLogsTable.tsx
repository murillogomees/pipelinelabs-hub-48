import { useState } from 'react';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { AuditLog, AuditLogFilters } from '@/hooks/useAuditLogs';
import { AuditLogDetails } from './AuditLogDetails';

interface AuditLogsTableProps {
  logs: AuditLog[];
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  isLoading: boolean;
}

export const AuditLogsTable = ({ logs, filters, onFiltersChange, isLoading }: AuditLogsTableProps) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const handlePreviousPage = () => {
    const newOffset = Math.max(0, (filters.offset || 0) - (filters.limit || 100));
    onFiltersChange({
      ...filters,
      offset: newOffset
    });
  };

  const handleNextPage = () => {
    const newOffset = (filters.offset || 0) + (filters.limit || 100);
    onFiltersChange({
      ...filters,
      offset: newOffset
    });
  };

  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 100)) + 1;
  const hasNextPage = logs.length === (filters.limit || 100);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>Severidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IP</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum log de auditoria encontrado.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.user_name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{log.user_email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {log.action}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.resource_type}</div>
                      {log.resource_id && (
                        <div className="text-sm text-muted-foreground font-mono">
                          {log.resource_id}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(log.severity)}>
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.ip_address || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(log)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Página {currentPage} • {logs.length} registros
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasNextPage}
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Details Modal */}
      <AuditLogDetails
        log={selectedLog}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
};