import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PasswordValidator } from '@/components/ui/password-validator';
import { FormSection } from '@/components/ui/form-section';
import { useUserProfile, useUpdateProfile, useChangePassword } from '@/hooks/useUserProfile';
import { useDocumentValidation } from '@/components/Auth/hooks/useDocumentValidation';
import { useCepApi } from '@/hooks/useCepApi';
import { useUserCompany } from '@/hooks/useUserCompany';
import { User, Camera, Save, Key, MapPin, FileText, Building2 } from 'lucide-react';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { data: profile } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const { handleDocumentChange, validateDocument } = useDocumentValidation();
  const { fetchCep, loading: cepLoading } = useCepApi();
  const { company } = useUserCompany();

  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    document: profile?.document || '',
    document_type: (profile?.document_type || 'cpf') as 'cpf' | 'cnpj',
    address: profile?.address || '',
    zipcode: profile?.zipcode || '',
    city: profile?.city || '',
    state: profile?.state || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        document: profile.document || '',
        document_type: (profile.document_type || 'cpf') as 'cpf' | 'cnpj',
        address: profile.address || '',
        zipcode: profile.zipcode || '',
        city: profile.city || '',
        state: profile.state || '',
      });
    }
  }, [profile]);

  const handleDocumentChangeLocal = (value: string) => {
    handleDocumentChange(
      value, 
      (doc) => setFormData(prev => ({ ...prev, document: doc })),
      (type) => setFormData(prev => ({ ...prev, document_type: type }))
    );
  };

  const handleCepChange = async (cep: string) => {
    setFormData(prev => ({ ...prev, zipcode: cep }));
    
    if (cep.replace(/\D/g, '').length === 8) {
      const cepData = await fetchCep(cep);
      if (cepData) {
        setFormData(prev => ({
          ...prev,
          address: cepData.logradouro,
          city: cepData.localidade,
          state: cepData.uf,
        }));
      }
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar documento se preenchido
    if (formData.document) {
      const documentError = validateDocument(formData.document, formData.document_type);
      if (documentError) {
        return;
      }
    }
    
    updateProfile.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }

    changePassword.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Pessoal</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="address">Endereço</TabsTrigger>
            <TabsTrigger value="password">Senha</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Alterar Foto
              </Button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <FormSection 
                title="Informações Básicas" 
                description="Dados principais do seu perfil"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_name">Nome Completo *</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </FormSection>

              <Button type="submit" disabled={updateProfile.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <FormSection 
              title="Documentos" 
              description="CPF ou CNPJ para identificação" 
              className="space-y-4"
            >
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
                  </p>
                )}
              </div>
            </FormSection>
          </TabsContent>

          <TabsContent value="address" className="space-y-6">
            <FormSection 
              title="Endereço" 
              description="Informações de localização" 
              className="space-y-4"
            >
              <div>
                <Label htmlFor="zipcode">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  CEP
                </Label>
                <Input
                  id="zipcode"
                  value={formData.zipcode}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  disabled={cepLoading}
                />
                {cepLoading && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
              </div>
              
              <div>
                <Label htmlFor="address">Logradouro</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, Av, etc."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </FormSection>

            {company && (
              <FormSection 
                title="Empresa Vinculada" 
                description="Informações da empresa associada ao seu perfil"
                className="space-y-4"
              >
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="w-4 h-4" />
                    <h4 className="font-medium">{company.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">CNPJ: {company.document}</p>
                </div>
              </FormSection>
            )}
          </TabsContent>

          <TabsContent value="password" className="space-y-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Digite a nova senha"
                />
                {passwordData.newPassword && (
                  <PasswordValidator password={passwordData.newPassword} />
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirme a nova senha"
                />
              </div>

              {passwordData.newPassword && passwordData.confirmPassword && 
               passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-sm text-destructive">As senhas não coincidem</p>
              )}

              <Button 
                type="submit" 
                disabled={
                  changePassword.isPending || 
                  !passwordData.currentPassword || 
                  !passwordData.newPassword || 
                  passwordData.newPassword !== passwordData.confirmPassword
                }
              >
                <Key className="w-4 h-4 mr-2" />
                {changePassword.isPending ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}