import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save } from 'lucide-react';
import { ProductBasicForm } from '../forms/ProductBasicForm';
import { ProductStockForm } from '../forms/ProductStockForm';
import { ProductPriceForm } from '../forms/ProductPriceForm';
import { ProductTaxForm } from '../forms/ProductTaxForm';
import { ProductCategoryForm } from '../forms/ProductCategoryForm';
import { useCreateProduct } from '../hooks/useProducts';
import { ProductFormData } from '../schema';
import { useAutoTrack } from '@/components/Analytics';

interface ProductCreateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductCreate({ onSuccess, onCancel }: ProductCreateProps) {
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
  });

  const createMutation = useCreateProduct();
  const { trackCreate } = useAutoTrack();

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.name || formData.price === undefined) {
        alert('Código, nome e preço são obrigatórios');
        return;
      }

      const result = await createMutation.mutateAsync({
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
      
      trackCreate('produto', result?.id);
      setFormData({});
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onCancel}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle>Cadastrar Novo Produto</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Preencha as informações do produto nas abas abaixo
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="categoria">Categoria</TabsTrigger>
              <TabsTrigger value="estoque">Estoque</TabsTrigger>
              <TabsTrigger value="preco">Preço</TabsTrigger>
              <TabsTrigger value="tributacao">Tributação</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4 mt-6">
              <ProductBasicForm 
                data={formData} 
                onChange={handleFormChange}
              />
            </TabsContent>

            <TabsContent value="categoria" className="space-y-4 mt-6">
              <ProductCategoryForm 
                data={formData} 
                onChange={handleFormChange}
              />
            </TabsContent>

            <TabsContent value="estoque" className="space-y-4 mt-6">
              <ProductStockForm 
                data={formData} 
                onChange={handleFormChange}
              />
            </TabsContent>

            <TabsContent value="preco" className="space-y-4 mt-6">
              <ProductPriceForm 
                data={formData} 
                onChange={handleFormChange}
              />
            </TabsContent>

            <TabsContent value="tributacao" className="space-y-4 mt-6">
              <ProductTaxForm 
                data={formData} 
                onChange={handleFormChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}