
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Crown, Shield, User, Loader2 } from 'lucide-react';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
  onSave: () => void;
}

interface AccessLevel {
  id: string;
  name: string;
  display_name: string;
  description: string;
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    password: '',
    access_level_id: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: accessLevels = [] } = useQuery({
    queryKey: ['access-levels-for-user'],
    queryFn: async (): Promise<AccessLevel[]> => {
      const { data, error } = await supabase
        .from('access_levels')
        .select('id, name, display_name, description')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        email: user.email || '',
        password: '',
        access_level_id: user.access_levels?.id || '',
        is_active: user.is_active
      });
    } else {
      setFormData({
        display_name: '',
        email: '',
        password: '',
        access_level_id: '',
        is_active: true
      });
    }
  }, [user]);

  const getIconForLevel = (name: string) => {
    switch (name) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: formData.display_name,
            access_level_id: formData.access_level_id,
            is_active: formData.is_active
          })
          .eq('user_id', user.user_id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso",
        });
      } else {
        // Criar novo usuário
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              display_name: formData.display_name
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Atualizar o perfil criado automaticamente
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              display_name: formData.display_name,
              access_level_id: formData.access_level_id,
              is_active: formData.is_active
            })
            .eq('user_id', authData.user.id);

          if (profileError) throw profileError;
        }

        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso",
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome de Exibição</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!!user}
              required
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="access_level">Nível de Acesso</Label>
            <Select value={formData.access_level_id} onValueChange={(value) => setFormData(prev => ({ ...prev, access_level_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de acesso" />
              </SelectTrigger>
              <SelectContent>
                {accessLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    <div className="flex items-center space-x-2">
                      {getIconForLevel(level.name)}
                      <span>{level.display_name}</span>
                      <Badge variant="outline" className="ml-2">
                        {level.name}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label>Usuário ativo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {user ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
