
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { History, Search, Filter, Calendar, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompanyData } from '@/hooks/useCompanyData';

interface AuditLogEntry {
  id: string;
  action: string;
  field_name: string;
  old_value: string;
  new_value: string;
  user_name: string;
  timestamp: string;
}

const ACTION_TYPES = {
  'UPDATE': 'Atualização',
  'CREATE': 'Criação',
  'DELETE': 'Exclusão',
  'VIEW': 'Visualização'
};

const ACTION_COLORS = {
  'UPDATE': 'bg-blue-500',
  'CREATE': 'bg-green-500',
  'DELETE': 'bg-red-500',
  'VIEW': 'bg-gray-500'
};

export function CompanyAuditLog() {
  const { company } = useCompanyData();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        action: 'UPDATE',
        field_name: 'name',
        old_value: 'Pipeline Labs Tecnologia',
        new_value: 'Pipeline Labs Tecnologia LTDA',
        user_name: 'João Silva',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        action: 'UPDATE',
        field_name: 'email',
        old_value: 'contato@pipeline.com',
        new_value: 'contato@pipelinelabs.com',
        user_name: 'Maria Santos',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        action: 'CREATE',
        field_name: 'company',
        old_value: '',
        new_value: 'Empresa criada',
        user_name: 'Admin Sistema',
        timestamp: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    setTimeout(() => {
      setAuditLogs(mockLogs);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.field_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.old_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.new_value.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesField = selectedField === 'all' || log.field_name === selectedField;
    
    return matchesSearch && matchesAction && matchesField;
  });

  const uniqueFields = [...new Set(auditLogs.map(log => log.field_name))];

  if (!company) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <div>
            <CardTitle>Histórico de Alterações</CardTitle>
            <p className="text-sm text-muted-foreground">
              Registro de todas as modificações realizadas nos dados da empresa
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filtros */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por campo, usuário ou valor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {Object.entries(ACTION_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todos os campos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os campos</SelectItem>
                  {uniqueFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Lista de Logs */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              Carregando histórico...
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Nenhum registro encontrado</p>
            <p className="text-sm">Tente ajustar os filtros ou a busca</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={`${ACTION_COLORS[log.action as keyof typeof ACTION_COLORS]} text-white`}
                      >
                        {ACTION_TYPES[log.action as keyof typeof ACTION_TYPES]}
                      </Badge>
                      <span className="font-medium">{log.field_name}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {log.old_value && (
                        <div>
                          <span className="text-muted-foreground">Valor anterior:</span>
                          <span className="ml-2 text-red-600">{log.old_value}</span>
                        </div>
                      )}
                      
                      {log.new_value && (
                        <div>
                          <span className="text-muted-foreground">Novo valor:</span>
                          <span className="ml-2 text-green-600">{log.new_value}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <User className="h-3 w-3" />
                      {log.user_name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
