import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  RefreshCw, 
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet
} from 'lucide-react';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAccountsReceivable } from '@/hooks/useAccountsReceivable';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CashFlowReport() {
  const [period, setPeriod] = useState('next-30-days');
  const [isLoading, setIsLoading] = useState(false);
  
  const { accounts: payableAccounts } = useAccountsPayable();
  const { accounts: receivableAccounts } = useAccountsReceivable();

  const getPeriodDates = () => {
    const now = new Date();
    
    switch (period) {
      case 'next-7-days':
        return { start: now, end: addDays(now, 7), label: 'Próximos 7 dias' };
      case 'next-15-days':
        return { start: now, end: addDays(now, 15), label: 'Próximos 15 dias' };
      case 'next-30-days':
        return { start: now, end: addDays(now, 30), label: 'Próximos 30 dias' };
      case 'current-week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }), label: 'Esta semana' };
      case 'current-month':
        return { start: startOfMonth(now), end: endOfMonth(now), label: format(now, 'MMMM yyyy', { locale: ptBR }) };
      default:
        return { start: now, end: addDays(now, 30), label: 'Próximos 30 dias' };
    }
  };

  const { start, end, label } = getPeriodDates();

  // Filtrar contas por período
  const periodReceivables = receivableAccounts.filter(account => {
    const dueDate = new Date(account.due_date);
    return dueDate >= start && dueDate <= end && account.status === 'pending';
  });

  const periodPayables = payableAccounts.filter(account => {
    const dueDate = new Date(account.due_date);
    return dueDate >= start && dueDate <= end && account.status === 'pending';
  });

  // Calcular totais
  const totalInflow = periodReceivables.reduce((sum, account) => sum + account.amount, 0);
  const totalOutflow = periodPayables.reduce((sum, account) => sum + account.amount, 0);
  const netCashFlow = totalInflow - totalOutflow;

  // Agrupar por data
  const dailyCashFlow = eachDayOfInterval({ start, end }).map(date => {
    const dateKey = format(date, 'yyyy-MM-dd');
    
    const dayReceivables = periodReceivables.filter(account => 
      format(new Date(account.due_date), 'yyyy-MM-dd') === dateKey
    );
    
    const dayPayables = periodPayables.filter(account => 
      format(new Date(account.due_date), 'yyyy-MM-dd') === dateKey
    );
    
    const inflow = dayReceivables.reduce((sum, account) => sum + account.amount, 0);
    const outflow = dayPayables.reduce((sum, account) => sum + account.amount, 0);
    const net = inflow - outflow;
    
    return {
      date,
      dateKey,
      inflow,
      outflow,
      net,
      receivables: dayReceivables,
      payables: dayPayables
    };
  });

  // Calcular saldo acumulado (assumindo saldo inicial zero)
  let accumulatedBalance = 0;
  const cashFlowWithBalance = dailyCashFlow.map(day => {
    accumulatedBalance += day.net;
    return {
      ...day,
      balance: accumulatedBalance
    };
  });

  // Identificar dias críticos (saldo negativo)
  const criticalDays = cashFlowWithBalance.filter(day => day.balance < 0);
  
  // Contas vencidas
  const overdueReceivables = receivableAccounts.filter(account => 
    new Date(account.due_date) < new Date() && account.status === 'pending'
  );
  const overduePayables = payableAccounts.filter(account => 
    new Date(account.due_date) < new Date() && account.status === 'pending'
  );

  const handleRefresh = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    console.log('Exportando fluxo de caixa...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fluxo de Caixa</h2>
          <p className="text-muted-foreground">Projeção de entradas e saídas de caixa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Seletor de período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Período: {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next-7-days">Próximos 7 dias</SelectItem>
              <SelectItem value="next-15-days">Próximos 15 dias</SelectItem>
              <SelectItem value="next-30-days">Próximos 30 dias</SelectItem>
              <SelectItem value="current-week">Esta semana</SelectItem>
              <SelectItem value="current-month">Este mês</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Resumo executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total a Receber</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {totalInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{periodReceivables.length} contas</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total a Pagar</p>
                <p className="text-xl font-bold text-red-600">
                  R$ {totalOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{periodPayables.length} contas</p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fluxo Líquido</p>
                <p className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {netCashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">Saldo do período</p>
              </div>
              <Wallet className={`h-8 w-8 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dias Críticos</p>
                <p className="text-xl font-bold text-orange-600">
                  {criticalDays.length}
                </p>
                <p className="text-xs text-muted-foreground">Saldo negativo</p>
              </div>
              <Badge variant={criticalDays.length > 0 ? "destructive" : "default"}>
                {criticalDays.length > 0 ? 'Atenção' : 'OK'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de contas vencidas */}
      {(overdueReceivables.length > 0 || overduePayables.length > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Contas Vencidas - Ação Necessária</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueReceivables.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700">
                  {overdueReceivables.length} conta(s) a receber vencida(s)
                </span>
                <Badge variant="outline" className="text-red-700 border-red-700">
                  R$ {overdueReceivables.reduce((sum, account) => sum + account.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              </div>
            )}
            {overduePayables.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700">
                  {overduePayables.length} conta(s) a pagar vencida(s)
                </span>
                <Badge variant="outline" className="text-red-700 border-red-700">
                  R$ {overduePayables.reduce((sum, account) => sum + account.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fluxo de caixa detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa Diário</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Entradas</TableHead>
                <TableHead className="text-right">Saídas</TableHead>
                <TableHead className="text-right">Saldo Diário</TableHead>
                <TableHead className="text-right">Saldo Acumulado</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlowWithBalance
                .filter(day => day.inflow > 0 || day.outflow > 0 || day.balance < 0)
                .map((day, index) => (
                <TableRow key={index} className={day.balance < 0 ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">
                    {format(day.date, 'dd/MM/yyyy - EEEE', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {day.inflow > 0 ? `R$ ${day.inflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {day.outflow > 0 ? `R$ ${day.outflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${day.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {day.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${day.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {day.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {day.balance < 0 ? (
                      <Badge variant="destructive">Crítico</Badge>
                    ) : day.net > 0 ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Positivo</Badge>
                    ) : day.net < 0 ? (
                      <Badge variant="outline" className="text-orange-700 border-orange-700">Negativo</Badge>
                    ) : (
                      <Badge variant="outline">Neutro</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {cashFlowWithBalance.filter(day => day.inflow > 0 || day.outflow > 0).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma movimentação financeira prevista para este período
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}