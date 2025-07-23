import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductBasicForm } from './forms/ProductBasicForm';
import { ProductStockForm } from './forms/ProductStockForm';
import { ProductPriceForm } from './forms/ProductPriceForm';
import { ProductTaxForm } from './forms/ProductTaxForm';
import { ProductAttributesForm } from './forms/ProductAttributesForm';
import { ProductImagesForm } from './forms/ProductImagesForm';
import { useCreateProduct, useUpdateProduct } from './hooks/useProducts';
import { Product } from './types';
import { ProductFormData } from './schema';
import { useAutoTrack } from '@/components/Analytics';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [activeTab, setActiveTab] = useState('dados');
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    code: '',
    name: '',
    description: '',
    price: 0,
    cost_price: 0,
    weight: 0,
    stock_quantity: 0,
    min_stock: 0,
    max_stock: 0,
    ...product,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { trackCreate, trackUpdate } = useAutoTrack();

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (product) {
        const result = await updateMutation.mutateAsync({
          id: product.id,
          ...formData
        });
        trackUpdate('produto', product.id);
      } else {
        if (!formData.code || !formData.name || formData.price === undefined) {
          alert('Código, nome e preço são obrigatórios');
          return;
        }
        const result = await createMutation.mutateAsync({
          code: formData.code,
          name: formData.name,
          description: formData.description || null,
          price: formData.price || 0,
          cost_price: formData.cost_price || null,
          weight: formData.weight || null,
          dimensions: formData.dimensions || null,
          barcode: formData.barcode || null,
          ncm_code: formData.ncm_code || null,
          tax_origin: formData.tax_origin || null,
          tax_situation: formData.tax_situation || null,
          stock_quantity: formData.stock_quantity || 0,
          min_stock: formData.min_stock || null,
          max_stock: formData.max_stock || null,
          stock_location: formData.stock_location || null,
          category_id: formData.category_id || null,
        });
        trackCreate('produto', result?.id);
      }
      onOpenChange(false);
      setFormData({});
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="preco">Preço</TabsTrigger>
            <TabsTrigger value="tributacao">Tributação</TabsTrigger>
            <TabsTrigger value="atributos">Atributos</TabsTrigger>
            <TabsTrigger value="imagens">Imagens</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4">
            <ProductBasicForm 
              data={formData} 
              onChange={handleFormChange}
            />
          </TabsContent>

          <TabsContent value="estoque" className="space-y-4">
            <ProductStockForm 
              data={formData} 
              onChange={handleFormChange}
            />
          </TabsContent>

          <TabsContent value="preco" className="space-y-4">
            <ProductPriceForm 
              data={formData} 
              onChange={handleFormChange}
            />
          </TabsContent>

          <TabsContent value="tributacao" className="space-y-4">
            <ProductTaxForm 
              data={formData} 
              onChange={handleFormChange}
            />
          </TabsContent>

          <TabsContent value="atributos" className="space-y-4">
            <ProductAttributesForm 
              data={formData} 
              onChange={handleFormChange}
            />
          </TabsContent>

          <TabsContent value="imagens" className="space-y-4">
            <ProductImagesForm 
              data={formData} 
              onChange={handleFormChange}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar Produto'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}