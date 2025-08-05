
import React, { useState } from 'react';
import { ProductsList } from '@/components/Products/ProductsList';
import { ProductDialog } from '@/components/Products/ProductDialog';
import { ProductFilters } from '@/components/Products/ProductFilters';
import { useProductsManager } from '@/hooks/useProductsManager';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Produtos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const {
    products,
    totalProducts,
    isLoading,
    filters,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    isEmpty,
    isFiltered,
    lowStockProducts
  } = useProductsManager();

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct(productData);
      setIsDialogOpen(false);
    } catch (error) {
      // Error já tratado no hook
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct?.id) return;
    
    try {
      await updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
      setIsDialogOpen(false);
    } catch (error) {
      // Error já tratado no hook
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
    } catch (error) {
      // Error já tratado no hook
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">
            {totalProducts} {totalProducts === 1 ? 'produto' : 'produtos'} cadastrados
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setIsDialogOpen(true);
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Novo Produto
        </Button>
      </div>

      {lowStockProducts.length > 0 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{lowStockProducts.length}</strong> produtos com estoque baixo. 
            Verifique os produtos em destaque na lista.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <ProductFilters
          onFiltersChange={searchProducts}
          currentFilters={filters}
          isLoading={isLoading}
        />
      </div>

      {isEmpty && !isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {isFiltered 
              ? 'Nenhum produto encontrado com os filtros aplicados'
              : 'Nenhum produto cadastrado ainda'
            }
          </div>
          {!isFiltered && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Produto
            </Button>
          )}
        </div>
      ) : (
        <ProductsList
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          isLoading={isLoading}
        />
      )}

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
      />
    </div>
  );
}
