import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserDialog } from "@/components/Admin/UserDialog";
import { CompanyDialog } from "@/components/Admin/CompanyDialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserCheck, UserX, Building2, Users, Settings, Eye, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { SuperAdminGuard } from "@/components/PermissionGuard";

type UserType = 'super_admin' | 'contratante' | 'operador';

export default function AdminUsuarios() {
  const { isSuperAdmin } = usePermissions();
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(undefined);

  // Buscar usuários com informações da empresa e tipo
  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      if (!isSuperAdmin) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          display_name,
          email,
          avatar_url,
          created_at,
          user_companies!inner(
            user_type,
            role,
            department,
            is_active,
            company_id,
            companies(name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data?.map((profile) => {
        const userCompany = profile.user_companies?.[0];
        return {
          id: profile.id,
          user_id: profile.user_id,
          display_name: profile.display_name || "",
          email: profile.email || "",
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          user_type: userCompany?.user_type as UserType,
          role: userCompany?.role || "",
          department: userCompany?.department,
          is_active: userCompany?.is_active || false,
          company_name: userCompany?.companies?.name || "",
          company_id: userCompany?.company_id || "",
        };
      }) || [];
    },
    enabled: isSuperAdmin,
  });

  const { data: companies = [], refetch: refetchCompanies } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: async () => {
      if (!isSuperAdmin) return [];
      
      const { data, error } = await supabase
        .from("companies")
        .select(`
          id,
          name,
          document,
          email,
          phone,
          created_at,
          user_companies(count),
          subscriptions(
            status,
            plans(name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data?.map((company) => ({
        id: company.id,
        name: company.name,
        document: company.document,
        email: company.email,
        phone: company.phone,
        created_at: company.created_at,
        user_count: company.user_companies?.[0]?.count || 0,
        active_subscription: company.subscriptions?.[0]?.status === 'active',
        plan_name: company.subscriptions?.[0]?.plans?.name,
      })) || [];
    },
    enabled: isSuperAdmin,
  });

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setShowUserDialog(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleUserSaved = () => {
    refetchUsers();
    setShowUserDialog(false);
  };

  const handleCompanySaved = () => {
    refetchCompanies();
    setShowCompanyDialog(false);
  };

  const getUserTypeLabel = (userType: UserType) => {
    const labels = {
      super_admin: "Super Admin",
      contratante: "Contratante", 
      operador: "Operador"
    };
    return labels[userType];
  };

  const getUserTypeBadgeVariant = (userType: UserType) => {
    const variants = {
      super_admin: "destructive" as const,
      contratante: "default" as const,
      operador: "secondary" as const
    };
    return variants[userType];
  };

  return (
    <SuperAdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestão de Usuários</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gerencie usuários e empresas do sistema
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setShowCompanyDialog(true)} variant="outline" className="w-full sm:w-auto">
              <Building2 className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
            <Button onClick={handleCreateUser} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total Usuários</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Empresas</p>
                  <p className="text-2xl font-bold">{companies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium">Usuários Inativos</p>
                  <p className="text-2xl font-bold">{users.filter(u => !u.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              Lista de todos os usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{user.display_name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.company_name}</p>
                      {user.department && (
                        <p className="text-xs text-muted-foreground">Dept: {user.department}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getUserTypeBadgeVariant(user.user_type)}>
                      {getUserTypeLabel(user.user_type)}
                    </Badge>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas Cadastradas</CardTitle>
            <CardDescription>
              Empresas registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.document}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {company.user_count} usuários
                    </Badge>
                    <Badge variant={company.active_subscription ? "default" : "secondary"}>
                      {company.plan_name || "Sem plano"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <UserDialog 
          open={showUserDialog} 
          onOpenChange={setShowUserDialog}
          user={selectedUser}
          onSave={handleUserSaved}
        />
        
        <CompanyDialog 
          open={showCompanyDialog} 
          onOpenChange={setShowCompanyDialog}
          onCompanyCreated={handleCompanySaved}
        />
      </div>
    </SuperAdminGuard>
  );
}