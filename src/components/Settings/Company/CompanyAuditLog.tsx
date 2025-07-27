
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserCompany } from '@/hooks/useUserCompany';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AlertCircle, Eye, Calendar, User, FileText } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  user_id: string;
  company_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  details: any;
  profiles?: {
    display_name?: string;
    email?: string;
    access_levels?: {
      name: string;
      display_name: string;
    };
  };
}

interface AuditLogFilters {
  action?: string;
  resource_type?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  company_id?: string;
}

export const CompanyAuditLog: React.FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { userCompany } = useUserCompany();
  const { logs, isLoading, error, refetch } = useAuditLogs({
    company_id: userCompany?.company_id || '',
    ...filters
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm ? 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      : true;
    
    return matchesSearch;
  });

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getUserName = (entry: AuditLogEntry) => {
    if (entry.profiles?.display_name) {
      return entry.profiles.display_name;
    }
    if (entry.profiles?.email) {
      return entry.profiles.email;
    }
    return 'Usuário desconhecido';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Erro ao carregar logs de auditoria</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Logs de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar por ação, recurso ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="action">Ação</Label>
              <Select value={filters.action || ''} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as ações</SelectItem>
                  <SelectItem value="create">Criar</SelectItem>
                  <SelectItem value="update">Atualizar</SelectItem>
                  <SelectItem value="delete">Excluir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resource_type">Tipo de Recurso</Label>
              <Select value={filters.resource_type || ''} onValueChange={(value) => handleFilterChange('resource_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os recursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os recursos</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recurso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {getUserName(entry)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge className={getActionColor(entry.action)}>
                          {entry.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.resource_type}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(entry.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.ip_address}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEntry(entry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
                            </DialogHeader>
                            {selectedEntry && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Usuário</Label>
                                    <p className="text-sm">{getUserName(selectedEntry)}</p>
                                  </div>
                                  <div>
                                    <Label>Ação</Label>
                                    <p className="text-sm">
                                      <Badge className={getActionColor(selectedEntry.action)}>
                                        {selectedEntry.action}
                                      </Badge>
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Recurso</Label>
                                    <p className="text-sm">{selectedEntry.resource_type}</p>
                                  </div>
                                  <div>
                                    <Label>Data</Label>
                                    <p className="text-sm">{formatDate(selectedEntry.created_at)}</p>
                                  </div>
                                  <div>
                                    <Label>IP</Label>
                                    <p className="text-sm">{selectedEntry.ip_address}</p>
                                  </div>
                                  <div>
                                    <Label>User Agent</Label>
                                    <p className="text-sm text-gray-600 truncate">{selectedEntry.user_agent}</p>
                                  </div>
                                </div>
                                
                                {selectedEntry.old_values && (
                                  <div>
                                    <Label>Valores Antigos</Label>
                                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                      {JSON.stringify(selectedEntry.old_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                {selectedEntry.new_values && (
                                  <div>
                                    <Label>Valores Novos</Label>
                                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                      {JSON.stringify(selectedEntry.new_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredLogs.length)} de {filteredLogs.length} resultados
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
