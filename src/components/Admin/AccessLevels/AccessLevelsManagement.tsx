
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Shield, Users } from 'lucide-react';
import { AccessLevelDialog } from './AccessLevelDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import type { AccessLevel, AccessLevelWithCount } from './types';

export function AccessLevelsManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<AccessLevel | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: accessLevels = [], refetch, isLoading } = useQuery({
    queryKey: ['access-levels'],
    queryFn: async (): Promise<AccessLevelWithCount[]> => {
      const { data: levelsData, error: levelsError } = await supabase
        .from('access_levels')
        .select('*')
        .order('created_at', { ascending: false });

      if (levelsError) throw levelsError;

      // Count users for each access level
      const levelsWithCount = await Promise.all(
        (levelsData || []).map(async (level: any) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('access_level_id', level.id)
            .eq('is_active', true);
          
          return {
            ...level,
            _count: { users: count || 0 }
          } as AccessLevelWithCount;
        })
      );

      return levelsWithCount;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleDelete = async (level: AccessLevelWithCount) => {
    if (level.is_system) {
      toast({
        title: "Erro",
        description: "Níveis de acesso do sistema não podem ser excluídos",
        variant: "destructive",
      });
      return;
    }

    if (level._count?.users && level._count.users > 0) {
      toast({
        title: "Erro",
        description: "Não é possível excluir um nível de acesso que possui usuários",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('access_levels')
        .delete()
        .eq('id', level.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nível de acesso excluído com sucesso",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir nível de acesso",
        variant: "destructive",
      });
    }
  };

  const filteredLevels = accessLevels.filter(level => 
    level.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

    const { data: levels, error: lError } = await supabase
            .from('access_levels')
            .select('*')
            .order('created_at', { ascending: false });

        
        
      

  const columns: Column<AccessLevelWithCount>[] = [
    {
      key: 'display_name' as keyof AccessLevelWithCount,
      header: 'Nome',
      render: (value: string, row: AccessLevelWithCount) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-primary" />
          <div>
            <p className="font-medium">{levels.data.display_name}</p>
            <p className="text-sm text-muted-foreground">{filteredLevels}</p>
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
      onClick: handleDelete,
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
          refetch();
          setShowDialog(false);
          setSelectedLevel(undefined);
        }}
      />
    </div>
  );
}
