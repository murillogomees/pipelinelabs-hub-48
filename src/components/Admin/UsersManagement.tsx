
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SuperAdminGuard } from '@/components/PermissionGuard';
import { DataTable, renderBadge, renderStatus, renderEmail } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { UserDialog } from './UserDialog';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  is_active: boolean;
  user_type: 'super_admin' | 'contratante' | 'operador';
  company_name: string;
  company_id: string;
  access_level_name?: string;
  created_at: string;
  last_login_at?: string;
}

export function UsersManagement() {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: users = [], refetch, isLoading } = useQuery({
    queryKey: ['admin-all-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('user_companies')
        .select(`
          *,
          profiles:user_id (
            display_name, 
            email,
            last_sign_in_at
          ),
          companies:company_id (name),
          access_levels:access_level_id (
            name,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        // Filtrar por nome ou email
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id')
          .or(`display_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        
        if (profilesData && profilesData.length > 0) {
          const userIds = profilesData.map(p => p.user_id);
          query = query.in('user_id', userIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(user => ({
        id: user.id,
        user_id: user.user_id,
        display_name: user.profiles?.display_name || 'Sem nome',
        email: user.profiles?.email || 'Sem email',
        is_active: user.is_active,
        user_type: user.user_type,
        company_name: user.companies?.name || 'Sem empresa',
        company_id: user.company_id,
        access_level_name: user.access_levels?.display_name,
        created_at: user.created_at,
        last_login_at: user.profiles?.last_sign_in_at
      })) as UserData[];
    }
  });

  const handleEdit = (user: UserData) => {
    // Transformar dados para o formato esperado pelo modal
    const transformedUser = {
      id: user.user_id,
      user_id: user.user_id,
      display_name: user.display_name,
      email: user.email,
      is_active: user.is_active,
      user_companies: [{
        id: user.id,
        company_id: user.company_id,
        user_type: user.user_type,
        permissions: {},
        access_level_id: null
      }]
    };
    setSelectedUser(transformedUser);
    setShowUserDialog(true);
  };

  const handleToggleStatus = async (user: UserData) => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('user_id', user.user_id);

      if (profileError) throw profileError;

      const { error: userCompanyError } = await supabase
        .from('user_companies')
        .update({ is_active: !user.is_active })
        .eq('user_id', user.user_id);

      if (userCompanyError) throw userCompanyError;

      toast({
        title: "Sucesso",
        description: `Usuário ${!user.is_active ? 'ativado' : 'desativado'} com sucesso`,
      });

      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao alterar status do usuário",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (user: UserData) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.display_name}?`)) {
      return;
    }

    try {
      // Primeiro desativar o usuário
      const { error: deactivateError } = await supabase
        .from('user_companies')
        .update({ is_active: false })
        .eq('user_id', user.user_id);

      if (deactivateError) throw deactivateError;

      toast({
        title: "Sucesso",
        description: "Usuário desativado com sucesso",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir usuário",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: 'display_name',
      header: 'Nome',
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string) => renderEmail(value)
    },
    {
      key: 'user_type',
      header: 'Tipo',
      render: (value: string) => {
        const variant = value === 'super_admin' ? 'destructive' : 
                      value === 'contratante' ? 'default' : 'secondary';
        return renderBadge(value, variant);
      }
    },
    {
      key: 'company_name',
      header: 'Empresa'
    },
    {
      key: 'access_level_name',
      header: 'Nível de Acesso',
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value: boolean) => renderStatus(value)
    },
    {
      key: 'created_at',
      header: 'Criado em',
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'last_login_at',
      header: 'Último Login',
      render: (value: string) => value ? new Date(value).toLocaleDateString('pt-BR') : 'Nunca'
    }
  ];

  const actions = [
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleEdit,
      variant: 'outline' as const
    },
    {
      label: 'Alternar Status',
      icon: (user: UserData) => user.is_active ? UserX : UserCheck,
      onClick: handleToggleStatus,
      variant: 'outline' as const,
      className: (user: UserData) => user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
    },
    {
      label: 'Excluir',
      icon: Trash2,
      onClick: handleDelete,
      variant: 'destructive' as const,
      show: (user: UserData) => user.user_type !== 'super_admin'
    }
  ];

  return (
    <SuperAdminGuard>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
            <p className="text-muted-foreground">Gerencie todos os usuários do sistema</p>
          </div>
          <Button onClick={() => setShowUserDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <DataTable
          data={users}
          columns={columns}
          actions={actions}
          loading={isLoading}
          emptyMessage="Nenhum usuário encontrado"
          className="w-full"
        />

        <UserDialog
          open={showUserDialog}
          onOpenChange={setShowUserDialog}
          user={selectedUser}
          onSave={() => {
            refetch();
            setShowUserDialog(false);
            setSelectedUser(undefined);
          }}
        />
      </div>
    </SuperAdminGuard>
  );
}
