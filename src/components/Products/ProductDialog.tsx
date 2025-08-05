import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductBasicForm } from './forms/ProductBasicForm';
import { ProductStockForm } from './forms/ProductStockForm';
import { ProductPriceForm } from './forms/ProductPriceForm';
import { ProductTaxForm } from './forms/ProductTaxForm';
import { ProductCategoryForm } from './forms/ProductCategoryForm';
import { useCreateProduct, useUpdateProduct } from './hooks/useProducts';
import { Product } from './types';
import { ProductFormData } from './schema';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [activeTab, setActiveTab] = useState('dados');
  const [error, setError] = useState<string | null>(null);
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

  // Reset error when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        cost_price: product.cost_price || 0,
        weight: product.weight || 0,
        stock_quantity: product.stock_quantity || 0,
        min_stock: product.min_stock || 0,
        max_stock: product.max_stock || 0,
        ...product,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        price: 0,
        cost_price: 0,
        weight: 0,
        stock_quantity: 0,
        min_stock: 0,
        max_stock: 0,
      });
    }
  }, [product]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setError(null);
    
    try {
      // Validação básica
      if (!formData.code || !formData.name) {
        setError('Código e nome são obrigatórios');
        return;
      }

      if (!formData.price || formData.price <= 0) {
        setError('Preço deve ser maior que zero');
        return;
      }

      if (product) {
        // Atualizar produto existente
        await updateMutation.mutateAsync({
          id: product.id,
          ...formData
        });
      } else {
        // Criar novo produto
        await createMutation.mutateAsync({
          code: formData.code,
          name: formData.name,
          description: formData.description || null,
          short_description: formData.short_description || null,
          product_type: formData.product_type || 'produto',
          brand: formData.brand || null,
          unit: formData.unit || 'un',
          condition: formData.condition || 'novo',
          format: formData.format || 'simples',
          production_type: formData.production_type || 'propria',
          expiry_date: formData.expiry_date || null,
          free_shipping: formData.free_shipping || false,
          price: formData.price || 0,
          cost_price: formData.cost_price || null,
          promotional_price: formData.promotional_price || null,
          weight: formData.weight || null,
          gross_weight: formData.gross_weight || null,
          volumes: formData.volumes || 1,
          height: formData.height || null,
          width: formData.width || null,
          depth: formData.depth || null,
          unit_measure: formData.unit_measure || 'cm',
          dimensions: formData.dimensions || null,
          barcode: formData.barcode || null,
          ncm_code: formData.ncm_code || null,
          cest_code: formData.cest_code || null,
          tax_origin: formData.tax_origin || null,
          tax_situation: formData.tax_situation || null,
          item_type: formData.item_type || null,
          product_group: formData.product_group || null,
          icms_base: formData.icms_base || null,
          icms_retention: formData.icms_retention || null,
          pis_fixed: formData.pis_fixed || null,
          cofins_fixed: formData.cofins_fixed || null,
          estimated_tax_percentage: formData.estimated_tax_percentage || null,
          tipi_exception: formData.tipi_exception || null,
          stock_quantity: formData.stock_quantity || 0,
          min_stock: formData.min_stock || null,
          max_stock: formData.max_stock || null,
          stock_location: formData.stock_location || null,
          stock_notes: formData.stock_notes || null,
          crossdocking_days: formData.crossdocking_days || 0,
          warehouse: formData.warehouse || null,
          external_link: formData.external_link || null,
          video_link: formData.video_link || null,
          observations: formData.observations || null,
          category_id: formData.category_id || null,
        });
      }
      
      onOpenChange(false);
      setFormData({});
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      setError(error.message || 'Erro ao salvar produto. Tente novamente.');
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
          <DialogDescription>
            {product ? 'Altere as informações do produto' : 'Preencha os dados do novo produto'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="categoria">Categoria</TabsTrigger>
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="preco">Preço</TabsTrigger>
            <TabsTrigger value="tributacao">Tributação</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4">
            <ProductBasicForm 
              data={formData} 
              onChange={handleFormChange}
            />
          </TabsContent>

          <TabsContent value="categoria" className="space-y-4">
            <ProductCategoryForm 
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