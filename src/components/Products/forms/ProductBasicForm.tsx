import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_TYPES, PRODUCT_CONDITIONS, PRODUCT_FORMATS } from '../types';

interface ProductBasicFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function ProductBasicForm({ data, onChange }: ProductBasicFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Código/SKU *</Label>
              <Input
                id="code"
                value={data.code || ''}
                onChange={(e) => onChange('code', e.target.value)}
                placeholder="Ex: PRD001"
              />
            </div>
            <div>
              <Label htmlFor="barcode">Código de Barras (GTIN)</Label>
              <Input
                id="barcode"
                value={data.barcode || ''}
                onChange={(e) => onChange('barcode', e.target.value)}
                placeholder="Ex: 7891234567890"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={data.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Digite o nome do produto"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={data.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Descrição detalhada do produto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="product_type">Tipo</Label>
              <Select
                value={data.product_type || PRODUCT_TYPES.PRODUTO}
                onValueChange={(value) => onChange('product_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PRODUCT_TYPES.PRODUTO}>Produto</SelectItem>
                  <SelectItem value={PRODUCT_TYPES.SERVICO}>Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition">Condição</Label>
              <Select
                value={data.condition || PRODUCT_CONDITIONS.NOVO}
                onValueChange={(value) => onChange('condition', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a condição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PRODUCT_CONDITIONS.NOVO}>Novo</SelectItem>
                  <SelectItem value={PRODUCT_CONDITIONS.USADO}>Usado</SelectItem>
                  <SelectItem value={PRODUCT_CONDITIONS.RECONDICIONADO}>Recondicionado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="format">Formato</Label>
              <Select
                value={data.format || PRODUCT_FORMATS.SIMPLES}
                onValueChange={(value) => onChange('format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PRODUCT_FORMATS.SIMPLES}>Simples</SelectItem>
                  <SelectItem value={PRODUCT_FORMATS.VARIACAO}>Com Variação</SelectItem>
                  <SelectItem value={PRODUCT_FORMATS.COMPOSICAO}>Composição</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {data.product_type !== PRODUCT_TYPES.SERVICO && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.001"
                  value={data.weight || ''}
                  onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
                  placeholder="0.000"
                />
              </div>
              <div>
                <Label htmlFor="dimensions">Dimensões (A x L x P cm)</Label>
                <Input
                  id="dimensions"
                  value={data.dimensions || ''}
                  onChange={(e) => onChange('dimensions', e.target.value)}
                  placeholder="Ex: 10 x 15 x 20"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}