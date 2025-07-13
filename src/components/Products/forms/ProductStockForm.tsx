import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PRODUCT_TYPES } from '../types';

interface ProductStockFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function ProductStockForm({ data, onChange }: ProductStockFormProps) {
  // Se for serviço, não exibe controle de estoque
  if (data.product_type === PRODUCT_TYPES.SERVICO) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>Serviços não possuem controle de estoque.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Controle de Estoque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stock_quantity">Quantidade Atual</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={data.stock_quantity || 0}
                onChange={(e) => onChange('stock_quantity', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="min_stock">Estoque Mínimo</Label>
              <Input
                id="min_stock"
                type="number"
                value={data.min_stock || ''}
                onChange={(e) => onChange('min_stock', parseInt(e.target.value) || null)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="max_stock">Estoque Máximo</Label>
              <Input
                id="max_stock"
                type="number"
                value={data.max_stock || ''}
                onChange={(e) => onChange('max_stock', parseInt(e.target.value) || null)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="stock_location">Localização no Estoque</Label>
            <Input
              id="stock_location"
              value={data.stock_location || ''}
              onChange={(e) => onChange('stock_location', e.target.value)}
              placeholder="Ex: A1-B2, Prateleira 3, etc."
            />
          </div>

          <div>
            <Label htmlFor="cost_price">Preço de Custo</Label>
            <Input
              id="cost_price"
              type="number"
              step="0.01"
              value={data.cost_price || ''}
              onChange={(e) => onChange('cost_price', parseFloat(e.target.value) || null)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="stock_notes">Observações do Estoque</Label>
            <Textarea
              id="stock_notes"
              value={data.stock_notes || ''}
              onChange={(e) => onChange('stock_notes', e.target.value)}
              placeholder="Observações sobre o estoque, fornecedores, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crossdocking_days">Crossdocking (dias)</Label>
              <Input
                id="crossdocking_days"
                type="number"
                value={data.crossdocking_days || 0}
                onChange={(e) => onChange('crossdocking_days', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Tempo em dias para crossdocking
              </p>
            </div>
            <div>
              <Label htmlFor="warehouse">Depósito</Label>
              <Input
                id="warehouse"
                value={data.warehouse || ''}
                onChange={(e) => onChange('warehouse', e.target.value)}
                placeholder="Nome do depósito"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}