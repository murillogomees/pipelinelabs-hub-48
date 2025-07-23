import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Download, RefreshCw } from 'lucide-react';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAccountsReceivable } from '@/hooks/useAccountsReceivable';
import { useSales } from '@/hooks/useSales';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DREReport() {
  const [period, setPeriod] = useState('current-month');
  const [isLoading, setIsLoading] = useState(false);
  
  const { accounts: payableAccounts } = useAccountsPayable();
  const { accounts: receivableAccounts } = useAccountsReceivable();
  const { data: sales } = useSales();

  const getPeriodDates = () => {
    const now = new Date();
    
    switch (period) {
      case 'current-month':
        return { start: startOfMonth(now), end: endOfMonth(now), label: format(now, 'MMMM yyyy', { locale: ptBR }) };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth), label: format(lastMonth, 'MMMM yyyy', { locale: ptBR }) };
      case 'current-year':
        return { start: startOfYear(now), end: endOfYear(now), label: format(now, 'yyyy') };
      case 'last-year':
        const lastYear = subYears(now, 1);
        return { start: startOfYear(lastYear), end: endOfYear(lastYear), label: format(lastYear, 'yyyy') };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now), label: format(now, 'MMMM yyyy', { locale: ptBR }) };
    }
  };

  const { start, end, label } = getPeriodDates();

  // Receitas
  const periodSales = sales?.data?.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    return saleDate >= start && saleDate <= end && sale.status !== 'cancelled';
  }) || [];

  const periodReceivables = receivableAccounts.filter(account => {
    const accountDate = new Date(account.payment_date || account.due_date);
    return accountDate >= start && accountDate <= end && account.status === 'paid';
  });

  // Receitas operacionais
  const salesRevenue = periodSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const otherRevenues = periodReceivables
    .filter(account => !periodSales.some(sale => sale.id === account.sale_id))
    .reduce((sum, account) => sum + account.amount, 0);
  
  const totalRevenues = salesRevenue + otherRevenues;

  // Custos e despesas
  const periodPayables = payableAccounts.filter(account => {
    const accountDate = new Date(account.payment_date || account.due_date);
    return accountDate >= start && accountDate <= end && account.status === 'paid';
  });

  // Categorizar despesas
  const costOfGoodsSold = periodPayables
    .filter(account => account.category === 'Fornecedores')
    .reduce((sum, account) => sum + account.amount, 0);

  const operatingExpenses = periodPayables
    .filter(account => ['Aluguel', 'Energia', 'Telefone', 'Internet', 'Material de Escritório', 'Marketing'].includes(account.category || ''))
    .reduce((sum, account) => sum + account.amount, 0);

  const administrativeExpenses = periodPayables
    .filter(account => ['Serviços', 'Outros'].includes(account.category || ''))
    .reduce((sum, account) => sum + account.amount, 0);

  const taxes = periodPayables
    .filter(account => account.category === 'Impostos')
    .reduce((sum, account) => sum + account.amount, 0);

  const financialExpenses = periodPayables
    .filter(account => account.category === 'Combustível')
    .reduce((sum, account) => sum + account.amount, 0);

  // Cálculos DRE
  const grossProfit = totalRevenues - costOfGoodsSold;
  const operatingProfit = grossProfit - operatingExpenses - administrativeExpenses;
  const profitBeforeTaxes = operatingProfit - financialExpenses;
  const netProfit = profitBeforeTaxes - taxes;

  // Margens
  const grossMargin = totalRevenues > 0 ? (grossProfit / totalRevenues) * 100 : 0;
  const operatingMargin = totalRevenues > 0 ? (operatingProfit / totalRevenues) * 100 : 0;
  const netMargin = totalRevenues > 0 ? (netProfit / totalRevenues) * 100 : 0;

  const dreData = [
    {
      category: 'RECEITAS OPERACIONAIS',
      items: [
        { name: 'Vendas de Produtos/Serviços', value: salesRevenue },
        { name: 'Outras Receitas', value: otherRevenues },
      ],
      total: totalRevenues,
      isTotal: true,
      level: 0
    },
    {
      category: 'CUSTOS DOS PRODUTOS VENDIDOS',
      items: [
        { name: 'Custo das Mercadorias/Matéria Prima', value: costOfGoodsSold },
      ],
      total: costOfGoodsSold,
      isDeduction: true,
      level: 0
    },
    {
      category: 'LUCRO BRUTO',
      value: grossProfit,
      margin: grossMargin,
      isResult: true,
      level: 0
    },
    {
      category: 'DESPESAS OPERACIONAIS',
      items: [
        { name: 'Despesas Administrativas', value: administrativeExpenses },
        { name: 'Despesas Comerciais', value: operatingExpenses },
      ],
      total: operatingExpenses + administrativeExpenses,
      isDeduction: true,
      level: 0
    },
    {
      category: 'LUCRO OPERACIONAL',
      value: operatingProfit,
      margin: operatingMargin,
      isResult: true,
      level: 0
    },
    {
      category: 'DESPESAS FINANCEIRAS',
      items: [
        { name: 'Juros e Encargos', value: financialExpenses },
      ],
      total: financialExpenses,
      isDeduction: true,
      level: 0
    },
    {
      category: 'LUCRO ANTES DOS IMPOSTOS',
      value: profitBeforeTaxes,
      isResult: true,
      level: 0
    },
    {
      category: 'IMPOSTOS E CONTRIBUIÇÕES',
      items: [
        { name: 'Impostos sobre Lucro', value: taxes },
      ],
      total: taxes,
      isDeduction: true,
      level: 0
    },
    {
      category: 'LUCRO LÍQUIDO',
      value: netProfit,
      margin: netMargin,
      isResult: true,
      isFinal: true,
      level: 0
    }
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simular refresh dos dados
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // Implementar exportação para PDF/Excel
    console.log('Exportando DRE...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">DRE - Demonstração do Resultado</h2>
          <p className="text-muted-foreground">Demonstração detalhada dos resultados financeiros</p>
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
              <SelectItem value="current-month">Mês Atual</SelectItem>
              <SelectItem value="last-month">Mês Anterior</SelectItem>
              <SelectItem value="current-year">Ano Atual</SelectItem>
              <SelectItem value="last-year">Ano Anterior</SelectItem>
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
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {totalRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <p className="text-sm text-muted-foreground">Lucro Bruto</p>
                <p className="text-xl font-bold">
                  R$ {grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{grossMargin.toFixed(1)}% de margem</p>
              </div>
              <Badge variant={grossProfit >= 0 ? "default" : "destructive"}>
                {grossMargin.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Operacional</p>
                <p className="text-xl font-bold">
                  R$ {operatingProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{operatingMargin.toFixed(1)}% de margem</p>
              </div>
              <Badge variant={operatingProfit >= 0 ? "default" : "destructive"}>
                {operatingMargin.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{netMargin.toFixed(1)}% de margem</p>
              </div>
              {netProfit >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DRE detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Demonstração do Resultado do Exercício</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Descrição</TableHead>
                <TableHead className="text-right">Valor (R$)</TableHead>
                <TableHead className="text-right">% sobre Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dreData.map((section, index) => (
                <React.Fragment key={index}>
                  {section.items ? (
                    <>
                      <TableRow className="font-semibold bg-muted/50">
                        <TableCell className="font-bold">{section.category}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {section.items.map((item, itemIndex) => (
                        <TableRow key={itemIndex}>
                          <TableCell className="pl-6">{item.name}</TableCell>
                          <TableCell className="text-right">
                            {section.isDeduction ? '-' : ''}R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            {totalRevenues > 0 ? ((item.value / totalRevenues) * 100).toFixed(1) : '0.0'}%
                          </TableCell>
                        </TableRow>
                      ))}
                      {section.total !== undefined && (
                        <TableRow className="font-semibold border-t">
                          <TableCell className="pl-6">Total {section.category}</TableCell>
                          <TableCell className="text-right font-bold">
                            {section.isDeduction ? '-' : ''}R$ {section.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {totalRevenues > 0 ? ((section.total / totalRevenues) * 100).toFixed(1) : '0.0'}%
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ) : (
                    <TableRow className={`font-bold ${section.isFinal ? 'bg-primary/10 border-t-2 border-primary' : 'bg-muted/30'}`}>
                      <TableCell className="font-bold text-lg">{section.category}</TableCell>
                      <TableCell className={`text-right font-bold text-lg ${section.value && section.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {section.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {section.margin ? `${section.margin.toFixed(1)}%` : '-'}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}