import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, Calendar, PiggyBank, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  totalReceivable: number;
  totalPayable: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  overdueCount: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const FinancialDashboardNew = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalReceivable: 0,
    totalPayable: 0,
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    overdueCount: 0
  });
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas gerais
      const [receivableResult, payableResult, transactionsResult] = await Promise.all([
        supabase
          .from('accounts_receivable')
          .select('amount, status')
          .eq('status', 'pending'),
        supabase
          .from('accounts_payable')
          .select('amount, status')
          .eq('status', 'pending'),
        supabase
          .from('financial_transactions')
          .select('amount, type, status, transaction_date, financial_categories(name, color)')
          .gte('transaction_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
      ]);

      const receivableTotal = receivableResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const payableTotal = payableResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      const transactions = transactionsResult.data || [];
      const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const monthlyExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Buscar contas vencidas
      const overdueResult = await supabase
        .from('financial_transactions')
        .select('id')
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString().split('T')[0]);

      const overdueCount = overdueResult.data?.length || 0;

      setStats({
        totalReceivable: receivableTotal,
        totalPayable: payableTotal,
        totalBalance: receivableTotal - payableTotal,
        monthlyIncome,
        monthlyExpense,
        overdueCount
      });

      // Preparar dados por categoria
      const categoryMap = new Map<string, number>();
      transactions.forEach(transaction => {
        if (transaction.financial_categories?.name) {
          const current = categoryMap.get(transaction.financial_categories.name) || 0;
          categoryMap.set(transaction.financial_categories.name, current + Number(transaction.amount));
        }
      });

      const categoryChartData = Array.from(categoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));

      setCategoryData(categoryChartData);

      // Preparar dados de fluxo de caixa (últimos 6 meses)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          income: Math.random() * 50000 + 20000, // Dados simulados por enquanto
          expense: Math.random() * 40000 + 15000
        };
      }).reverse();

      setCashFlowData(last6Months);

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchDashboardData}>
            <Calendar className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalReceivable)}
            </div>
            <p className="text-xs text-muted-foreground">Contas pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalPayable)}
            </div>
            <p className="text-xs text-muted-foreground">Contas pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Geral</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Saldo consolidado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.overdueCount}</div>
            <p className="text-xs text-muted-foreground">Necessitam atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="flow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="comparison">Receitas vs Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa - Últimos 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                        ''
                      ]}
                    />
                    <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Receitas" />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Despesas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                        'Valor'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas - Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                        ''
                      ]}
                    />
                    <Bar dataKey="income" fill="#22c55e" name="Receitas" />
                    <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};