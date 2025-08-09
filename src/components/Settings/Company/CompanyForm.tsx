
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Save, Eye, Lock, History, Settings, User } from 'lucide-react';
import { useCompanyCompleteData, CompanyCompleteData } from '@/hooks/useCompanyCompleteData';
import { toast } from 'sonner';
import { CompanyAuditLog } from './CompanyAuditLog';

// Função para formatar CNPJ
const formatCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// Função para formatar CEP
const formatCEP = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Função para formatar telefone
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const companySchema = z.object({
  // Dados pessoais do usuário
  user_display_name: z.string().min(1, 'Nome completo é obrigatório'),
  user_email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  user_phone: z.string().optional(),
  user_document: z.string().optional(),
  
  // Dados da empresa
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  legal_name: z.string().optional(),
  trade_name: z.string().optional(),
  document: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  fiscal_email: z.string().email('E-mail fiscal inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
  state_registration: z.string().optional(),
  municipal_registration: z.string().optional(),
  tax_regime: z.enum(['simples_nacional', 'lucro_real', 'lucro_presumido']).optional(),
  legal_representative: z.string().optional(),
  
  // Campos de configurações
  nfe_environment: z.enum(['sandbox', 'production']).optional(),
  nfe_api_token: z.string().optional(),
  certificate_password: z.string().optional(),
  stripe_publishable_key: z.string().optional(),
  cdn_enabled: z.boolean().optional(),
  cdn_url_base: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyForm() {
  const { companyData, isLoading, isUpdating, canEdit, updateCompanyData } = useCompanyCompleteData();
  const [isEditing, setIsEditing] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      // Dados pessoais
      user_display_name: '',
      user_email: '',
      user_phone: '',
      user_document: '',
      
      // Dados da empresa
      name: '',
      legal_name: '',
      trade_name: '',
      document: '',
      email: '',
      fiscal_email: '',
      phone: '',
      address: '',
      city: '',
      zipcode: '',
      state_registration: '',
      municipal_registration: '',
      tax_regime: 'simples_nacional',
      legal_representative: '',
      
      // Configurações
      nfe_environment: 'sandbox',
      nfe_api_token: '',
      certificate_password: '',
      stripe_publishable_key: '',
      cdn_enabled: true,
      cdn_url_base: 'https://cdn.pipelinelabs.app',
    }
  });

  // Atualizar formulário quando dados da empresa carregarem
  useEffect(() => {
    if (companyData) {
      console.log('🔄 Preenchendo formulário com dados completos:', companyData);
      
      form.reset({
        // Dados pessoais do usuário
        user_display_name: companyData.user_display_name || '',
        user_email: companyData.user_email || '',
        user_phone: companyData.user_phone || '',
        user_document: companyData.user_document || '',
        
        // Dados da empresa
        name: companyData.name || '',
        legal_name: companyData.legal_name || '',
        trade_name: companyData.trade_name || '',
        document: companyData.document || '',
        email: companyData.email || '',
        fiscal_email: companyData.fiscal_email || '',
        phone: companyData.phone || '',
        address: companyData.address || '',
        city: companyData.city || '',
        zipcode: companyData.zipcode || '',
        state_registration: companyData.state_registration || '',
        municipal_registration: companyData.municipal_registration || '',
        tax_regime: (companyData.tax_regime as any) || 'simples_nacional',
        legal_representative: companyData.legal_representative || '',
        
        // Configurações
        nfe_environment: (companyData.settings?.nfe_environment as any) || 'sandbox',
        nfe_api_token: companyData.settings?.nfe_api_token || '',
        certificate_password: companyData.settings?.certificate_password || '',
        stripe_publishable_key: companyData.settings?.stripe_publishable_key || '',
        cdn_enabled: companyData.settings?.cdn_enabled ?? true,
        cdn_url_base: companyData.settings?.cdn_url_base || 'https://cdn.pipelinelabs.app',
      });

      console.log('✅ Formulário preenchido automaticamente com dados do usuário e empresa');
    }
  }, [companyData, form]);

  // Se ainda não existe empresa persistida, entrar em modo de edição automaticamente
  useEffect(() => {
    if (canEdit && !isEditing && companyData && !companyData.id) {
      setIsEditing(true);
    }
  }, [canEdit, isEditing, companyData]);

  const onSubmit = async (data: CompanyFormData) => {
    // Separar dados pessoais, empresa e configurações
    const { 
      user_display_name, 
      user_email, 
      user_phone, 
      user_document,
      nfe_environment, 
      nfe_api_token, 
      certificate_password, 
      stripe_publishable_key, 
      cdn_enabled, 
      cdn_url_base, 
      ...companyData 
    } = data;
    
    const updatePayload: Partial<CompanyCompleteData> = {
      // Dados pessoais do usuário
      user_display_name,
      user_email,
      user_phone,
      user_document,
      
      // Dados da empresa
      ...companyData,
      
      // Configurações
      settings: {
        nfe_environment,
        nfe_api_token,
        certificate_password,
        stripe_publishable_key,
        cdn_enabled,
        cdn_url_base,
      }
    };

    const success = await updateCompanyData(updatePayload);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (companyData) {
      form.reset({
        // Dados pessoais
        user_display_name: companyData.user_display_name || '',
        user_email: companyData.user_email || '',
        user_phone: companyData.user_phone || '',
        user_document: companyData.user_document || '',
        
        // Dados da empresa
        name: companyData.name || '',
        legal_name: companyData.legal_name || '',
        trade_name: companyData.trade_name || '',
        document: companyData.document || '',
        email: companyData.email || '',
        fiscal_email: companyData.fiscal_email || '',
        phone: companyData.phone || '',
        address: companyData.address || '',
        city: companyData.city || '',
        zipcode: companyData.zipcode || '',
        state_registration: companyData.state_registration || '',
        municipal_registration: companyData.municipal_registration || '',
        tax_regime: (companyData.tax_regime as any) || 'simples_nacional',
        legal_representative: companyData.legal_representative || '',
        
        // Configurações
        nfe_environment: (companyData.settings?.nfe_environment as any) || 'sandbox',
        nfe_api_token: companyData.settings?.nfe_api_token || '',
        certificate_password: companyData.settings?.certificate_password || '',
        stripe_publishable_key: companyData.settings?.stripe_publishable_key || '',
        cdn_enabled: companyData.settings?.cdn_enabled ?? true,
        cdn_url_base: companyData.settings?.cdn_url_base || 'https://cdn.pipelinelabs.app',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Informações da Empresa</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <div>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais e empresariais
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!canEdit && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Somente Leitura
                </Badge>
              )}
              {canEdit && !isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações de Debug (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && companyData && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Debug:</strong> Empresa ID: {companyData.id} | Role: {companyData.user_company_role} | Can Edit: {canEdit ? 'Sim' : 'Não'}
                </p>
              </div>
            )}

            {/* Informações Pessoais */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Informações Pessoais</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user_display_name">Nome Completo *</Label>
                  <Input
                    id="user_display_name"
                    {...form.register('user_display_name')}
                    disabled={!canEdit || !isEditing}
                    placeholder="Seu nome completo"
                  />
                  {form.formState.errors.user_display_name && (
                    <p className="text-sm text-destructive">{form.formState.errors.user_display_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_email">E-mail Pessoal</Label>
                  <Input
                    id="user_email"
                    type="email"
                    {...form.register('user_email')}
                    disabled={!canEdit || !isEditing}
                    placeholder="seu@email.com"
                  />
                  {form.formState.errors.user_email && (
                    <p className="text-sm text-destructive">{form.formState.errors.user_email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_phone">Telefone</Label>
                  <Input
                    id="user_phone"
                    {...form.register('user_phone')}
                    disabled={!canEdit || !isEditing}
                    placeholder="(11) 99999-9999"
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      form.setValue('user_phone', formatted);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_document">CPF/CNPJ</Label>
                  <Input
                    id="user_document"
                    {...form.register('user_document')}
                    disabled={!canEdit || !isEditing}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    onChange={(e) => {
                      const formatted = formatCNPJ(e.target.value);
                      form.setValue('user_document', formatted);
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Informações da Empresa */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Informações da Empresa</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    disabled={!canEdit || !isEditing}
                    placeholder="Ex: Minha Empresa LTDA"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legal_name">Razão Social</Label>
                  <Input
                    id="legal_name"
                    {...form.register('legal_name')}
                    disabled={!canEdit || !isEditing}
                    placeholder="Ex: Pipeline Labs Tecnologia LTDA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trade_name">Nome Fantasia</Label>
                  <Input
                    id="trade_name"
                    {...form.register('trade_name')}
                    disabled={!canEdit || !isEditing}
                    placeholder="Ex: Pipeline Labs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">CNPJ da Empresa</Label>
                  <Input
                    id="document"
                    {...form.register('document')}
                    disabled={!canEdit || !isEditing}
                    placeholder="00.000.000/0000-00"
                    onChange={(e) => {
                      const formatted = formatCNPJ(e.target.value);
                      form.setValue('document', formatted);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Empresarial</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    disabled={!canEdit || !isEditing}
                    placeholder="contato@empresa.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscal_email">E-mail Fiscal</Label>
                  <Input
                    id="fiscal_email"
                    type="email"
                    {...form.register('fiscal_email')}
                    disabled={!canEdit || !isEditing}
                    placeholder="fiscal@empresa.com"
                  />
                  {form.formState.errors.fiscal_email && (
                    <p className="text-sm text-destructive">{form.formState.errors.fiscal_email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone Empresarial</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    disabled={!canEdit || !isEditing}
                    placeholder="(11) 3333-3333"
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      form.setValue('phone', formatted);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_regime">Regime Tributário</Label>
                  <Select
                    disabled={!canEdit || !isEditing}
                    value={form.watch('tax_regime')}
                    onValueChange={(value) => form.setValue('tax_regime', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o regime" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                      <SelectItem value="lucro_real">Lucro Real</SelectItem>
                      <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Endereço */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    {...form.register('address')}
                    disabled={!canEdit || !isEditing}
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    {...form.register('city')}
                    disabled={!canEdit || !isEditing}
                    placeholder="São Paulo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipcode">CEP</Label>
                  <Input
                    id="zipcode"
                    {...form.register('zipcode')}
                    disabled={!canEdit || !isEditing}
                    placeholder="00000-000"
                    onChange={(e) => {
                      const formatted = formatCEP(e.target.value);
                      form.setValue('zipcode', formatted);
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Inscrições */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Inscrições</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state_registration">Inscrição Estadual</Label>
                  <Input
                    id="state_registration"
                    {...form.register('state_registration')}
                    disabled={!canEdit || !isEditing}
                    placeholder="123.456.789.012"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipal_registration">Inscrição Municipal</Label>
                  <Input
                    id="municipal_registration"
                    {...form.register('municipal_registration')}
                    disabled={!canEdit || !isEditing}
                    placeholder="12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legal_representative">Responsável Legal</Label>
                  <Input
                    id="legal_representative"
                    {...form.register('legal_representative')}
                    disabled={!canEdit || !isEditing}
                    placeholder="Nome do responsável legal"
                  />
                </div>
              </div>
            </div>

            {/* Configurações Avançadas */}
            {canEdit && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Configurações do Sistema</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {showAdvancedSettings ? 'Ocultar' : 'Mostrar'} Configurações
                    </Button>
                  </div>

                  {showAdvancedSettings && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="nfe_environment">Ambiente NFe</Label>
                        <Select
                          disabled={!canEdit || !isEditing}
                          value={form.watch('nfe_environment')}
                          onValueChange={(value) => form.setValue('nfe_environment', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o ambiente" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">Homologação</SelectItem>
                            <SelectItem value="production">Produção</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nfe_api_token">Token API NFe</Label>
                        <Input
                          id="nfe_api_token"
                          type="password"
                          {...form.register('nfe_api_token')}
                          disabled={!canEdit || !isEditing}
                          placeholder="Token da API NFe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="certificate_password">Senha do Certificado Digital</Label>
                        <Input
                          id="certificate_password"
                          type="password"
                          {...form.register('certificate_password')}
                          disabled={!canEdit || !isEditing}
                          placeholder="Senha do certificado A1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stripe_publishable_key">Chave Pública Stripe</Label>
                        <Input
                          id="stripe_publishable_key"
                          {...form.register('stripe_publishable_key')}
                          disabled={!canEdit || !isEditing}
                          placeholder="pk_test_..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cdn_url_base">URL Base do CDN</Label>
                        <Input
                          id="cdn_url_base"
                          {...form.register('cdn_url_base')}
                          disabled={!canEdit || !isEditing}
                          placeholder="https://cdn.pipelinelabs.app"
                        />
                      </div>

                      <div className="space-y-2 flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="cdn_enabled"
                          {...form.register('cdn_enabled')}
                          disabled={!canEdit || !isEditing}
                          className="rounded"
                        />
                        <Label htmlFor="cdn_enabled">CDN Habilitado</Label>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Botões de Ação */}
            {canEdit && isEditing && (
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            )}

            {!canEdit && (
              <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg text-muted-foreground">
                <Lock className="h-4 w-4" />
                Você não tem permissão para alterar esses dados. Entre em contato com o administrador da plataforma.
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Histórico de Alterações */}
      <CompanyAuditLog />
    </div>
  );
}
