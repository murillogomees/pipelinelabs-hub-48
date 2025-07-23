import React, { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  TrendingDown, 
  TrendingUp, 
  BarChart3, 
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  Building,
  Banknote,
  Receipt,
  Tags,
  Settings,
  GitBranch,
  FileSpreadsheet,
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle
} from 'lucide-react';
import { FinancialDashboard, DREReport, CashFlowReport, FinancialReports } from '@/components/Financial';
import { FinancialDashboardNew } from '@/components/Financial/FinancialDashboardNew';
import { BankAccountsTab } from '@/components/Financial/BankAccountsTab';
import { useAccountsPayable, type NewAccountPayable, type AccountPayable } from '@/hooks/useAccountsPayable';
import { useAccountsReceivable, type NewAccountReceivable, type AccountReceivable } from '@/hooks/useAccountsReceivable';
import { useFinancialTransactions } from '@/hooks/useFinancialTransactions';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { AccountPayableDialog } from '@/components/Financial/AccountPayableDialog';
import { AccountReceivableDialog } from '@/components/Financial/AccountReceivableDialog';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente para Contas a Pagar
function ContasPagar() {
  const { accounts, loading, createAccount, updateAccount, payAccount, deleteAccount } = useAccountsPayable();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>,
      paid: <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>,
      overdue: <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" />Vencido</Badge>,
      cancelled: <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>
    };
    return badges[status] || badges.pending;
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredAccounts.reduce((sum, account) => sum + account.amount, 0);
  const paidAmount = filteredAccounts.filter(a => a.status === 'paid').reduce((sum, account) => sum + account.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Contas a Pagar</h2>
          <p className="text-muted-foreground">Gerencie suas obrigações financeiras</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {pendingAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {paidAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhuma conta encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.description}</TableCell>
                    <TableCell>{account.suppliers?.name || '-'}</TableCell>
                    <TableCell>R$ {account.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {account.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => payAccount(account.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAccount(account);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAccount(account.id)}
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
        </CardContent>
      </Card>

      <AccountPayableDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingAccount(null);
        }}
        onSave={createAccount}
        onUpdate={updateAccount}
        account={editingAccount}
      />
    </div>
  );
}

// Componente para Contas a Receber
function ContasReceber() {
  const { accounts, loading, createAccount, updateAccount, receiveAccount, deleteAccount } = useAccountsReceivable();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>,
      paid: <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Recebido</Badge>,
      overdue: <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" />Vencido</Badge>,
      cancelled: <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>
    };
    return badges[status] || badges.pending;
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredAccounts.reduce((sum, account) => sum + account.amount, 0);
  const receivedAmount = filteredAccounts.filter(a => a.status === 'paid').reduce((sum, account) => sum + account.amount, 0);
  const pendingAmount = totalAmount - receivedAmount;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Contas a Receber</h2>
          <p className="text-muted-foreground">Gerencie seus recebimentos</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">R$ {pendingAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebido</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {receivedAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <AccountReceivableDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingAccount(null);
        }}
        onSave={createAccount}
        onUpdate={updateAccount}
        account={editingAccount}
      />
    </div>
  );
}

const Financeiro = () => {
  const location = useLocation();

  const getCurrentTab = () => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'dashboard':
        return 'dashboard';
      case 'contas-pagar':
        return 'contas-pagar';
      case 'contas-receber':
        return 'contas-receber';
      case 'contas-bancarias':
        return 'contas-bancarias';
      case 'lancamentos':
        return 'lancamentos';
      case 'categorias':
        return 'categorias';
      case 'conciliacao':
        return 'conciliacao';
      case 'relatorios':
        return 'relatorios';
      case 'configuracoes':
        return 'configuracoes';
      default:
        return 'dashboard';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Financeiro</h1>
        <p className="text-muted-foreground">Gerencie as finanças da sua empresa de forma eficiente</p>
      </div>

      <Tabs value={getCurrentTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-9 text-xs">
          <TabsTrigger value="dashboard" asChild>
            <NavLink to="/app/financeiro/dashboard" className="flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden lg:inline">Dashboard</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="contas-pagar" asChild>
            <NavLink to="/app/financeiro/contas-pagar" className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              <span className="hidden lg:inline">A Pagar</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="contas-receber" asChild>
            <NavLink to="/app/financeiro/contas-receber" className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline">A Receber</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="contas-bancarias" asChild>
            <NavLink to="/app/financeiro/contas-bancarias" className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              <span className="hidden lg:inline">Bancos</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="lancamentos" asChild>
            <NavLink to="/app/financeiro/lancamentos" className="flex items-center gap-1">
              <Receipt className="w-4 h-4" />
              <span className="hidden lg:inline">Lançamentos</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="categorias" asChild>
            <NavLink to="/app/financeiro/categorias" className="flex items-center gap-1">
              <Tags className="w-4 h-4" />
              <span className="hidden lg:inline">Categorias</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="conciliacao" asChild>
            <NavLink to="/app/financeiro/conciliacao" className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              <span className="hidden lg:inline">Conciliação</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="relatorios" asChild>
            <NavLink to="/app/financeiro/relatorios" className="flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden lg:inline">Relatórios</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="configuracoes" asChild>
            <NavLink to="/app/financeiro/configuracoes" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">Config</span>
            </NavLink>
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route path="/" element={<Navigate to="/app/financeiro/dashboard" replace />} />
          <Route path="/dashboard" element={<FinancialDashboardNew />} />
          <Route path="/contas-pagar" element={<ContasPagar />} />
          <Route path="/contas-receber" element={<ContasReceber />} />
          <Route path="/contas-bancarias" element={<BankAccountsTab />} />
          <Route path="/lancamentos" element={<div className="p-8 text-center text-muted-foreground">Lançamentos financeiros em desenvolvimento</div>} />
          <Route path="/categorias" element={<div className="p-8 text-center text-muted-foreground">Categorias em desenvolvimento</div>} />
          <Route path="/conciliacao" element={<div className="p-8 text-center text-muted-foreground">Conciliação bancária em desenvolvimento</div>} />
          <Route path="/relatorios" element={<FinancialReports />} />
          <Route path="/configuracoes" element={<div className="p-8 text-center text-muted-foreground">Configurações financeiras em desenvolvimento</div>} />
        </Routes>
      </Tabs>
    </div>
  );
};

export default Financeiro;