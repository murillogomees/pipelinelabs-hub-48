
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FormSection } from '@/components/ui/form-section';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useDocumentValidation } from '@/components/Auth/hooks/useDocumentValidation';
import { Crown, Shield, User, Loader2, FileText, Building2 } from 'lucide-react';

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
    document: '',
    document_type: 'cpf' as 'cpf' | 'cnpj',
    phone: '',
    access_level_id: '',
    is_active: true,
    // Campos de empresa (para usuários com CNPJ)
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const { toast } = useToast();
  const { handleDocumentChange, validateDocument } = useDocumentValidation();

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
        document: user.document || '',
        document_type: user.document_type || 'cpf',
        phone: user.phone || '',
        access_level_id: user.access_levels?.id || '',
        is_active: user.is_active,
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
      });
      setShowCompanyFields(user.document_type === 'cnpj');
    } else {
      setFormData({
        display_name: '',
        email: '',
        password: '',
        document: '',
        document_type: 'cpf',
        phone: '',
        access_level_id: '',
        is_active: true,
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
      });
      setShowCompanyFields(false);
    }
  }, [user]);

  const handleDocumentChangeLocal = (value: string) => {
    handleDocumentChange(
      value, 
      (doc) => setFormData(prev => ({ ...prev, document: doc })),
      (type) => {
        setFormData(prev => ({ ...prev, document_type: type }));
        setShowCompanyFields(type === 'cnpj');
        
        // Auto-definir access_level baseado no tipo de documento
        if (!user) { // Apenas para novos usuários
          const operadorLevel = accessLevels.find(level => level.name === 'operador');
          const contratanteLevel = accessLevels.find(level => level.name === 'contratante');
          
          if (type === 'cpf' && operadorLevel) {
            setFormData(prev => ({ ...prev, access_level_id: operadorLevel.id }));
          } else if (type === 'cnpj' && contratanteLevel) {
            setFormData(prev => ({ ...prev, access_level_id: contratanteLevel.id }));
          }
        }
      }
    );
  };

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
      // Validar documento se preenchido
      if (formData.document) {
        const documentError = validateDocument(formData.document, formData.document_type);
        if (documentError) {
          toast({
            title: "Erro de validação",
            description: documentError,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      if (user) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: formData.display_name,
            document: formData.document,
            document_type: formData.document_type,
            phone: formData.phone,
            person_type: formData.document_type === 'cnpj' ? 'company' : 'individual',
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
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: formData.display_name
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          let companyId = null;

          // Se for CNPJ, criar empresa automaticamente
          if (formData.document_type === 'cnpj' && showCompanyFields) {
            const { data: companyData, error: companyError } = await supabase
              .from('companies')
              .insert({
                name: formData.company_name,
                document: formData.document,
                email: formData.company_email || formData.email,
                phone: formData.company_phone,
                address: formData.company_address,
                user_id: authData.user.id
              })
              .select()
              .single();

            if (companyError) throw companyError;
            companyId = companyData.id;

            // Criar relação user_companies
            const { error: userCompanyError } = await supabase
              .from('user_companies')
              .insert({
                user_id: authData.user.id,
                company_id: companyId,
                role: 'contratante',
                is_active: true
              });

            if (userCompanyError) throw userCompanyError;
          }

          // Atualizar o perfil criado automaticamente
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              display_name: formData.display_name,
              document: formData.document,
              document_type: formData.document_type,
              phone: formData.phone,
              person_type: formData.document_type === 'cnpj' ? 'company' : 'individual',
              access_level_id: formData.access_level_id,
              is_active: formData.is_active,
              companie_id: companyId
            })
            .eq('user_id', authData.user.id);

          if (profileError) throw profileError;
        }

        toast({
          title: "Sucesso",
          description: `Usuário ${formData.document_type === 'cnpj' ? 'e empresa' : ''} criado${formData.document_type === 'cnpj' ? 's' : ''} com sucesso`,
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
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
          <FormSection title="Informações Básicas" description="Dados principais do usuário">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_name">Nome Completo *</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
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
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="Documentação" description="CPF para operador, CNPJ para contratante">
            <div>
              <Label htmlFor="document">
                <FileText className="w-4 h-4 inline mr-2" />
                Documento (CPF/CNPJ)
              </Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => handleDocumentChangeLocal(e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
              {formData.document && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tipo: {formData.document_type === 'cpf' ? 'CPF (Pessoa Física)' : 'CNPJ (Pessoa Jurídica)'}
                  {!user && (
                    <span className="ml-2 text-blue-600">
                      → {formData.document_type === 'cpf' ? 'Operador' : 'Contratante'}
                    </span>
                  )}
                </p>
              )}
            </div>
          </FormSection>

          {showCompanyFields && !user && (
            <FormSection title="Dados da Empresa" description="Informações da empresa (CNPJ detectado)">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company_name">Nome da Empresa *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    required={showCompanyFields}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_email">Email da Empresa</Label>
                    <Input
                      id="company_email"
                      type="email"
                      value={formData.company_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_email: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_phone">Telefone da Empresa</Label>
                    <Input
                      id="company_phone"
                      value={formData.company_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_phone: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company_address">Endereço da Empresa</Label>
                  <Input
                    id="company_address"
                    value={formData.company_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_address: e.target.value }))}
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </FormSection>
          )}

          <FormSection title="Permissões" description="Nível de acesso e status">
            <div className="space-y-4">
              <div>
                <Label htmlFor="access_level">Nível de Acesso</Label>
                <Select 
                  value={formData.access_level_id || 'none'} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, access_level_id: value === 'none' ? '' : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível de acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione um nível</SelectItem>
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
            </div>
          </FormSection>

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
