import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Building2, CreditCard } from 'lucide-react';
import { useBankAccounts, type NewBankAccount, type BankAccount } from '@/hooks/useBankAccounts';

export const BankAccountsTab = () => {
  const { accounts, loading, createAccount, updateAccount, deleteAccount } = useBankAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState<NewBankAccount>({
    bank_name: '',
    account_type: 'corrente',
    agency: '',
    account_number: '',
    initial_balance: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formData);
      } else {
        await createAccount(formData);
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      bank_name: '',
      account_type: 'corrente',
      agency: '',
      account_number: '',
      initial_balance: 0
    });
    setEditingAccount(null);
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bank_name: account.bank_name,
      account_type: account.account_type,
      agency: account.agency || '',
      account_number: account.account_number,
      initial_balance: account.initial_balance
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta bancária?')) {
      await deleteAccount(id);
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const types = {
      corrente: 'Conta Corrente',
      poupanca: 'Poupança',
      carteira: 'Carteira Digital',
      digital: 'Banco Digital'
    };
    return types[type as keyof typeof types] || type;
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      corrente: 'bg-blue-100 text-blue-800',
      poupanca: 'bg-green-100 text-green-800',
      carteira: 'bg-purple-100 text-purple-800',
      digital: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando contas bancárias...</div>;
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.current_balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contas Bancárias</h2>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e saldos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Nome do Banco</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="Ex: Banco do Brasil"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="account_type">Tipo de Conta</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(value: any) => setFormData({ ...formData, account_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                      <SelectItem value="poupanca">Poupança</SelectItem>
                      <SelectItem value="carteira">Carteira Digital</SelectItem>
                      <SelectItem value="digital">Banco Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agency">Agência</Label>
                  <Input
                    id="agency"
                    value={formData.agency}
                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                    placeholder="0000"
                  />
                </div>
                <div>
                  <Label htmlFor="account_number">Número da Conta</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    placeholder="00000-0"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="initial_balance">Saldo Inicial</Label>
                <Input
                  id="initial_balance"
                  type="number"
                  step="0.01"
                  value={formData.initial_balance}
                  onChange={(e) => setFormData({ ...formData, initial_balance: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAccount ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">Contas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Todas as contas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Saldo</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {accounts.length > 0 ? 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(Math.max(...accounts.map(a => a.current_balance))) 
                : 'R$ 0,00'
              }
            </div>
            <p className="text-xs text-muted-foreground">Melhor posição</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de contas */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Contas Bancárias</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma conta bancária cadastrada ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Agência</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Saldo Atual</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.bank_name}</TableCell>
                    <TableCell>
                      <Badge className={getAccountTypeColor(account.account_type)}>
                        {getAccountTypeLabel(account.account_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.agency || '-'}</TableCell>
                    <TableCell>{account.account_number}</TableCell>
                    <TableCell>
                      <span className={account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(account.current_balance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(account.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};