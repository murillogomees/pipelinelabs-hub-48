import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface ProductAttributesFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function ProductAttributesForm({ data, onChange }: ProductAttributesFormProps) {
  const attributes = data.custom_attributes || {};
  const tags = data.tags || [];

  const addAttribute = () => {
    const key = prompt('Nome do atributo:');
    if (key && key.trim()) {
      onChange('custom_attributes', {
        ...attributes,
        [key.trim()]: ''
      });
    }
  };

  const updateAttribute = (key: string, value: string) => {
    onChange('custom_attributes', {
      ...attributes,
      [key]: value
    });
  };

  const removeAttribute = (key: string) => {
    const updated = { ...attributes };
    delete updated[key];
    onChange('custom_attributes', updated);
  };

  const addTag = () => {
    const tag = prompt('Nova tag:');
    if (tag && tag.trim() && !tags.includes(tag.trim())) {
      onChange('tags', [...tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange('tags', tags.filter((tag: string) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Complementares</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              value={data.brand || ''}
              onChange={(e) => onChange('brand', e.target.value)}
              placeholder="Ex: Apple, Samsung, Nike"
            />
          </div>

          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              value={data.model || ''}
              onChange={(e) => onChange('model', e.target.value)}
              placeholder="Ex: iPhone 15, Galaxy S24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                value={data.manufacturer || ''}
                onChange={(e) => onChange('manufacturer', e.target.value)}
                placeholder="Nome do fabricante"
              />
            </div>
            <div>
              <Label htmlFor="country_origin">País de Origem</Label>
              <Input
                id="country_origin"
                value={data.country_origin || ''}
                onChange={(e) => onChange('country_origin', e.target.value)}
                placeholder="Ex: Brasil, China, EUA"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="warranty_months">Garantia (meses)</Label>
              <Input
                id="warranty_months"
                type="number"
                value={data.warranty_months || ''}
                onChange={(e) => onChange('warranty_months', parseInt(e.target.value) || null)}
                placeholder="0"
              />
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

          <div>
            <Label htmlFor="complementary_description">Descrição Complementar</Label>
            <Textarea
              id="complementary_description"
              value={data.complementary_description || ''}
              onChange={(e) => onChange('complementary_description', e.target.value)}
              placeholder="Informações adicionais, especificações técnicas, etc."
              rows={4}
            />
          </div>

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
              <Label htmlFor="video_link">Link do Vídeo</Label>
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
              placeholder="Observações internas sobre o produto"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Atributos Personalizados</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAttribute}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Atributo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(attributes).length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum atributo personalizado. Clique em "Adicionar Atributo" para criar.
            </p>
          ) : (
            Object.entries(attributes).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className="flex-1">
                  <Label>{key}</Label>
                  <Input
                    value={value || ''}
                    onChange={(e) => updateAttribute(key, e.target.value)}
                    placeholder={`Valor para ${key}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttribute(key)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tags</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTag}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Tag
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhuma tag adicionada.
              </p>
            ) : (
              tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}