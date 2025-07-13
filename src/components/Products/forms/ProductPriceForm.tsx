import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface ProductPriceFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function ProductPriceForm({ data, onChange }: ProductPriceFormProps) {
  const priceList = data.price_list || [];

  const addPriceEntry = () => {
    const newEntry = {
      channel: '',
      price: 0,
      promotional_price: 0,
      start_date: '',
      end_date: ''
    };
    onChange('price_list', [...priceList, newEntry]);
  };

  const removePriceEntry = (index: number) => {
    const updated = priceList.filter((_: any, i: number) => i !== index);
    onChange('price_list', updated);
  };

  const updatePriceEntry = (index: number, field: string, value: any) => {
    const updated = priceList.map((item: any, i: number) => 
      i === index ? { ...item, [field]: value } : item
    );
    onChange('price_list', updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preço Principal</CardTitle>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="free_shipping"
              checked={data.free_shipping || false}
              onCheckedChange={(checked) => onChange('free_shipping', checked)}
            />
            <Label htmlFor="free_shipping">Frete Grátis</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Preços por Canal</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPriceEntry}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Preço
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {priceList.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum preço específico configurado. O preço principal será usado em todos os canais.
            </p>
          ) : (
            priceList.map((priceEntry: any, index: number) => (
              <Card key={index} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium">Preço #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePriceEntry(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Canal/Marketplace</Label>
                      <Input
                        value={priceEntry.channel || ''}
                        onChange={(e) => updatePriceEntry(index, 'channel', e.target.value)}
                        placeholder="Ex: Mercado Livre, Loja Física"
                      />
                    </div>
                    <div>
                      <Label>Preço</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={priceEntry.price || ''}
                        onChange={(e) => updatePriceEntry(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label>Preço Promocional</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={priceEntry.promotional_price || ''}
                        onChange={(e) => updatePriceEntry(index, 'promotional_price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Data Início</Label>
                      <Input
                        type="date"
                        value={priceEntry.start_date || ''}
                        onChange={(e) => updatePriceEntry(index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Data Fim</Label>
                      <Input
                        type="date"
                        value={priceEntry.end_date || ''}
                        onChange={(e) => updatePriceEntry(index, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}