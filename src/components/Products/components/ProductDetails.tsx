
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Package } from 'lucide-react';

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

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit: () => void;
}

export function ProductDetails({ product, onBack, onEdit }: ProductDetailsProps) {
  const getStockStatus = () => {
    const stock = product.stock_quantity || 0;
    const minStock = product.min_stock || 0;
    
    if (stock === 0) return { label: 'Sem Estoque', variant: 'destructive' as const };
    if (stock <= minStock) return { label: 'Estoque Baixo', variant: 'secondary' as const };
    return { label: 'Em Estoque', variant: 'default' as const };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-xl font-semibold">Detalhes do Produto</h2>
        </div>
        <Button onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {product.name}
              </CardTitle>
              <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Código</h4>
                <p className="text-lg font-mono">{product.code}</p>
              </div>
              
              {product.barcode && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Código de Barras</h4>
                  <p className="text-lg font-mono">{product.barcode}</p>
                </div>
              )}
            </div>

            {product.description && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Descrição</h4>
                <p className="text-sm">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Preço de Venda</h4>
                <p className="text-lg font-semibold">
                  {product.price ? `R$ ${product.price.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Preço de Custo</h4>
                <p className="text-lg">
                  {product.cost_price ? `R$ ${product.cost_price.toFixed(2)}` : 'N/A'}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Unidade</h4>
                <p className="text-lg">{product.unit || 'UN'}</p>
              </div>

              {product.weight && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Peso</h4>
                  <p className="text-lg">{product.weight} kg</p>
                </div>
              )}
            </div>

            {product.dimensions && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Dimensões</h4>
                <p className="text-sm">{product.dimensions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estoque */}
        <Card>
          <CardHeader>
            <CardTitle>Controle de Estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {product.stock_quantity || 0}
              </div>
              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estoque Mínimo:</span>
                <span className="text-sm font-medium">{product.min_stock || 0}</span>
              </div>
              
              {product.max_stock && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estoque Máximo:</span>
                  <span className="text-sm font-medium">{product.max_stock}</span>
                </div>
              )}
            </div>

            {product.price && product.stock_quantity && (
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valor em Estoque:</span>
                  <span className="text-sm font-semibold">
                    R$ {(product.price * product.stock_quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
