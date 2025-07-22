import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamMembers, useInviteTeamMember, useRemoveTeamMember } from '@/hooks/useTeamManagement';
import { usePermissions } from '@/hooks/usePermissions';
import { User, UserPlus, Mail, Trash2, Shield, Users } from 'lucide-react';

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamManagementDialog({ open, onOpenChange }: TeamManagementDialogProps) {
  const { isAdmin } = usePermissions();
  const { data: teamMembers = [] } = useTeamMembers();
  const inviteTeamMember = useInviteTeamMember();
  const removeTeamMember = useRemoveTeamMember();

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user',
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteTeamMember.mutate(inviteForm, {
      onSuccess: () => {
        setInviteForm({ email: '', role: 'user' });
      },
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Tem certeza que deseja remover este membro da equipe?')) {
      removeTeamMember.mutate(memberId);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'user': return 'Usuário';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'user': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Minha Equipe</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite New Member */}
          {isAdmin && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Convidar Novo Membro</h3>
              <form onSubmit={handleInvite} className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email">Email do Convidado</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="usuario@empresa.com"
                    required
                  />
                </div>
                <div className="w-48">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={inviteTeamMember.isPending}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {inviteTeamMember.isPending ? 'Enviando...' : 'Convidar'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Team Members List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Membros da Equipe ({teamMembers.length})</h3>
            
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum membro encontrado</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.profiles?.avatar_url} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h4 className="font-medium">
                          {member.profiles?.display_name || member.profiles?.email || 'Usuário'}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{member.profiles?.email}</span>
                        </div>
                        {member.last_login && (
                          <p className="text-xs text-muted-foreground">
                            Último acesso: {new Date(member.last_login).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {getRoleLabel(member.role)}
                      </Badge>
                      
                      {member.is_active ? (
                        <Badge variant="outline" className="text-green-600">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600">
                          Pendente
                        </Badge>
                      )}

                      {isAdmin && member.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
