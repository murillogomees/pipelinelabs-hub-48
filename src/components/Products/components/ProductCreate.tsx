
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProductsManager } from '@/hooks/useProductsManager';
import { ArrowLeft } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  code: z.string().min(1, 'Código é obrigatório'),
  price: z.number().optional(),
  cost_price: z.number().optional(),
  stock_quantity: z.number().optional(),
  min_stock: z.number().optional(),
  max_stock: z.number().optional(),
  unit: z.string().optional(),
  barcode: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductCreateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductCreate({ onSuccess, onCancel }: ProductCreateProps) {
  const { createProduct, isLoading } = useProductsManager();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Create product data with proper typing - schema validation guarantees name and code are present
      const productData = {
        name: data.name!, // Non-null assertion safe due to schema validation
        code: data.code!, // Non-null assertion safe due to schema validation
        description: data.description,
        price: data.price,
        cost_price: data.cost_price,
        stock_quantity: data.stock_quantity,
        min_stock: data.min_stock,
        max_stock: data.max_stock,
        unit: data.unit,
        barcode: data.barcode,
        weight: data.weight,
        dimensions: data.dimensions,
      };
      
      await createProduct(productData);
      onSuccess();
    } catch (error) {
      // Error handled by the hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">Novo Produto</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Nome do produto"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="Código do produto"
                />
                {errors.code && (
                  <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Preço de Venda</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="cost_price">Preço de Custo</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  {...register('cost_price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  {...register('stock_quantity', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="min_stock">Estoque Mínimo</Label>
                <Input
                  id="min_stock"
                  type="number"
                  {...register('min_stock', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Input
                  id="unit"
                  {...register('unit')}
                  placeholder="UN, KG, L, etc."
                />
              </div>

              <div>
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  {...register('barcode')}
                  placeholder="Código de barras"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descrição detalhada do produto"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
