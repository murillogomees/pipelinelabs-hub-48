import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  DollarSign
} from 'lucide-react';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAccountsReceivable } from '@/hooks/useAccountsReceivable';
import { useSales } from '@/hooks/useSales';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function FinancialReports() {
  const [reportType, setReportType] = useState('monthly-comparison');
  const [period, setPeriod] = useState('6-months');
  
  const { accounts: payableAccounts } = useAccountsPayable();
  const { accounts: receivableAccounts } = useAccountsReceivable();
  const { data: sales } = useSales();

  // Preparar dados para relatórios
  const getMonthlyData = (months: number) => {
    const data = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Vendas do mês
      const monthSales = sales?.data?.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= monthStart && saleDate <= monthEnd && sale.status !== 'cancelled';
      }) || [];
      
      // Contas recebidas no mês
      const monthReceivables = receivableAccounts.filter(account => {
        const paymentDate = account.payment_date ? new Date(account.payment_date) : null;
        return paymentDate && paymentDate >= monthStart && paymentDate <= monthEnd && account.status === 'paid';
      });
      
      // Contas pagas no mês
      const monthPayables = payableAccounts.filter(account => {
        const paymentDate = account.payment_date ? new Date(account.payment_date) : null;
        return paymentDate && paymentDate >= monthStart && paymentDate <= monthEnd && account.status === 'paid';
      });
      
      const revenue = monthSales.reduce((sum, sale) => sum + sale.total_amount, 0) +
                    monthReceivables.reduce((sum, account) => sum + account.amount, 0);
      const expenses = monthPayables.reduce((sum, account) => sum + account.amount, 0);
      const profit = revenue - expenses;
      
      data.push({
        month: format(monthDate, 'MMM yyyy', { locale: ptBR }),
        revenue,
        expenses,
        profit,
        sales: monthSales.length,
        averageTicket: monthSales.length > 0 ? revenue / monthSales.length : 0
      });
    }
    
    return data;
  };

  // Dados por categoria de despesas
  const getExpensesByCategory = () => {
    const categories = {};
    
    payableAccounts
      .filter(account => account.status === 'paid')
      .forEach(account => {
        const category = account.category || 'Outros';
        categories[category] = (categories[category] || 0) + account.amount;
      });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  // Dados por forma de pagamento
  const getPaymentMethodData = () => {
    const methods = {};
    
    receivableAccounts
      .filter(account => account.status === 'paid' && account.payment_method)
      .forEach(account => {
        const method = account.payment_method;
        methods[method] = (methods[method] || 0) + account.amount;
      });
    
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  };

  const monthsCount = period === '3-months' ? 3 : period === '6-months' ? 6 : 12;
  const monthlyData = getMonthlyData(monthsCount);
  const expenseCategories = getExpensesByCategory();
  const paymentMethods = getPaymentMethodData();

  // Calcular totais e médias
  const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const avgMonthlyRevenue = totalRevenue / monthsCount;
  const avgMonthlyExpenses = totalExpenses / monthsCount;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const handleExport = (type: string) => {
    console.log(`Exportando relatório: ${type}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">Análises e insights financeiros detalhados</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3-months">3 Meses</SelectItem>
              <SelectItem value="6-months">6 Meses</SelectItem>
              <SelectItem value="12-months">12 Meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('all')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Média: R$ {avgMonthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Média: R$ {avgMonthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Total</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Média: R$ {(totalProfit / monthsCount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Sobre a receita total
                </p>
              </div>
              <Target className={`h-8 w-8 ${profitMargin >= 20 ? 'text-green-600' : profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e relatórios */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">Comparativo Mensal</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="payment-methods">Formas de Pagamento</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10B981" name="Receitas" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução do Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Lucro']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranking de Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseCategories
                    .sort((a, b) => (b.value as number) - (a.value as number))
                    .map((category, index) => {
                      const percentage = totalExpenses > 0 ? ((category.value as number) / totalExpenses) * 100 : 0;
                      return (
                        <div key={category.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-sm text-muted-foreground">
                              R$ {(category.value as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="text-xs text-muted-foreground text-right">
                            {percentage.toFixed(1)}% do total
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recebimentos por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={paymentMethods} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number"
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências e Projeções</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8884d8" 
                    name="Número de Vendas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="averageTicket" 
                    stroke="#82ca9d" 
                    name="Ticket Médio (R$)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Crescimento Médio Mensal</p>
                  <p className="text-2xl font-bold text-blue-600">
                      {monthlyData.length > 1 ? 
                        (((monthlyData[monthlyData.length - 1].revenue / monthlyData[0].revenue) ** (1 / (monthlyData.length - 1)) - 1) * 100).toFixed(1)
                        : '0.0'
                      }%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {(monthlyData.reduce((sum, month) => sum + month.averageTicket, 0) / monthlyData.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Eficiência Operacional</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}