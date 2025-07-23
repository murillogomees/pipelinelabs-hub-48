import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductPriceFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function ProductPriceForm({ data, onChange }: ProductPriceFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preços</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Preço de Venda *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={data.price || 0}
              onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="promotional_price">Preço Promocional</Label>
            <Input
              id="promotional_price"
              type="number"
              step="0.01"
              value={data.promotional_price || ''}
              onChange={(e) => onChange('promotional_price', parseFloat(e.target.value) || null)}
              placeholder="0.00"
            />
          </div>
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
      </CardContent>
    </Card>
  );
}