
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
import { useUserCompany } from '@/hooks/useUserCompany';
import { ArrowLeft } from 'lucide-react';
import type { CreateProductData } from '../types';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  code: z.string().min(1, 'Código é obrigatório'),
  price: z.number().min(0).default(0),
  cost_price: z.number().optional(),
  stock_quantity: z.number().int().min(0).default(0),
  min_stock: z.number().int().min(0).optional(),
  max_stock: z.number().int().min(0).optional(),
  unit: z.string().default('un'),
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
  const { companyId, isLoading: companyLoading } = useUserCompany();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      price: 0,
      stock_quantity: 0,
      unit: 'un',
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    if (!companyId) {
      console.error('Company ID not available');
      return;
    }

    try {
      // Create product data with all required fields and proper defaults
      const productData: CreateProductData = {
        name: data.name,
        code: data.code,
        description: data.description || '',
        short_description: '',
        product_type: 'produto',
        brand: '',
        unit: data.unit,
        condition: 'novo',
        format: 'simples',
        production_type: 'propria',
        expiry_date: '',
        free_shipping: false,
        price: data.price,
        cost_price: data.cost_price || 0,
        promotional_price: 0,
        weight: data.weight || 0,
        gross_weight: 0,
        volumes: 1,
        height: 0,
        width: 0,
        depth: 0,
        unit_measure: 'cm',
        dimensions: data.dimensions || '',
        barcode: data.barcode || '',
        ncm_code: '',
        cest_code: '',
        tax_origin: '',
        tax_situation: '',
        item_type: '',
        product_group: '',
        icms_base: 0,
        icms_retention: 0,
        pis_fixed: 0,
        cofins_fixed: 0,
        estimated_tax_percentage: 0,
        tipi_exception: '',
        stock_quantity: data.stock_quantity,
        min_stock: data.min_stock || 0,
        max_stock: data.max_stock || 0,
        stock_location: '',
        stock_notes: '',
        crossdocking_days: 0,
        warehouse: '',
        external_link: '',
        video_link: '',
        observations: '',
        category_id: '',
        is_active: true,
        company_id: companyId,
      };
      
      await createProduct(productData);
      onSuccess();
    } catch (error) {
      // Error handled by the hook
    }
  };

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <Button type="submit" disabled={isLoading || !companyId}>
                {isLoading ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
