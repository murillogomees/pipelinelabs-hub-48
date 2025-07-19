import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAccountsReceivable } from '@/hooks/useAccountsReceivable';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function FinancialDashboard() {
  const { accounts: payableAccounts } = useAccountsPayable();
  const { accounts: receivableAccounts } = useAccountsReceivable();

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Contas a receber
  const currentReceivables = receivableAccounts.filter(
    account => new Date(account.due_date) >= currentMonthStart && new Date(account.due_date) <= currentMonthEnd
  );
  const lastMonthReceivables = receivableAccounts.filter(
    account => new Date(account.due_date) >= lastMonthStart && new Date(account.due_date) <= lastMonthEnd
  );

  // Contas a pagar
  const currentPayables = payableAccounts.filter(
    account => new Date(account.due_date) >= currentMonthStart && new Date(account.due_date) <= currentMonthEnd
  );
  const lastMonthPayables = payableAccounts.filter(
    account => new Date(account.due_date) >= lastMonthStart && new Date(account.due_date) <= lastMonthEnd
  );

  // Cálculos de receitas
  const currentRevenue = currentReceivables.reduce((sum, account) => sum + account.amount, 0);
  const lastMonthRevenue = lastMonthReceivables.reduce((sum, account) => sum + account.amount, 0);
  const revenueGrowth = lastMonthRevenue > 0 ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  // Cálculos de despesas
  const currentExpenses = currentPayables.reduce((sum, account) => sum + account.amount, 0);
  const lastMonthExpenses = lastMonthPayables.reduce((sum, account) => sum + account.amount, 0);
  const expenseGrowth = lastMonthExpenses > 0 ? ((currentExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

  // Fluxo de caixa
  const cashFlow = currentRevenue - currentExpenses;
  const lastMonthCashFlow = lastMonthRevenue - lastMonthExpenses;
  const cashFlowGrowth = lastMonthCashFlow !== 0 ? ((cashFlow - lastMonthCashFlow) / Math.abs(lastMonthCashFlow)) * 100 : 0;

  // Contas vencidas
  const overdueReceivables = receivableAccounts.filter(
    account => new Date(account.due_date) < now && account.status === 'pending'
  );
  const overduePayables = payableAccounts.filter(
    account => new Date(account.due_date) < now && account.status === 'pending'
  );

  // Contas recebidas/pagas este mês
  const paidReceivables = currentReceivables.filter(account => account.status === 'paid');
  const paidPayables = currentPayables.filter(account => account.status === 'paid');

  const receivablesProgress = currentReceivables.length > 0 ? (paidReceivables.length / currentReceivables.length) * 100 : 0;
  const payablesProgress = currentPayables.length > 0 ? (paidPayables.length / currentPayables.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h2>
        <p className="text-muted-foreground">
          Visão geral das finanças de {format(now, 'MMMM yyyy', { locale: ptBR })}
        </p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {currentRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(revenueGrowth).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {currentExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {expenseGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
              )}
              {Math.abs(expenseGrowth).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {cashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {cashFlowGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(cashFlowGrowth).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentRevenue > 0 ? ((cashFlow / currentRevenue) * 100).toFixed(1) : '0.0'}%
            </div>
            <div className="text-xs text-muted-foreground">
              Margem líquida do período
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e contas vencidas */}
      {(overdueReceivables.length > 0 || overduePayables.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Atenção - Contas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueReceivables.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-700">
                  {overdueReceivables.length} conta(s) a receber vencida(s)
                </span>
                <Badge variant="outline" className="text-orange-700 border-orange-700">
                  R$ {overdueReceivables.reduce((sum, account) => sum + account.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              </div>
            )}
            {overduePayables.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-700">
                  {overduePayables.length} conta(s) a pagar vencida(s)
                </span>
                <Badge variant="outline" className="text-orange-700 border-orange-700">
                  R$ {overduePayables.reduce((sum, account) => sum + account.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progresso de recebimentos e pagamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Recebimentos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{paidReceivables.length} de {currentReceivables.length} contas</span>
            </div>
            <Progress value={receivablesProgress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Recebido</span>
              <span>
                R$ {paidReceivables.reduce((sum, account) => sum + account.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Pagamentos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{paidPayables.length} de {currentPayables.length} contas</span>
            </div>
            <Progress value={payablesProgress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pago</span>
              <span>
                R$ {paidPayables.reduce((sum, account) => sum + account.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}