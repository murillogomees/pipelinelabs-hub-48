import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Wrench, ClipboardList, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProductionOrders } from '@/hooks/useProductionOrders';
import { useServiceOrders } from '@/hooks/useServiceOrders';
import { ProductionOrderDialog } from '@/components/Production/ProductionOrderDialog';
import { ServiceOrderDialog } from '@/components/Production/ServiceOrderDialog';

// Componente para Ordens de Produção
function OrdensProducao() {
  const { orders, loading, deleteOrder } = useProductionOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.products?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap = {
      planned: { label: 'Planejado', variant: 'secondary' as const },
      in_progress: { label: 'Em Progresso', variant: 'default' as const },
      completed: { label: 'Concluído', variant: 'success' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    return statusMap[status] || statusMap.planned;
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedOrder(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ordens de Produção</h2>
          <p className="text-muted-foreground">Gerencie a produção de produtos</p>
        </div>
        <Button onClick={handleNew} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova Ordem
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Buscar por número da ordem ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando ordens de produção...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma ordem encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma ordem corresponde à sua busca.' : 'Crie sua primeira ordem de produção.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead>Data de Fim</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.products?.name || 'Produto não encontrado'}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>{order.start_date ? new Date(order.start_date).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell>{order.end_date ? new Date(order.end_date).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir ordem de produção</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a ordem {order.order_number}? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteOrder(order.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProductionOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={selectedOrder}
      />
    </div>
  );
}

// Componente para Ordens de Serviço
function OrdensServico() {
  const { orders, loading, deleteOrder } = useServiceOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: 'Aberto', variant: 'secondary' as const },
      in_progress: { label: 'Em Progresso', variant: 'default' as const },
      completed: { label: 'Concluído', variant: 'success' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    return statusMap[status] || statusMap.open;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { label: 'Baixa', variant: 'secondary' as const },
      medium: { label: 'Média', variant: 'default' as const },
      high: { label: 'Alta', variant: 'destructive' as const },
      urgent: { label: 'Urgente', variant: 'destructive' as const },
    };
    
    return priorityMap[priority] || priorityMap.medium;
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedOrder(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ordens de Serviço</h2>
          <p className="text-muted-foreground">Gerencie ordens de serviço</p>
        </div>
        <Button onClick={handleNew} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova OS
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Buscar por número, descrição ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando ordens de serviço...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma ordem encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma ordem corresponde à sua busca.' : 'Crie sua primeira ordem de serviço.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  const priorityInfo = getPriorityBadge('medium'); // Default priority since field doesn't exist
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.customers?.name || 'Cliente não informado'}</TableCell>
                      <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {order.price ? `R$ ${order.price.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir ordem de serviço</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a ordem {order.order_number}? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteOrder(order.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ServiceOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={selectedOrder}
      />
    </div>
  );
}

// Componente principal Produção
export function Producao() {
  const location = useLocation();
  
  // Determina a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/os')) return 'os';
    return 'producao'; // padrão
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Produção</h1>
        <p className="text-muted-foreground">Gerencie produção e ordens de serviço</p>
      </div>

      
      <Routes>
        <Route index element={<OrdensProducao />} />
        <Route path="os" element={<OrdensServico />} />
      </Routes>
    </div>
  );
}