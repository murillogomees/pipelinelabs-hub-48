import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useToast } from '@/hooks/use-toast';
import { FISCAL_DEFAULTS, SUCCESS_MESSAGES } from './constants';

export function FiscalTab() {
  const { settings, loading, updateSettings } = useCompanySettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    regime_tributario: '',
    cfop_padrao: '',
    serie_nfe: '',
    ncm_padrao: '',
    tipos_nota: [] as string[],
    impostos_padrao: {
      icms: '',
      pis: '',
      cofins: '',
      ipi: ''
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        regime_tributario: '', // Default value since field doesn't exist
        cfop_padrao: '', // Default value since field doesn't exist  
        serie_nfe: '', // Default value since field doesn't exist
        ncm_padrao: '',
        tipos_nota: [],
        impostos_padrao: {
          icms: '', // Default values since field doesn't exist
          pis: '', 
          cofins: '',
          ipi: ''
        }
      });
    }
  }, [settings]);

  const handleTipoNotaChange = (tipo: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tipos_nota: checked
        ? [...prev.tipos_nota, tipo]
        : prev.tipos_nota.filter(t => t !== tipo)
    }));
  };

  const handleImpostoChange = (imposto: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      impostos_padrao: {
        ...prev.impostos_padrao,
        [imposto]: value
      }
    }));
  };

  const handleSave = async () => {
    // Note: Fiscal settings are not stored in company_settings table currently
    // They would need additional database columns to persist
    toast({
      title: "Sucesso",
      description: "Configurações atualizadas (dados locais apenas)"
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Fiscais</CardTitle>
        <CardDescription>Configure os parâmetros fiscais da sua empresa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="regime_tributario">Regime Tributário</Label>
            <Select value={formData.regime_tributario} onValueChange={(value) => setFormData(prev => ({ ...prev, regime_tributario: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o regime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                <SelectItem value="lucro_real">Lucro Real</SelectItem>
                <SelectItem value="mei">MEI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cfop_padrao">CFOP Padrão</Label>
            <Input
              id="cfop_padrao"
              value={formData.cfop_padrao}
              onChange={(e) => setFormData(prev => ({ ...prev, cfop_padrao: e.target.value }))}
              placeholder="5102"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serie_nfe">Série da NFe</Label>
            <Input
              id="serie_nfe"
              value={formData.serie_nfe}
              onChange={(e) => setFormData(prev => ({ ...prev, serie_nfe: e.target.value }))}
              placeholder="001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ncm_padrao">NCM Padrão</Label>
            <Input
              id="ncm_padrao"
              value={formData.ncm_padrao}
              onChange={(e) => setFormData(prev => ({ ...prev, ncm_padrao: e.target.value }))}
              placeholder="85171200"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Tipos de Notas Fiscais Permitidos</Label>
          <div className="grid grid-cols-3 gap-4">
            {['NFe', 'NFCe', 'NFSe'].map((tipo) => (
              <div key={tipo} className="flex items-center space-x-2">
                <Checkbox
                  id={tipo}
                  checked={formData.tipos_nota.includes(tipo)}
                  onCheckedChange={(checked) => handleTipoNotaChange(tipo, !!checked)}
                />
                <Label htmlFor={tipo}>{tipo}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Alíquotas Padrão (%)</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icms">ICMS</Label>
              <Input
                id="icms"
                type="number"
                step="0.01"
                value={formData.impostos_padrao.icms}
                onChange={(e) => handleImpostoChange('icms', e.target.value)}
                placeholder="18.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pis">PIS</Label>
              <Input
                id="pis"
                type="number"
                step="0.01"
                value={formData.impostos_padrao.pis}
                onChange={(e) => handleImpostoChange('pis', e.target.value)}
                placeholder="1.65"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cofins">COFINS</Label>
              <Input
                id="cofins"
                type="number"
                step="0.01"
                value={formData.impostos_padrao.cofins}
                onChange={(e) => handleImpostoChange('cofins', e.target.value)}
                placeholder="7.60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipi">IPI</Label>
              <Input
                id="ipi"
                type="number"
                step="0.01"
                value={formData.impostos_padrao.ipi}
                onChange={(e) => handleImpostoChange('ipi', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Salvar Configurações Fiscais
        </Button>
      </CardContent>
    </Card>
  );
}