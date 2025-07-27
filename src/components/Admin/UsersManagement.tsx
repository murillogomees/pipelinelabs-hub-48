
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Edit, Trash2, UserPlus, Crown, Shield, User } from 'lucide-react';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { UserDialog } from './UserDialog';

interface User {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
  access_levels: {
    id: string;
    name: string;
    display_name: string;
  } | null;
}

export function UsersManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: users = [], refetch, isLoading } = useQuery({
    queryKey: ['users-management'],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          display_name,
          is_active,
          created_at,
          access_levels (
            id,
            name,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleDeleteUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário desativado com sucesso",
      });

      refetch();
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Erro",
        description: "Falha ao desativar usuário",
        variant: "destructive",
      });
    }
  };

  const getIconForUserType = (userType: string) => {
    switch (userType) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'contratante':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'operador':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredUsers = users.filter(user => 
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<User>[] = [
    {
      key: 'display_name' as keyof User,
      header: 'Usuário',
      render: (value: string, row: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {getIconForUserType(row.access_levels?.name || 'operador')}
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'access_levels' as keyof User,
      header: 'Nível de Acesso',
      render: (_value: any, row: User) => (
        <div className="flex items-center space-x-2">
          {getIconForUserType(row.access_levels?.name || 'operador')}
          <Badge variant="outline">
            {row.access_levels?.display_name || 'Não definido'}
          </Badge>
        </div>
      )
    },
    {
      key: 'is_active' as keyof User,
      header: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'created_at' as keyof User,
      header: 'Data de Criação',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      )
    }
  ];

  const actions: Action<User>[] = [
    {
      label: 'Editar',
      icon: Edit,
      onClick: (row: User) => {
        setSelectedUser(row);
        setShowDialog(true);
      },
      variant: 'outline' as const
    },
    {
      label: 'Desativar',
      icon: Trash2,
      onClick: handleDeleteUser,
      variant: 'outline' as const,
      className: 'text-destructive hover:text-destructive'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle>Gerenciamento de Usuários</CardTitle>
            </div>
            <Button onClick={() => {
              setSelectedUser(undefined);
              setShowDialog(true);
            }}>
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <DataTable
            data={filteredUsers}
            columns={columns}
            actions={actions}
            loading={isLoading}
            emptyMessage="Nenhum usuário encontrado"
          />
        </CardContent>
      </Card>

      <UserDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        user={selectedUser}
        onSave={() => {
          refetch();
          setShowDialog(false);
          setSelectedUser(undefined);
        }}
      />
    </div>
  );
}
