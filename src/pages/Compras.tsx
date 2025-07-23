import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search, Filter, Eye, Edit, Trash2, Package, Calendar, DollarSign } from 'lucide-react';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { PurchaseOrderDialog } from '@/components/Purchases/PurchaseOrderDialog';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Compras() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { purchaseOrders, loading, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = usePurchaseOrders();

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800', 
    confirmed: 'bg-green-100 text-green-800',
    partially_received: 'bg-yellow-100 text-yellow-800',
    received: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    draft: 'Rascunho',
    sent: 'Enviado',
    confirmed: 'Confirmado',
    partially_received: 'Parcialmente Recebido',
    received: 'Recebido',
    cancelled: 'Cancelado'
  };

  const filteredOrders = purchaseOrders?.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleEdit = (order: any) => {
    setSelectedOrder(order);
    setShowCreateDialog(true);
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido de compra?')) {
      await deletePurchaseOrder(orderId);
    }
  };

  const handleSubmit = async (data: any) => {
    if (selectedOrder) {
      await updatePurchaseOrder(selectedOrder.id, data);
    } else {
      await createPurchaseOrder(data);
    }
    setShowCreateDialog(false);
    setSelectedOrder(null);
  };

  const getDashboardStats = () => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter(o => ['draft', 'sent'].includes(o.status)).length;
    const confirmed = filteredOrders.filter(o => o.status === 'confirmed').length;
    const totalValue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    return { total, pending, confirmed, totalValue };
  };

  const stats = getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Compras</h1>
          <p className="text-muted-foreground">Gerencie seus pedidos de compra e fornecedores</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número ou fornecedor..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="draft">Rascunho</TabsTrigger>
                <TabsTrigger value="sent">Enviado</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmado</TabsTrigger>
                <TabsTrigger value="received">Recebido</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos de Compra</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando pedidos...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || selectedStatus !== 'all' 
                          ? 'Nenhum pedido corresponde aos filtros selecionados.'
                          : 'Você ainda não possui pedidos de compra cadastrados.'
                        }
                      </p>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Pedido
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.supplier_name || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(order.order_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status] || statusColors.draft}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(order.total_amount || 0)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(order.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Purchase Order Dialog */}
      <PurchaseOrderDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setSelectedOrder(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedOrder}
      />
    </div>
  );
}