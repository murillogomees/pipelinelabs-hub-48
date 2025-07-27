
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TAX_ORIGINS } from '../types';

interface ProductTaxFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function ProductTaxForm({ data, onChange }: ProductTaxFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Fiscais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ncm_code">Código NCM</Label>
              <Input
                id="ncm_code"
                value={data.ncm_code || ''}
                onChange={(e) => onChange('ncm_code', e.target.value)}
                placeholder="Ex: 12345678"
                maxLength={8}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Nomenclatura Comum do Mercosul
              </p>
            </div>
            <div>
              <Label htmlFor="cest_code">Código CEST</Label>
              <Input
                id="cest_code"
                value={data.cest_code || ''}
                onChange={(e) => onChange('cest_code', e.target.value)}
                placeholder="Ex: 01.001.00"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Código Especificador da Substituição Tributária
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax_origin">Origem</Label>
              <Select
                value={data.tax_origin || 'none'}
                onValueChange={(value) => onChange('tax_origin', value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione uma origem</SelectItem>
                  {Object.entries(TAX_ORIGINS).map(([code, description]) => (
                    <SelectItem key={code} value={code}>
                      {code} - {description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tax_situation">Situação Tributária</Label>
              <Input
                id="tax_situation"
                value={data.tax_situation || ''}
                onChange={(e) => onChange('tax_situation', e.target.value)}
                placeholder="Ex: 102"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item_type">Tipo do Item</Label>
              <Select
                value={data.item_type || 'none'}
                onValueChange={(value) => onChange('item_type', value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione um tipo</SelectItem>
                  <SelectItem value="00">00 - Mercadoria para Revenda</SelectItem>
                  <SelectItem value="01">01 - Matéria-Prima</SelectItem>
                  <SelectItem value="02">02 - Embalagem</SelectItem>
                  <SelectItem value="03">03 - Produto em Processo</SelectItem>
                  <SelectItem value="04">04 - Produto Acabado</SelectItem>
                  <SelectItem value="05">05 - Subproduto</SelectItem>
                  <SelectItem value="06">06 - Produto Intermediário</SelectItem>
                  <SelectItem value="07">07 - Material de Uso e Consumo</SelectItem>
                  <SelectItem value="08">08 - Ativo Imobilizado</SelectItem>
                  <SelectItem value="09">09 - Serviços</SelectItem>
                  <SelectItem value="10">10 - Outros Insumos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product_group">Grupo de Produtos</Label>
              <Input
                id="product_group"
                value={data.product_group || ''}
                onChange={(e) => onChange('product_group', e.target.value)}
                placeholder="Ex: Eletrônicos"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tributos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icms_base">Base de Cálculo ICMS (%)</Label>
              <Input
                id="icms_base"
                type="number"
                step="0.01"
                value={data.icms_base || ''}
                onChange={(e) => onChange('icms_base', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="icms_retention">Retenção ICMS (%)</Label>
              <Input
                id="icms_retention"
                type="number"
                step="0.01"
                value={data.icms_retention || ''}
                onChange={(e) => onChange('icms_retention', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pis_fixed">Valor Fixo PIS (R$)</Label>
              <Input
                id="pis_fixed"
                type="number"
                step="0.01"
                value={data.pis_fixed || ''}
                onChange={(e) => onChange('pis_fixed', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="cofins_fixed">Valor Fixo COFINS (R$)</Label>
              <Input
                id="cofins_fixed"
                type="number"
                step="0.01"
                value={data.cofins_fixed || ''}
                onChange={(e) => onChange('cofins_fixed', parseFloat(e.target.value) || null)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimated_tax_percentage">Porcentagem Total de Tributos Estimados (%)</Label>
            <Input
              id="estimated_tax_percentage"
              type="number"
              step="0.01"
              value={data.estimated_tax_percentage || ''}
              onChange={(e) => onChange('estimated_tax_percentage', parseFloat(e.target.value) || null)}
              placeholder="0.00"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Estimativa total de tributos sobre o preço de venda
            </p>
          </div>

          <div>
            <Label htmlFor="tipi_exception">Exceção TIPI</Label>
            <Input
              id="tipi_exception"
              value={data.tipi_exception || ''}
              onChange={(e) => onChange('tipi_exception', e.target.value)}
              placeholder="Código da exceção TIPI, se aplicável"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
