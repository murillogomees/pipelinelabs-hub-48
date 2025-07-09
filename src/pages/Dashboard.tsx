
import React from 'react';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  FileText, 
  TrendingUp,
  Users,
  AlertTriangle,
  Clock
} from 'lucide-react';

export function Dashboard() {
  const stats = [
    {
      title: 'Vendas do Mês',
      value: 'R$ 45.231,90',
      icon: DollarSign,
      change: '+12.5% vs mês anterior',
      changeType: 'positive' as const,
      color: 'bg-green-500'
    },
    {
      title: 'Pedidos Pendentes',
      value: '23',
      icon: ShoppingCart,
      change: '5 novos hoje',
      changeType: 'positive' as const,
      color: 'bg-blue-500'
    },
    {
      title: 'Produtos em Estoque',
      value: '1.247',
      icon: Package,
      change: '12 abaixo do mínimo',
      changeType: 'negative' as const,
      color: 'bg-orange-500'
    },
    {
      title: 'Notas Emitidas',
      value: '156',
      icon: FileText,
      change: '+8 hoje',
      changeType: 'positive' as const,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Vendas dos Últimos 7 Dias</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Gráfico de vendas aqui</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span>Atividades Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Nova venda realizada</p>
                  <p className="text-xs text-gray-500">há 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">NFe emitida com sucesso</p>
                  <p className="text-xs text-gray-500">há 15 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Produto com estoque baixo</p>
                  <p className="text-xs text-gray-500">há 1 hora</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Novo cliente cadastrado</p>
                  <p className="text-xs text-gray-500">há 2 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-orange-600" />
              <span>Produtos Mais Vendidos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Produto A', sales: '145 vendas' },
                { name: 'Produto B', sales: '98 vendas' },
                { name: 'Produto C', sales: '76 vendas' },
                { name: 'Produto D', sales: '54 vendas' }
              ].map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-sm text-gray-500">{product.sales}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Principais Clientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Cliente Premium', value: 'R$ 12.500' },
                { name: 'Empresa XYZ', value: 'R$ 8.900' },
                { name: 'Loja ABC', value: 'R$ 6.700' },
                { name: 'Distribuidor 1', value: 'R$ 5.200' }
              ].map((client, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{client.name}</span>
                  <span className="text-sm text-gray-500">{client.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Alertas Importantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">12 produtos com estoque baixo</p>
                <p className="text-xs text-red-600">Reabastecer urgente</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">5 pedidos pendentes</p>
                <p className="text-xs text-yellow-600">Há mais de 2 dias</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Backup realizado</p>
                <p className="text-xs text-blue-600">Última sincronização: hoje às 03:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
