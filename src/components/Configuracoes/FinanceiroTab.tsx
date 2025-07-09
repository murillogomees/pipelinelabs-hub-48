import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export function FinanceiroTab() {
  const { settings, loading, updateSettings } = useCompanySettings();
  const [formData, setFormData] = useState({
    moeda: 'BRL',
    conta_padrao: '',
    categoria_receita: '',
    categoria_despesa: '',
    prazo_pagamento: '',
    formas_pagamento: [] as string[]
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        moeda: settings.moeda || 'BRL',
        conta_padrao: settings.conta_padrao || '',
        categoria_receita: '',
        categoria_despesa: '',
        prazo_pagamento: '',
        formas_pagamento: Array.isArray(settings.formas_pagamento_ativas) 
          ? (settings.formas_pagamento_ativas as string[]) 
          : []
      });
    }
  }, [settings]);

  const handleFormaPagamentoChange = (forma: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      formas_pagamento: checked
        ? [...prev.formas_pagamento, forma]
        : prev.formas_pagamento.filter(f => f !== forma)
    }));
  };

  const handleSave = async () => {
    await updateSettings({
      moeda: formData.moeda,
      conta_padrao: formData.conta_padrao,
      formas_pagamento_ativas: formData.formas_pagamento
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Financeiras</CardTitle>
        <CardDescription>Configure os parâmetros financeiros da sua empresa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="moeda">Moeda Padrão</Label>
            <Select value={formData.moeda} onValueChange={(value) => setFormData(prev => ({ ...prev, moeda: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conta_padrao">Conta Bancária Padrão</Label>
            <Input
              id="conta_padrao"
              value={formData.conta_padrao}
              onChange={(e) => setFormData(prev => ({ ...prev, conta_padrao: e.target.value }))}
              placeholder="Banco do Brasil - C/C 12345-6"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria_receita">Categoria Padrão de Receita</Label>
            <Input
              id="categoria_receita"
              value={formData.categoria_receita}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria_receita: e.target.value }))}
              placeholder="Vendas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria_despesa">Categoria Padrão de Despesa</Label>
            <Input
              id="categoria_despesa"
              value={formData.categoria_despesa}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria_despesa: e.target.value }))}
              placeholder="Operacionais"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prazo_pagamento">Prazo Médio de Pagamento (dias)</Label>
            <Input
              id="prazo_pagamento"
              type="number"
              value={formData.prazo_pagamento}
              onChange={(e) => setFormData(prev => ({ ...prev, prazo_pagamento: e.target.value }))}
              placeholder="30"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Formas de Pagamento Ativas</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'pix', label: 'PIX' },
              { id: 'cartao_credito', label: 'Cartão de Crédito' },
              { id: 'cartao_debito', label: 'Cartão de Débito' },
              { id: 'boleto', label: 'Boleto' },
              { id: 'dinheiro', label: 'Dinheiro' },
              { id: 'transferencia', label: 'Transferência' },
              { id: 'cheque', label: 'Cheque' },
              { id: 'crediario', label: 'Crediário' }
            ].map((forma) => (
              <div key={forma.id} className="flex items-center space-x-2">
                <Checkbox
                  id={forma.id}
                  checked={formData.formas_pagamento.includes(forma.id)}
                  onCheckedChange={(checked) => handleFormaPagamentoChange(forma.id, !!checked)}
                />
                <Label htmlFor={forma.id}>{forma.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Salvar Configurações Financeiras
        </Button>
      </CardContent>
    </Card>
  );
}