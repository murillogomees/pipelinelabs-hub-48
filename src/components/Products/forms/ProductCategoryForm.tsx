import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProductCategories } from '../hooks/useProducts';

interface ProductCategoryFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function ProductCategoryForm({ data, onChange }: ProductCategoryFormProps) {
  const { data: categories, isLoading } = useProductCategories();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Categorização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="category_id">Categoria do Produto</Label>
            <Select
              value={data.category_id || ''}
              onValueChange={(value) => onChange('category_id', value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione uma categoria"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem categoria</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              As categorias ajudam a organizar e filtrar seus produtos
            </p>
          </div>

          <div>
            <Label htmlFor="product_group">Grupo do Produto</Label>
            <Input
              id="product_group"
              value={data.product_group || ''}
              onChange={(e) => onChange('product_group', e.target.value)}
              placeholder="Ex: Eletrônicos, Roupas, Alimentícios"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Grupo para classificação adicional do produto
            </p>
          </div>

          <div>
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input
              id="barcode"
              value={data.barcode || ''}
              onChange={(e) => onChange('barcode', e.target.value)}
              placeholder="Ex: 7890123456789"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Complementares</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dimensions">Dimensões Formatadas</Label>
            <Input
              id="dimensions"
              value={data.dimensions || ''}
              onChange={(e) => onChange('dimensions', e.target.value)}
              placeholder="Ex: 10x15x20 cm"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Dimensões formatadas para exibição
            </p>
          </div>

          <div>
            <Label htmlFor="observations">Observações Gerais</Label>
            <Textarea
              id="observations"
              value={data.observations || ''}
              onChange={(e) => onChange('observations', e.target.value)}
              placeholder="Informações adicionais sobre o produto"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}