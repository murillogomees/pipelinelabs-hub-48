import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Package, PlusCircle, List } from 'lucide-react';
import { ProductsList } from './components/ProductsList';
import { ProductCreate } from './components/ProductCreate';
import { ProductDetails } from './components/ProductDetails';
import { Product } from './types';

export function ProductsUnified() {
  const [activeTab, setActiveTab] = useState('lista');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('detalhes');
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setActiveTab('cadastrar');
  };

  const handleProductCreated = () => {
    setActiveTab('lista');
  };

  const handleBackToList = () => {
    setSelectedProduct(null);
    setActiveTab('lista');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie seu catálogo de produtos de forma unificada
          </p>
        </div>
        <Button 
          onClick={handleNewProduct}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Lista de Produtos</span>
            <span className="sm:hidden">Lista</span>
          </TabsTrigger>
          <TabsTrigger value="cadastrar" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Cadastrar Produto</span>
            <span className="sm:hidden">Cadastrar</span>
          </TabsTrigger>
          <TabsTrigger 
            value="detalhes" 
            className="flex items-center gap-2"
            disabled={!selectedProduct}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Detalhes</span>
            <span className="sm:hidden">Detalhes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-0">
          <ProductsList 
            onProductSelect={handleProductSelect}
            onNewProduct={handleNewProduct}
          />
        </TabsContent>

        <TabsContent value="cadastrar" className="space-y-0">
          <ProductCreate 
            onSuccess={handleProductCreated}
            onCancel={handleBackToList}
          />
        </TabsContent>

        <TabsContent value="detalhes" className="space-y-0">
          {selectedProduct && (
            <ProductDetails 
              product={selectedProduct}
              onBack={handleBackToList}
              onEdit={() => {/* será implementado com modal */}}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}