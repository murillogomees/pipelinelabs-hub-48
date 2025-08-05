
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Package, DollarSign, BarChart3 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  price?: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  barcode?: string;
  is_active: boolean;
  weight?: number;
  dimensions?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit: () => void;
}

export function ProductDetails({ product, onBack, onEdit }: ProductDetailsProps) {
  const isLowStock = Number(product.stock_quantity || 0) <= Number(product.min_stock || 0);
  
  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-muted-foreground">Código: {product.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={product.is_active ? 'default' : 'secondary'}>
            {product.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
          {isLowStock && (
            <Badge variant="destructive">Estoque Baixo</Badge>
          )}
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-sm">{product.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Código</p>
              <p className="text-sm">{product.code}</p>
            </div>
            {product.barcode && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código de Barras</p>
                <p className="text-sm">{product.barcode}</p>
              </div>
            )}
            {product.unit && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unidade</p>
                <p className="text-sm">{product.unit}</p>
              </div>
            )}
            {product.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                <p className="text-sm">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preços */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Preços
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preço de Venda</p>
              <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preço de Custo</p>
              <p className="text-sm">{formatCurrency(product.cost_price)}</p>
            </div>
            {product.price && product.cost_price && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Margem de Lucro</p>
                <p className="text-sm font-semibold text-green-600">
                  {((product.price - product.cost_price) / product.cost_price * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estoque */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Quantidade Atual</p>
              <p className={`text-lg font-semibold ${isLowStock ? 'text-orange-600' : ''}`}>
                {product.stock_quantity || 0}
              </p>
            </div>
            {product.min_stock && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Mínimo</p>
                <p className="text-sm">{product.min_stock}</p>
              </div>
            )}
            {product.max_stock && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Máximo</p>
                <p className="text-sm">{product.max_stock}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      {(product.weight || product.dimensions || product.created_at) && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.weight && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Peso</p>
                  <p className="text-sm">{product.weight} kg</p>
                </div>
              )}
              {product.dimensions && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dimensões</p>
                  <p className="text-sm">{product.dimensions}</p>
                </div>
              )}
              {product.created_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
                  <p className="text-sm">{formatDate(product.created_at)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
