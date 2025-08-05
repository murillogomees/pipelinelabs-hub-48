
import React, { useState } from 'react';
import { useProductsManager } from '@/hooks/useProductsManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductDialog } from '../ProductDialog';

interface Product {
  id: string;
  name: string;
  description?: string;
  code: string;
  price?: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  barcode?: string;
  is_active?: boolean;
  weight?: number;
  dimensions?: string;
  supplier_id?: string;
}

interface ProductsListProps {
  onProductSelect: (product: Product) => void;
  onNewProduct: () => void;
}

export function ProductsList({ onProductSelect, onNewProduct }: ProductsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { 
    products, 
    isLoading, 
    searchProducts,
    updateProduct,
    deleteProduct,
    createProduct 
  } = useProductsManager();

  const filteredProducts = products.filter((product: any) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: any) => {
    const transformedProduct: Product = {
      id: product.id,
      name: product.name || '',
      description: product.description,
      code: product.code || '',
      price: product.price,
      cost_price: product.cost_price,
      stock_quantity: product.stock_quantity,
      min_stock: product.min_stock,
      max_stock: product.max_stock,
      unit: product.unit,
      barcode: product.barcode,
      is_active: product.is_active,
      weight: product.weight,
      dimensions: product.dimensions,
      supplier_id: product.supplier_id
    };
    setEditingProduct(transformedProduct);
    setIsDialogOpen(true);
  };

  const handleSubmitProduct = async (productData: Product) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      // Error already handled in hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onNewProduct} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </p>
            {!searchTerm && (
              <Button onClick={onNewProduct} variant="outline" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Produto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product: any) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Código: {product.code}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Preço:</span>
                  <span className="font-medium">
                    {product.price ? `R$ ${product.price.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estoque:</span>
                  <span className={`font-medium ${
                    (product.stock_quantity || 0) <= (product.min_stock || 0) 
                      ? 'text-destructive' 
                      : 'text-foreground'
                  }`}>
                    {product.stock_quantity || 0} {product.unit || 'UN'}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const transformedProduct: Product = {
                        id: product.id,
                        name: product.name || '',
                        description: product.description,
                        code: product.code || '',
                        price: product.price,
                        cost_price: product.cost_price,
                        stock_quantity: product.stock_quantity,
                        min_stock: product.min_stock,
                        max_stock: product.max_stock,
                        unit: product.unit,
                        barcode: product.barcode,
                        is_active: product.is_active,
                        weight: product.weight,
                        dimensions: product.dimensions,
                        supplier_id: product.supplier_id
                      };
                      onProductSelect(transformedProduct);
                    }}
                    className="flex-1"
                  >
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSubmit={handleSubmitProduct}
      />
    </div>
  );
}
