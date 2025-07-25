import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Users, Search, Edit, UserCheck, UserX } from 'lucide-react';
import { UserDialog } from './UserDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function UsersManagement() {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_companies')
        .select(`
          *,
          profiles:user_id (display_name, email),
          companies:company_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const filteredUsers = users.filter(user => {
    const profile = user.profiles;
    if (!profile) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.display_name?.toLowerCase().includes(searchLower) ||
      profile.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Usuários</h2>
          <p className="text-muted-foreground">Gerencie usuários do sistema</p>
        </div>
        <Button onClick={() => setShowUserDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{user.profiles?.display_name}</h3>
                <p className="text-sm text-muted-foreground">{user.profiles?.email}</p>
                <p className="text-xs text-muted-foreground">{user.companies?.name}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={user.user_type === 'super_admin' ? 'destructive' : 'default'}>
                  {user.user_type}
                </Badge>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Transformar dados para o formato esperado pelo modal
                    const transformedUser = {
                      id: user.user_id, // Usar user_id como id principal
                      user_id: user.user_id,
                      display_name: user.profiles?.display_name || '',
                      email: user.profiles?.email || '',
                      is_active: user.is_active,
                      user_companies: [{
                        ...user,
                        company_id: user.company_id,
                        user_type: user.user_type,
                        permissions: user.permissions || {}
                      }]
                    };
                    setSelectedUser(transformedUser);
                    setShowUserDialog(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <UserDialog
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        user={selectedUser}
        onSave={() => {
          refetch();
          setShowUserDialog(false);
        }}
      />
    </div>
  );
}