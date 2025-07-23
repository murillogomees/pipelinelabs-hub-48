import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  DollarSign, 
  BarChart3, 
  Tag,
  Calendar,
  MapPin
} from 'lucide-react';
import { Product } from '../types';
import { ProductDialog } from '../ProductDialog';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit?: () => void;
}

export function ProductDetails({ product, onBack, onEdit }: ProductDetailsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const getStatusBadge = () => {
    if (product.stock_quantity === 0) {
      return <Badge variant="destructive">Esgotado</Badge>;
    }
    if (product.stock_quantity <= (product.min_stock || 0)) {
      return <Badge variant="secondary">Estoque Baixo</Badge>;
    }
    return <Badge variant="default">Ativo</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Não definido';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      setIsEditDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
            <p className="text-muted-foreground">Código: {product.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-sm font-medium">{product.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Código</label>
                <p className="text-sm font-medium">{product.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Marca</label>
                <p className="text-sm">{product.brand || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unidade</label>
                <p className="text-sm">{product.unit || 'un'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <p className="text-sm">{product.product_type || 'produto'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Condição</label>
                <p className="text-sm">{product.condition || 'novo'}</p>
              </div>
            </div>
            
            {product.description && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p className="text-sm mt-1">{product.description}</p>
                </div>
              </>
            )}

            {product.dimensions && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dimensões</label>
                  <p className="text-sm mt-1">{product.dimensions}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Resumo Rápido */}
        <div className="space-y-6">
          {/* Preços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Preços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preço de Venda</label>
                <p className="text-lg font-bold text-green-600">{formatCurrency(product.price)}</p>
              </div>
              {product.cost_price && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preço de Custo</label>
                  <p className="text-sm">{formatCurrency(product.cost_price)}</p>
                </div>
              )}
              {product.promotional_price && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preço Promocional</label>
                  <p className="text-sm text-orange-600">{formatCurrency(product.promotional_price)}</p>
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
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantidade Atual</label>
                <p className="text-lg font-bold">{product.stock_quantity} un.</p>
              </div>
              {product.min_stock && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estoque Mínimo</label>
                  <p className="text-sm">{product.min_stock} un.</p>
                </div>
              )}
              {product.max_stock && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estoque Máximo</label>
                  <p className="text-sm">{product.max_stock} un.</p>
                </div>
              )}
              {product.stock_location && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Localização</label>
                  <p className="text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {product.stock_location}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Códigos e Tributação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Códigos e Tributação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {product.barcode && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Código de Barras</label>
                <p className="text-sm font-mono">{product.barcode}</p>
              </div>
            )}
            {product.ncm_code && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">NCM</label>
                <p className="text-sm font-mono">{product.ncm_code}</p>
              </div>
            )}
            {product.cest_code && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">CEST</label>
                <p className="text-sm font-mono">{product.cest_code}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Datas e Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
              <p className="text-sm">{formatDate(product.created_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
              <p className="text-sm">{formatDate(product.updated_at)}</p>
            </div>
            {product.expiry_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Validade</label>
                <p className="text-sm">{formatDate(product.expiry_date)}</p>
              </div>
            )}
            {product.observations && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Observações</label>
                <p className="text-sm">{product.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <ProductDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={product}
      />
    </div>
  );
}