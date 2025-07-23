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
import { Building2, Save, Eye, Lock, History } from 'lucide-react';
import { useCompanyData } from '@/hooks/useCompanyData';
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
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  legal_name: z.string().optional(),
  trade_name: z.string().optional(),
  document: z.string().min(14, 'CNPJ deve ter 14 dígitos').max(18, 'CNPJ inválido'),
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
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyForm() {
  const { company, isLoading, isUpdating, canEdit, updateCompany } = useCompanyData();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
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
    }
  });

  // Atualizar formulário quando dados da empresa carregarem
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || '',
        legal_name: company.legal_name || '',
        trade_name: company.trade_name || '',
        document: company.document || '',
        email: company.email || '',
        fiscal_email: company.fiscal_email || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        zipcode: company.zipcode || '',
        state_registration: company.state_registration || '',
        municipal_registration: company.municipal_registration || '',
        tax_regime: (company.tax_regime as any) || 'simples_nacional',
        legal_representative: company.legal_representative || '',
      });
    }
  }, [company, form]);

  const onSubmit = async (data: CompanyFormData) => {
    const success = await updateCompany(data);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (company) {
      form.reset({
        name: company.name || '',
        legal_name: company.legal_name || '',
        trade_name: company.trade_name || '',
        document: company.document || '',
        email: company.email || '',
        fiscal_email: company.fiscal_email || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        zipcode: company.zipcode || '',
        state_registration: company.state_registration || '',
        municipal_registration: company.municipal_registration || '',
        tax_regime: (company.tax_regime as any) || 'simples_nacional',
        legal_representative: company.legal_representative || '',
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
            <CardTitle>Empresa Contratante</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando dados da empresa...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Empresa Contratante</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Nenhuma empresa encontrada</div>
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
              <CardTitle>Empresa Contratante</CardTitle>
              <CardDescription>
                Gerencie as informações corporativas da sua empresa
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
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legal_name">Razão Social *</Label>
                <Input
                  id="legal_name"
                  {...form.register('legal_name')}
                  disabled={!canEdit || !isEditing}
                  placeholder="Ex: Pipeline Labs Tecnologia LTDA"
                />
                {form.formState.errors.legal_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.legal_name.message}</p>
                )}
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
                <Label htmlFor="document">CNPJ *</Label>
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
                {form.formState.errors.document && (
                  <p className="text-sm text-destructive">{form.formState.errors.document.message}</p>
                )}
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

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail Principal</Label>
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
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  disabled={!canEdit || !isEditing}
                  placeholder="(11) 99999-9999"
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    form.setValue('phone', formatted);
                  }}
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
            </div>
          </div>

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
              Você não tem permissão para alterar esses dados. Fale com o administrador da plataforma.
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