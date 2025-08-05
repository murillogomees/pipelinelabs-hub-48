
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Shield, Users } from 'lucide-react';
import { AccessLevelDialog } from './AccessLevelDialog';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { useAccessLevels } from '@/hooks/useAccessLevels';
import type { AccessLevel } from './types';
import type { AccessLevelWithCount } from '@/hooks/useAccessLevels';

export function AccessLevelsManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<AccessLevel | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { 
    accessLevels, 
    isLoading, 
    refetch, 
    deleteAccessLevel,
    isDeleting 
  } = useAccessLevels();

  const filteredLevels = accessLevels.filter(level => 
    level.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<AccessLevelWithCount>[] = [
    {
      key: 'display_name' as keyof AccessLevelWithCount,
      header: 'Nome',
      render: (value: string, row: AccessLevelWithCount) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-primary" />
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'description' as keyof AccessLevelWithCount,
      header: 'Descrição',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">{value || 'Sem descrição'}</span>
      )
    },
    {
      key: '_count' as keyof AccessLevelWithCount,
      header: 'Usuários',
      render: (_value: any, row: AccessLevelWithCount) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row._count?.users || 0}</span>
        </div>
      )
    },
    {
      key: 'is_system' as keyof AccessLevelWithCount,
      header: 'Tipo',
      render: (value: boolean) => (
        <Badge variant={value ? 'secondary' : 'default'}>
          {value ? 'Sistema' : 'Personalizado'}
        </Badge>
      )
    },
    {
      key: 'is_active' as keyof AccessLevelWithCount,
      header: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    }
  ];

  const actions: Action<AccessLevelWithCount>[] = [
    {
      label: 'Editar',
      icon: Edit,
      onClick: (row: AccessLevelWithCount) => {
        setSelectedLevel(row);
        setShowDialog(true);
      },
      variant: 'outline' as const
    },
    {
      label: 'Excluir',
      icon: Trash2,
      onClick: (row: AccessLevelWithCount) => deleteAccessLevel(row),
      variant: 'outline' as const,
      className: 'text-destructive hover:text-destructive'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Níveis de Acesso</h2>
          <p className="text-muted-foreground">
            Gerencie os diferentes níveis de acesso e suas permissões
          </p>
        </div>
        <Button onClick={() => {
          setSelectedLevel(undefined);
          setShowDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Nível
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar níveis de acesso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <DataTable
        data={filteredLevels}
        columns={columns}
        actions={actions}
        loading={isLoading}
        emptyMessage="Nenhum nível de acesso encontrado"
      />

      <AccessLevelDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        accessLevel={selectedLevel}
        onSave={() => {
          setShowDialog(false);
          setSelectedLevel(undefined);
        }}
      />
    </div>
  );
}
