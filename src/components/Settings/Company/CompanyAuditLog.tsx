
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { Search, Filter, Calendar, User } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
  ip_address: string;
  user_agent: string;
  company_id: string;
  user_id: string;
  details: any;
  profiles?: {
    display_name?: string;
    email?: string;
    access_levels?: {
      name: string;
      display_name: string;
    };
  } | null;
}

export const CompanyAuditLog: React.FC = () => {
  const { currentCompany } = useCurrentCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  
  const { data: auditLogs, isLoading, error } = useAuditLogs({
    companyId: currentCompany?.id,
    searchTerm,
    action: selectedAction
  });

  const handleViewDetails = (entry: AuditLogEntry) => {
    setSelectedEntry(entry);
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserDisplay = (entry: AuditLogEntry) => {
    if (entry.profiles) {
      return entry.profiles.display_name || entry.profiles.email || 'Usuário Desconhecido';
    }
    return 'Usuário Desconhecido';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Erro ao carregar logs de auditoria: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Auditoria da Empresa</h2>
          <p className="text-muted-foreground">
            Visualize todas as ações realizadas na empresa
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por ação, recurso ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Ação</Label>
              <select
                id="action"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todas as ações</option>
                <option value="create">Criar</option>
                <option value="update">Atualizar</option>
                <option value="delete">Deletar</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs?.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {new Date(entry.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {getUserDisplay(entry)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(entry.action)}>
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{entry.resource_type}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {entry.resource_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      {entry.ip_address}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(entry)}
                    >
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!auditLogs?.length && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log de auditoria encontrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Ação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Ação</Label>
                <Badge className={getActionColor(selectedEntry.action)}>
                  {selectedEntry.action}
                </Badge>
              </div>
              <div>
                <Label>Recurso</Label>
                <p>{selectedEntry.resource_type}</p>
              </div>
              <div>
                <Label>Data/Hora</Label>
                <p>{new Date(selectedEntry.created_at).toLocaleString()}</p>
              </div>
              <div>
                <Label>Usuário</Label>
                <p>{getUserDisplay(selectedEntry)}</p>
              </div>
            </div>

            <Separator />

            {selectedEntry.old_values && (
              <div>
                <Label>Valores Anteriores</Label>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(selectedEntry.old_values, null, 2)}
                </pre>
              </div>
            )}

            {selectedEntry.new_values && (
              <div>
                <Label>Novos Valores</Label>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(selectedEntry.new_values, null, 2)}
                </pre>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setSelectedEntry(null)}
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
