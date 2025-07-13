
import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Package, AlertTriangle, Archive, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducts } from '@/components/Products/hooks/useProducts';
import { ProductDialog } from '@/components/Products/ProductDialog';
import { Product } from '@/components/Products/types';
import { Skeleton } from '@/components/ui/skeleton';

// Componente para Estoque (lista principal)
function Estoque() {
  const { data: products, isLoading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const lowStockProducts = products?.filter(p => p.stock_quantity <= (p.min_stock || 0)) || [];
  const totalValue = products?.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0) || 0;

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Erro ao carregar produtos</h2>
          <p className="text-gray-600 mt-2">Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Estoque</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie seu catálogo e controle de estoque</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
          onClick={handleNewProduct}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-primary mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{products?.length || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-destructive mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{lowStockProducts.length}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(totalValue)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Categorias</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Buscar produtos..." className="pl-10" />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Código</th>
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Estoque</th>
                  <th className="text-left py-3 px-4">Preço</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-8 w-16" /></td>
                    </tr>
                  ))
                ) : products?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum produto encontrado. Clique em "Novo Produto" para adicionar seu primeiro produto.
                    </td>
                  </tr>
                ) : (
                  products?.map((produto) => (
                    <tr key={produto.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{produto.code}</td>
                      <td className="py-3 px-4">{produto.name}</td>
                      <td className="py-3 px-4">
                        <span className={produto.stock_quantity <= (produto.min_stock || 0) ? 'text-destructive font-medium' : ''}>
                          {produto.stock_quantity} un.
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(produto.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          produto.stock_quantity > (produto.min_stock || 0) ? 'bg-green-100 text-green-800' :
                          produto.stock_quantity === 0 ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {produto.stock_quantity > (produto.min_stock || 0) ? 'Ativo' :
                           produto.stock_quantity === 0 ? 'Esgotado' : 'Baixo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProduct(produto)}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={selectedProduct}
      />
    </div>
  );
}

// Componente para Categorias
function Categorias() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Categorias</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Organize seus produtos por categorias</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Categorias em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de categorias de produtos estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal Produtos
export function Produtos() {
  const location = useLocation();
  
  // Determina a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/estoque')) return 'estoque';
    if (path.includes('/categorias')) return 'categorias';
    return 'estoque'; // padrão
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Produtos</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Gerencie seu catálogo e controle de estoque</p>
      </div>

      <Tabs value={getActiveTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="estoque" asChild>
            <NavLink to="/produtos/estoque" className="flex items-center justify-center space-x-2 py-2">
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Estoque</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="categorias" asChild>
            <NavLink to="/produtos/categorias" className="flex items-center justify-center space-x-2 py-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Categorias</span>
            </NavLink>
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route index element={<Estoque />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="categorias" element={<Categorias />} />
        </Routes>
      </Tabs>
    </div>
  );
}
