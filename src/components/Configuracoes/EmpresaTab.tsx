import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { COMPANY_DEFAULTS, SUCCESS_MESSAGES, ERROR_MESSAGES, LOADING_MESSAGES } from './constants';

export function EmpresaTab() {
  const { settings, loading, updateSettings } = useCompanySettings();
  const { toast } = useToast();
  const [company, setCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    ...COMPANY_DEFAULTS
  });

  useEffect(() => {
    fetchCompanyData();
  }, []);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        document: company.document || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zipcode: company.zipcode || '',
        timezone: settings?.timezone || 'America/Sao_Paulo',
        idioma: settings?.idioma || 'pt-BR'
      });
    }
  }, [company, settings]);

  const fetchCompanyData = async () => {
    try {
      const { data: userCompany } = await supabase.rpc('get_user_company_id');
      if (userCompany) {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', userCompany)
          .single();
        
        if (error) throw error;
        setCompany(data);
      }
    } catch (error) {
      // Error loading company data
    }
  };

  const handleSave = async () => {
    try {
      // Update company data
      if (company) {
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            name: formData.name,
            document: formData.document,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipcode: formData.zipcode
          })
          .eq('id', company.id);

        if (companyError) throw companyError;
      }

      // Update settings
      await updateSettings({
        timezone: formData.timezone,
        idioma: formData.idioma
      });

      toast({
        title: "Sucesso",
        description: "Dados da empresa atualizados com sucesso"
      });
    } catch (error) {
      // Error saving company data
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Empresa</CardTitle>
        <CardDescription>Gerencie os dados básicos da sua empresa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome fantasia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">CNPJ/CPF</Label>
            <Input
              id="document"
              value={formData.document}
              onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contato@empresa.com"
            />
          </div>

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
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Rua, número, complemento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="São Paulo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                <SelectItem value="PR">Paraná</SelectItem>
                <SelectItem value="SC">Santa Catarina</SelectItem>
                <SelectItem value="BA">Bahia</SelectItem>
                <SelectItem value="GO">Goiás</SelectItem>
                <SelectItem value="ES">Espírito Santo</SelectItem>
                <SelectItem value="DF">Distrito Federal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipcode">CEP</Label>
            <Input
              id="zipcode"
              value={formData.zipcode}
              onChange={(e) => setFormData(prev => ({ ...prev, zipcode: e.target.value }))}
              placeholder="00000-000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                <SelectItem value="America/Rio_Branco">Rio Branco (UTC-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idioma">Idioma</Label>
            <Select value={formData.idioma} onValueChange={(value) => setFormData(prev => ({ ...prev, idioma: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}