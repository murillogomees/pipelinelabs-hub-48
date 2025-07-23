
import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, ShoppingCart, CreditCard, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useSales, Sale } from '@/hooks/useSales';
import { useProposals, Proposal } from '@/hooks/useProposals';
import { POSInterface } from '@/components/POS/POSInterface';
import { ProposalDialog } from '@/components/Proposals/ProposalDialog';
import { SaleDialog } from '@/components/Sales/SaleDialog';
import { format } from 'date-fns';

// Componente para Pedidos
function Pedidos() {
  const { data: sales, isLoading, error } = useSales({ saleType: 'traditional' });
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>();
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);

  const openSaleDialog = (sale?: Sale) => {
    setSelectedSale(sale);
    setIsSaleDialogOpen(true);
  };

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
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-destructive">Erro ao carregar vendas</h2>
        <p className="text-muted-foreground mt-2">Tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="space-mobile">
      <div className="flex-mobile gap-mobile items-center">
        <div className="flex-1">
          <h2 className="heading-mobile font-bold">Pedidos</h2>
          <p className="text-mobile text-muted-foreground">Gerencie todos os seus pedidos</p>
        </div>
        <Button 
          onClick={() => openSaleDialog()}
          className="btn-mobile bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Novo Pedido</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      <Card className="card-mobile">
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <div className="flex-mobile gap-mobile">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Buscar pedidos..." className="pl-10 input-mobile" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="table-mobile">
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="hidden sm:table-cell">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : sales?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma venda encontrada. Clique em "Nova Venda" para criar sua primeira venda.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales?.data?.map((venda) => (
                    <TableRow key={venda.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{venda.sale_number}</TableCell>
                      <TableCell className="hidden sm:table-cell">{venda.customers?.name || 'Cliente não informado'}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(venda.sale_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(venda.status)}>
                          {getStatusText(venda.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(venda.total_amount)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SaleDialog
        isOpen={isSaleDialogOpen}
        onClose={() => setIsSaleDialogOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
}

// Componente para PDV
function PDV() {
  return (
    <div className="space-mobile">
      <div className="mb-6">
        <h1 className="heading-mobile font-bold">Ponto de Venda (PDV)</h1>
        <p className="text-mobile text-muted-foreground">
          Sistema completo de vendas com controle de estoque e pagamentos.
        </p>
      </div>
      <POSInterface />
    </div>
  );
}

// Componente para Propostas
function Propostas() {
  const { data: proposals = [], isLoading } = useProposals();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = (proposal?: Proposal) => {
    setSelectedProposal(proposal);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-mobile">
      <div className="flex-mobile gap-mobile items-center">
        <div className="flex-1">
          <h1 className="heading-mobile font-bold">Propostas Comerciais</h1>
        </div>
        <Button onClick={() => openDialog()} className="btn-mobile">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nova Proposta</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      <ProposalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        proposal={selectedProposal}
      />
    </div>
  );
}

// Componente principal Vendas
export function Vendas() {
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/pedidos')) return 'pedidos';
    if (path.includes('/pdv')) return 'pdv';
    if (path.includes('/propostas')) return 'propostas';
    return 'pedidos';
  };

  return (
    <div className="space-mobile">
      <div>
        <h1 className="heading-mobile font-bold">Vendas</h1>
        <p className="text-mobile text-muted-foreground">Gerencie todos os seus pedidos e vendas</p>
      </div>

      <Tabs value={getActiveTab()} className="space-mobile">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="pedidos" asChild>
            <NavLink to="/vendas/pedidos" className="flex items-center justify-center space-x-2 py-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="pdv" asChild>
            <NavLink to="/vendas/pdv" className="flex items-center justify-center space-x-2 py-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">PDV</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="propostas" asChild>
            <NavLink to="/vendas/propostas" className="flex items-center justify-center space-x-2 py-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Propostas</span>
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
