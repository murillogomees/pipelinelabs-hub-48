import { useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserDialog } from "@/components/Admin/UserDialog";
import { CompanyDialog } from "@/components/Admin/CompanyDialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserCheck, UserX, Building2, Users } from "lucide-react";

export function AdminUsuarios() {
  const { user } = useAuth();
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - em produção viria do hook useUsers
  const users = [
    {
      id: "1",
      display_name: "João Silva",
      email: "joao@example.com",
      is_active: true,
      companies: ["Pipeline Labs"],
      role: "admin"
    },
    {
      id: "2", 
      display_name: "Maria Santos",
      email: "maria@example.com",
      is_active: true,
      companies: ["Empresa A"],
      role: "user"
    }
  ];

  const companies = [
    {
      id: "1",
      name: "Pipeline Labs",
      document: "12.345.678/0001-90",
      is_active: true,
      users_count: 5
    },
    {
      id: "2",
      name: "Empresa A", 
      document: "98.765.432/0001-10",
      is_active: true,
      users_count: 3
    }
  ];

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie usuários e empresas do sistema
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={() => setShowCompanyDialog(true)} variant="outline">
            <Building2 className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
          <Button onClick={() => setShowUserDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Building2 className="h-4 w-4 text-blue-500" />
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
              <UserX className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Usuários Inativos</p>
                <p className="text-2xl font-bold">{users.filter(u => !u.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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

      {/* Users Table */}
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
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{user.display_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.companies.join(', ')}
                    </p>
                  </div>
                  
                  <Badge variant={user.is_active ? 'default' : 'destructive'}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Companies Section */}
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
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.document}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{company.users_count} usuários</p>
                  </div>
                  
                  <Badge variant={company.is_active ? 'default' : 'destructive'}>
                    {company.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                  
                  <Button variant="outline" size="sm">
                    Gerenciar
                  </Button>
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
        onSave={() => setShowUserDialog(false)}
      />
      
      <CompanyDialog 
        open={showCompanyDialog} 
        onOpenChange={setShowCompanyDialog}
        onCompanyCreated={() => setShowCompanyDialog(false)}
      />
    </div>
  );
}