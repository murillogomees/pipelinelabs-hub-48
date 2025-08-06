
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, AlertTriangle, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductsManager, type Product } from '@/hooks/useProductsManager';

interface ProductsListProps {
  onProductSelect: (product: Product) => void;
  onNewProduct: () => void;
}

export function ProductsList({ onProductSelect, onNewProduct }: ProductsListProps) {
  const { products, isLoading, deleteProduct } = useProductsManager();

  const handleDelete = async (productId: string) => {
    await deleteProduct(productId);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          Nenhum produto cadastrado ainda
        </div>
        <Button onClick={onNewProduct} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Primeiro Produto
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => {
        const isLowStock = Number(product.stock_quantity || 0) <= Number(product.min_stock || 0);
        
        return (
          <Card key={product.id} className={`${!product.is_active ? 'opacity-60' : ''} ${isLowStock ? 'border-orange-200' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{product.name}</h3>
                <div className="flex gap-1">
                  {isLowStock && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Baixo estoque
                    </Badge>
                  )}
                  <Badge variant={product.is_active ? 'default' : 'secondary'}>
                    {product.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-gray-600">Código: {product.code}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Preço:</span>
                  <span className="font-medium">
                    {product.price ? 
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price) 
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estoque:</span>
                  <span className={`font-medium ${isLowStock ? 'text-orange-600' : ''}`}>
                    {product.stock_quantity || 0}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onProductSelect(product)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
