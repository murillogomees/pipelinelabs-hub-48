
import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, ShoppingCart, CreditCard, FileText, Eye, Edit, MoreVertical } from 'lucide-react';
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
import { useMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

// Componente para Pedidos
function Pedidos() {
  const { data: sales, isLoading, error } = useSales({ saleType: 'traditional' });
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>();
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useMobile();

  const openSaleDialog = (sale?: Sale) => {
    setSelectedSale(sale);
    setIsSaleDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'approved': return 'bg-primary/10 text-primary border-primary/20';
      case 'delivered': return 'bg-success/10 text-success border-success/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
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

  const filteredSales = sales?.data?.filter(sale => 
    sale.sale_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-destructive/10 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Erro ao carregar pedidos</h2>
          <p className="text-muted-foreground text-sm">Tente novamente mais tarde ou entre em contato com o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-6 max-w-full">
      {/* Header Mobile Otimizado */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b mb-6 -mx-4 px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Pedidos</h1>
            {!isMobile && (
              <p className="text-sm text-muted-foreground truncate">
                Gerencie todos os seus pedidos de venda
              </p>
            )}
          </div>
          <Button 
            onClick={() => openSaleDialog()}
            className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isMobile ? 'Novo' : 'Novo Pedido'}
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="mb-6">
        <Card className="border-0 shadow-sm bg-card/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar por número ou cliente..." 
                  className="pl-10 h-10 text-base border-input bg-background focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-10 px-4 border-input">
                <Filter className="w-4 h-4 mr-2" />
                {isMobile ? 'Filtrar' : 'Filtros'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {isMobile ? (
          /* Layout Mobile - Cards */
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredSales.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="mb-4">
                    <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchTerm ? 'Tente ajustar sua busca' : 'Clique em "Novo Pedido" para criar seu primeiro pedido'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => openSaleDialog()} className="bg-primary text-primary-foreground">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Pedido
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredSales.map((venda) => (
                <Card key={venda.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header do Card */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-base">#{venda.sale_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {venda.customers?.name || 'Cliente não informado'}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(venda.status)} text-xs font-medium px-2 py-1`}>
                          {getStatusText(venda.status)}
                        </Badge>
                      </div>

                      {/* Informações */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Data:</span>
                          <div className="font-medium">
                            {new Date(venda.sale_date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">Valor:</span>
                          <div className="font-semibold text-lg text-primary">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(venda.total_amount)}
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-9"
                          onClick={() => openSaleDialog(venda)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-9"
                          onClick={() => openSaleDialog(venda)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          /* Layout Desktop - Tabela */
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="font-semibold">Pedido</TableHead>
                      <TableHead className="font-semibold">Cliente</TableHead>
                      <TableHead className="font-semibold">Data</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Valor</TableHead>
                      <TableHead className="font-semibold text-center w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 rounded mx-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground/50 mb-4" />
                            <h3 className="font-medium text-lg mb-2">Nenhum pedido encontrado</h3>
                            <p className="text-muted-foreground mb-4">
                              {searchTerm ? 'Tente ajustar sua busca' : 'Clique em "Novo Pedido" para criar seu primeiro pedido'}
                            </p>
                            {!searchTerm && (
                              <Button onClick={() => openSaleDialog()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Primeiro Pedido
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((venda) => (
                        <TableRow key={venda.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">#{venda.sale_number}</TableCell>
                          <TableCell>{venda.customers?.name || 'Cliente não informado'}</TableCell>
                          <TableCell>
                            {new Date(venda.sale_date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(venda.status)} text-xs font-medium`}>
                              {getStatusText(venda.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(venda.total_amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => openSaleDialog(venda)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openSaleDialog(venda)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar Pedido
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
export default function Vendas() {
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

      

      <Routes>
        <Route index element={<Pedidos />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="pdv" element={<PDV />} />
        <Route path="propostas" element={<Propostas />} />
      </Routes>
    </div>
  );
}
