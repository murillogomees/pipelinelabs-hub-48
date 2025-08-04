import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { ProductBasicForm } from '../forms/ProductBasicForm';
import { ProductStockForm } from '../forms/ProductStockForm';
import { ProductPriceForm } from '../forms/ProductPriceForm';
import { ProductTaxForm } from '../forms/ProductTaxForm';
import { ProductCategoryForm } from '../forms/ProductCategoryForm';
import { useCreateProduct } from '../hooks/useProducts';
import { ProductFormData } from '../schema';
import { useAutoTrack } from '@/components/Analytics';
import { useMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';

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
  const isMobile = useMobile();

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.name || formData.price === undefined) {
        toast({
          title: "Campos obrigatórios",
          description: "Código, nome e preço são obrigatórios",
          variant: "destructive",
        });
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
      toast({
        title: "Produto criado!",
        description: "O produto foi cadastrado com sucesso.",
      });
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao cadastrar o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="container-fluid px-4 py-6 max-w-full">
      {/* Header Mobile Otimizado */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b mb-6 -mx-4 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="h-9 w-9 p-0 hover:bg-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Novo Produto</h1>
              {!isMobile && (
                <p className="text-sm text-muted-foreground">
                  Preencha as informações do produto
                </p>
              )}
            </div>
          </div>
          
          {!isMobile && (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={onCancel}
                disabled={isLoading}
                className="text-muted-foreground"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Formulário Mobile-First */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Mobile Otimizadas */}
          <div className="mb-6">
            <TabsList className={`
              grid w-full bg-muted/30 p-1 rounded-lg
              ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-5 gap-1'}
            `}>
              <TabsTrigger 
                value="dados" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm font-medium"
              >
                {isMobile ? 'Dados' : 'Dados Básicos'}
              </TabsTrigger>
              <TabsTrigger 
                value="categoria"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm font-medium"
              >
                Categoria
              </TabsTrigger>
              {!isMobile && (
                <>
                  <TabsTrigger 
                    value="estoque"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm font-medium"
                  >
                    Estoque
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preco"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm font-medium"
                  >
                    Preços
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tributacao"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm font-medium"
                  >
                    Tributação
                  </TabsTrigger>
                </>
              )}
            </TabsList>
            
            {/* Tabs Mobile em Lista Vertical */}
            {isMobile && (
              <div className="mt-4 grid grid-cols-1 gap-2">
                <TabsTrigger 
                  value="estoque"
                  className="w-full justify-start data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium py-3"
                >
                  📦 Estoque e Inventário
                </TabsTrigger>
                <TabsTrigger 
                  value="preco"
                  className="w-full justify-start data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium py-3"
                >
                  💰 Preços e Margens
                </TabsTrigger>
                <TabsTrigger 
                  value="tributacao"
                  className="w-full justify-start data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium py-3"
                >
                  📊 Impostos e Tributação
                </TabsTrigger>
              </div>
            )}
          </div>

          {/* Conteúdo das Abas */}
          <div className="space-y-6">
            <TabsContent value="dados" className="space-y-0 mt-0">
              <Card className="border-0 shadow-sm bg-card/50">
                <CardContent className="p-4 sm:p-6">
                  <ProductBasicForm 
                    data={formData} 
                    onChange={handleFormChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categoria" className="space-y-0 mt-0">
              <Card className="border-0 shadow-sm bg-card/50">
                <CardContent className="p-4 sm:p-6">
                  <ProductCategoryForm 
                    data={formData} 
                    onChange={handleFormChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estoque" className="space-y-0 mt-0">
              <Card className="border-0 shadow-sm bg-card/50">
                <CardContent className="p-4 sm:p-6">
                  <ProductStockForm 
                    data={formData} 
                    onChange={handleFormChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preco" className="space-y-0 mt-0">
              <Card className="border-0 shadow-sm bg-card/50">
                <CardContent className="p-4 sm:p-6">
                  <ProductPriceForm 
                    data={formData} 
                    onChange={handleFormChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tributacao" className="space-y-0 mt-0">
              <Card className="border-0 shadow-sm bg-card/50">
                <CardContent className="p-4 sm:p-6">
                  <ProductTaxForm 
                    data={formData} 
                    onChange={handleFormChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Botões de Ação Mobile Fixos */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-20">
          <div className="flex gap-3 max-w-sm mx-auto">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 h-12 text-base font-medium"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Salvar</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Espaçamento para botões fixos mobile */}
      {isMobile && <div className="h-20" />}
    </div>
  );
}