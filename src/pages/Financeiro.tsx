import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, TrendingUp, TrendingDown, BarChart3, Search, Eye, Edit, Trash2, CheckCircle, AlertCircle, Clock, XCircle, PieChart, FileText, Activity } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAccountsReceivable } from '@/hooks/useAccountsReceivable';
import { AccountPayableDialog } from '@/components/Financial/AccountPayableDialog';
import { AccountReceivableDialog } from '@/components/Financial/AccountReceivableDialog';
import { FinancialDashboard } from '@/components/Financial/FinancialDashboard';
import { DREReport } from '@/components/Financial/DREReport';
import { CashFlowReport } from '@/components/Financial/CashFlowReport';
import { FinancialReports } from '@/components/Financial/FinancialReports';
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

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição ou cliente..."
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
            <SelectItem value="paid">Recebido</SelectItem>
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
                <TableHead>Cliente</TableHead>
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
                    <TableCell>{account.customers?.name || '-'}</TableCell>
                    <TableCell>R$ {account.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {account.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => receiveAccount(account.id)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {paidPayable.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Contas pagas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {receivedReceivable.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Contas recebidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {((totalReceivable - receivedReceivable) - (totalPayable - paidPayable)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">A receber - A pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contas a Pagar por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['pending', 'paid', 'overdue'].map(status => {
                const count = payableAccounts.filter(a => a.status === status).length;
                const amount = payableAccounts.filter(a => a.status === status).reduce((sum, a) => sum + a.amount, 0);
                const statusLabels = { pending: 'Pendente', paid: 'Pago', overdue: 'Vencido' };
                const statusColors = { pending: 'text-yellow-600', paid: 'text-green-600', overdue: 'text-red-600' };
                
                return (
                  <div key={status} className="flex justify-between items-center">
                    <span className={statusColors[status]}>{statusLabels[status]}</span>
                    <div className="text-right">
                      <div className="font-medium">R$ {amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">{count} contas</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contas a Receber por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['pending', 'paid', 'overdue'].map(status => {
                const count = receivableAccounts.filter(a => a.status === status).length;
                const amount = receivableAccounts.filter(a => a.status === status).reduce((sum, a) => sum + a.amount, 0);
                const statusLabels = { pending: 'Pendente', paid: 'Recebido', overdue: 'Vencido' };
                const statusColors = { pending: 'text-yellow-600', paid: 'text-green-600', overdue: 'text-red-600' };
                
                return (
                  <div key={status} className="flex justify-between items-center">
                    <span className={statusColors[status]}>{statusLabels[status]}</span>
                    <div className="text-right">
                      <div className="font-medium">R$ {amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">{count} contas</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente principal Financeiro
export function Financeiro() {
  const location = useLocation();
  
  // Determina a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/pagar')) return 'pagar';
    if (path.includes('/receber')) return 'receber';
    if (path.includes('/conciliacao')) return 'conciliacao';
    return 'pagar'; // padrão
  };

  // Calcular totais
  const totalPayable = payableAccounts.reduce((sum, account) => sum + account.amount, 0);
  const paidPayable = payableAccounts.filter(a => a.status === 'paid').reduce((sum, account) => sum + account.amount, 0);
  const totalReceivable = receivableAccounts.reduce((sum, account) => sum + account.amount, 0);
  const receivedReceivable = receivableAccounts.filter(a => a.status === 'paid').reduce((sum, account) => sum + account.amount, 0);

  const balance = receivedReceivable - paidPayable;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground">Gerencie suas finanças</p>
      </div>

      <Tabs value={getActiveTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pagar" asChild>
            <NavLink to="/financeiro/pagar" className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4" />
              <span>A Pagar</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="receber" asChild>
            <NavLink to="/financeiro/receber" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>A Receber</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="conciliacao" asChild>
            <NavLink to="/financeiro/conciliacao" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Conciliação</span>
            </NavLink>
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route index element={<ContasPagar />} />
          <Route path="pagar" element={<ContasPagar />} />
          <Route path="receber" element={<ContasReceber />} />
          <Route path="conciliacao" element={<Conciliacao />} />
        </Routes>
      </Tabs>
    </div>
  );
}
