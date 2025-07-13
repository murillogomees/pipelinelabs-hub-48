import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PRODUCT_TYPES, PRODUCT_CONDITIONS, PRODUCT_FORMATS, PRODUCTION_TYPES, UNIT_MEASURES, UNITS } from '../types';

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
          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="gtin">GTIN</Label>
              <Input
                id="gtin"
                value={data.gtin || ''}
                onChange={(e) => onChange('gtin', e.target.value)}
                placeholder="Ex: 7891234567890"
              />
            </div>
            <div>
              <Label htmlFor="gtin_tax">GTIN Tributário</Label>
              <Input
                id="gtin_tax"
                value={data.gtin_tax || ''}
                onChange={(e) => onChange('gtin_tax', e.target.value)}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="short_description">Descrição Curta</Label>
              <Textarea
                id="short_description"
                value={data.short_description || ''}
                onChange={(e) => onChange('short_description', e.target.value)}
                placeholder="Descrição resumida do produto"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição Complementar</Label>
              <Textarea
                id="description"
                value={data.description || ''}
                onChange={(e) => onChange('description', e.target.value)}
                placeholder="Descrição detalhada do produto"
                rows={2}
              />
            </div>
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

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Select
                value={data.unit || UNITS.UNIDADE}
                onValueChange={(value) => onChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNITS.UNIDADE}>Unidade</SelectItem>
                  <SelectItem value={UNITS.PACOTE}>Pacote</SelectItem>
                  <SelectItem value={UNITS.CAIXA}>Caixa</SelectItem>
                  <SelectItem value={UNITS.KILOGRAMA}>Quilograma</SelectItem>
                  <SelectItem value={UNITS.GRAMA}>Grama</SelectItem>
                  <SelectItem value={UNITS.LITRO}>Litro</SelectItem>
                  <SelectItem value={UNITS.METRO}>Metro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={data.brand || ''}
                onChange={(e) => onChange('brand', e.target.value)}
                placeholder="Nome da marca"
              />
            </div>
            <div>
              <Label htmlFor="production_type">Produção</Label>
              <Select
                value={data.production_type || PRODUCTION_TYPES.PROPRIA}
                onValueChange={(value) => onChange('production_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PRODUCTION_TYPES.PROPRIA}>Própria</SelectItem>
                  <SelectItem value={PRODUCTION_TYPES.TERCEIRO}>Terceiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiry_date">Data de Validade</Label>
              <Input
                id="expiry_date"
                type="date"
                value={data.expiry_date || ''}
                onChange={(e) => onChange('expiry_date', e.target.value)}
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

          {data.product_type !== PRODUCT_TYPES.SERVICO && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight">Peso Líquido (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.001"
                    value={data.weight || ''}
                    onChange={(e) => onChange('weight', parseFloat(e.target.value) || null)}
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <Label htmlFor="gross_weight">Peso Bruto (kg)</Label>
                  <Input
                    id="gross_weight"
                    type="number"
                    step="0.001"
                    value={data.gross_weight || ''}
                    onChange={(e) => onChange('gross_weight', parseFloat(e.target.value) || null)}
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <Label htmlFor="volumes">Volumes</Label>
                  <Input
                    id="volumes"
                    type="number"
                    value={data.volumes || 1}
                    onChange={(e) => onChange('volumes', parseInt(e.target.value) || 1)}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="height">Altura</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={data.height || ''}
                    onChange={(e) => onChange('height', parseFloat(e.target.value) || null)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="width">Largura</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    value={data.width || ''}
                    onChange={(e) => onChange('width', parseFloat(e.target.value) || null)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="depth">Profundidade</Label>
                  <Input
                    id="depth"
                    type="number"
                    step="0.01"
                    value={data.depth || ''}
                    onChange={(e) => onChange('depth', parseFloat(e.target.value) || null)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="unit_measure">Unidade de Medida</Label>
                  <Select
                    value={data.unit_measure || UNIT_MEASURES.CM}
                    onValueChange={(value) => onChange('unit_measure', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNIT_MEASURES.CM}>Centímetros</SelectItem>
                      <SelectItem value={UNIT_MEASURES.M}>Metros</SelectItem>
                      <SelectItem value={UNIT_MEASURES.MM}>Milímetros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links e Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="external_link">Link Externo</Label>
              <Input
                id="external_link"
                type="url"
                value={data.external_link || ''}
                onChange={(e) => onChange('external_link', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="video_link">Link de Vídeo</Label>
              <Input
                id="video_link"
                type="url"
                value={data.video_link || ''}
                onChange={(e) => onChange('video_link', e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={data.observations || ''}
              onChange={(e) => onChange('observations', e.target.value)}
              placeholder="Observações adicionais sobre o produto"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}