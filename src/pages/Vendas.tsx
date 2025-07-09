
import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, ShoppingCart, CreditCard, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSales } from '@/hooks/useSales';
import { Skeleton } from '@/components/ui/skeleton';

// Componente para Pedidos
function Pedidos() {
  const { data: sales, isLoading, error } = useSales();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Erro ao carregar vendas</h2>
          <p className="text-gray-600 mt-2">Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pedidos</h2>
          <p className="text-muted-foreground">Gerencie todos os seus pedidos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Buscar pedidos..." className="pl-10" />
            </div>
            <Button variant="outline">
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
                  <th className="text-left py-3 px-4">Pedido</th>
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Data</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Valor</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-8 w-20" /></td>
                    </tr>
                  ))
                ) : sales?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma venda encontrada. Clique em "Nova Venda" para criar sua primeira venda.
                    </td>
                  </tr>
                ) : (
                  sales?.map((venda) => (
                    <tr key={venda.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{venda.sale_number}</td>
                      <td className="py-3 px-4">{venda.customers?.name || 'Cliente não informado'}</td>
                      <td className="py-3 px-4">
                        {new Date(venda.sale_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(venda.status)}`}>
                          {getStatusText(venda.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(venda.total_amount)}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
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
    </div>
  );
}

// Componente para PDV
function PDV() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">PDV - Ponto de Venda</h2>
          <p className="text-muted-foreground">Sistema de vendas rápido e intuitivo</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">PDV em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O sistema de Ponto de Venda estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Propostas
function Propostas() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Propostas</h2>
          <p className="text-muted-foreground">Gerencie propostas comerciais</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova Proposta
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Propostas em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de propostas comerciais estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal Vendas
export function Vendas() {
  const location = useLocation();
  
  // Determina a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/pedidos')) return 'pedidos';
    if (path.includes('/pdv')) return 'pdv';
    if (path.includes('/propostas')) return 'propostas';
    return 'pedidos'; // padrão
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
        <p className="text-muted-foreground">Gerencie todos os seus pedidos e vendas</p>
      </div>

      <Tabs value={getActiveTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pedidos" asChild>
            <NavLink to="/vendas/pedidos" className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Pedidos</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="pdv" asChild>
            <NavLink to="/vendas/pdv" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>PDV</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="propostas" asChild>
            <NavLink to="/vendas/propostas" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Propostas</span>
            </NavLink>
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route index element={<Pedidos />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="pdv" element={<PDV />} />
          <Route path="propostas" element={<Propostas />} />
        </Routes>
      </Tabs>
    </div>
  );
}
