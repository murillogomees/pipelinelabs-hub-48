import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
  onSave: () => void;
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    phone: '',
    is_active: true,
    role: 'user',
    password: '',
    company_id: '',
    permissions: {
      dashboard: true,
      vendas: true,
      produtos: true,
      clientes: true,
      financeiro: true,
      notas_fiscais: true,
      producao: false,
      admin: false
    }
  });

  const { toast } = useToast();

  // Carregar empresas
  useEffect(() => {
    const loadCompanies = async () => {
      const { data: companiesData } = await supabase
        .from('companies')
        .select('id, name');
      
      if (companiesData) {
        setCompanies(companiesData);
      }
    };
    
    loadCompanies();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        email: user.email || '',
        phone: user.phone || '',
        is_active: user.is_active,
        role: user.user_companies[0]?.role || 'user',
        password: '',
        company_id: user.user_companies[0]?.company_id || '',
        permissions: {
          dashboard: true,
          vendas: true,
          produtos: true,
          clientes: true,
          financeiro: true,
          notas_fiscais: true,
          producao: false,
          admin: false,
          ...user.user_companies[0]?.permissions
        }
      });
    } else {
      setFormData({
        display_name: '',
        email: '',
        phone: '',
        is_active: true,
        role: 'user',
        password: '',
        company_id: '',
        permissions: {
          dashboard: true,
          vendas: true,
          produtos: true,
          clientes: true,
          financeiro: true,
          notas_fiscais: true,
          producao: false,
          admin: false
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Editar usuário existente
        await updateUser();
      } else {
        // Criar novo usuário
        await createUser();
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    // Primeiro, criar o usuário no auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          display_name: formData.display_name
        }
      }
    });

    if (authError) {
      toast({
        title: "Erro",
        description: authError.message,
        variant: "destructive",
      });
      return;
    }

    if (!authData.user) {
      toast({
        title: "Erro",
        description: "Falha ao criar usuário",
        variant: "destructive",
      });
      return;
    }

    // Aguardar um pouco para o trigger criar o perfil
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Atualizar o perfil com os dados do formulário
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: formData.display_name,
        phone: formData.phone,
        is_active: formData.is_active
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      console.error('Erro ao atualizar perfil:', profileError);
      toast({
        title: "Aviso",
        description: "Usuário criado, mas falha ao atualizar perfil",
        variant: "destructive",
      });
    }

    // Obter a empresa do usuário atual
    const { data: currentUserCompany } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (currentUserCompany) {
    // Criar associação do novo usuário com a empresa selecionada
      const { error: companyError } = await supabase
        .from('user_companies')
        .insert({
          user_id: authData.user.id,
          company_id: formData.company_id || currentUserCompany.company_id,
          role: formData.role,
          permissions: formData.permissions,
          is_active: formData.is_active
        });

      if (companyError) {
        console.error('Erro ao associar usuário à empresa:', companyError);
        toast({
          title: "Aviso",
          description: "Usuário criado, mas falha ao associar à empresa",
          variant: "destructive",
        });
      }
    }

    toast({
      title: "Sucesso",
      description: "Usuário criado com sucesso",
    });

    onSave();
    onOpenChange(false);
  };

  const updateUser = async () => {
    // Atualizar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: formData.display_name,
        phone: formData.phone,
        is_active: formData.is_active
      })
      .eq('user_id', user.user_id);

    if (profileError) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil",
        variant: "destructive",
      });
      return;
    }

    // Atualizar associação com empresa
    const { error: companyError } = await supabase
      .from('user_companies')
      .update({
        role: formData.role,
        permissions: formData.permissions,
        is_active: formData.is_active
      })
      .eq('user_id', user.user_id);

    if (companyError) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar dados da empresa",
        variant: "destructive",
      });
      return;
    }

    // Se foi fornecida uma nova senha, atualizar
    if (formData.password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        user.user_id,
        { password: formData.password }
      );

      if (passwordError) {
        toast({
          title: "Aviso",
          description: "Dados atualizados, mas falha ao alterar senha",
          variant: "destructive",
        });
      }
    }

    toast({
      title: "Sucesso",
      description: "Usuário atualizado com sucesso",
    });

    onSave();
    onOpenChange(false);
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Nome Completo</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Nome completo do usuário"
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
                placeholder="email@exemplo.com"
                required
                disabled={!!user} // Não permitir alterar email de usuário existente
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_id">Empresa</Label>
              <Select 
                value={formData.company_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value }))}
                disabled={!!user} // Não permitir alterar empresa de usuário existente
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {user ? 'Nova Senha (deixe em branco para manter atual)' : 'Senha'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Digite a senha"
                required={!user}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Permissões de Acesso</Label>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              {Object.entries(formData.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="text-sm font-normal">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => handlePermissionChange(key, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Usuário ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}