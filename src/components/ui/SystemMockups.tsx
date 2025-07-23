import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  BarChart3, 
  Bell, 
  ShoppingCart,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  Settings,
  Search,
  Filter,
  Calendar,
  PieChart,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MockupDashboardProps {
  className?: string;
}

export const MockupDashboard = ({ className = "" }: MockupDashboardProps) => (
  <div className={`bg-gray-50 border rounded-xl p-6 shadow-lg ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Dashboard Principal</h2>
      </div>
      <div className="flex gap-2">
        <Bell className="h-5 w-5 text-yellow-500" />
        <Settings className="h-5 w-5 text-gray-500" />
      </div>
    </div>

    {/* Main Metrics */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vendas Hoje</p>
              <p className="text-2xl font-bold text-green-600">R$ 2.847</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pedidos</p>
              <p className="text-2xl font-bold text-blue-600">23</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Estoque Baixo</p>
              <p className="text-2xl font-bold text-red-600">7</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Chart Section */}
    <Card className="bg-white shadow-sm mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-800">Gráfico de Vendas</span>
        </div>
        <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-50 rounded flex items-end justify-center">
          <span className="text-sm text-gray-600 mb-4">Dashboard completo</span>
        </div>
      </CardContent>
    </Card>

    {/* Bottom Section */}
    <div className="grid grid-cols-3 gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BarChart3 className="h-4 w-4 text-blue-500" />
        <span>Vendas do dia</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Bell className="h-4 w-4 text-yellow-500" />
        <span>Notificações de pedidos</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="h-4 w-4 text-green-500" />
        <span>Estoque e DRE visual</span>
      </div>
    </div>
  </div>
);

export const MockupPDV = ({ className = "" }: MockupPDVProps) => (
  <div className={`bg-white border rounded-xl p-6 shadow-lg ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-bold text-gray-800">PDV - Ponto de Venda</h2>
      </div>
      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
        Online
      </span>
    </div>

    {/* Search Bar */}
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input 
        type="text" 
        placeholder="Buscar produtos..." 
        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
        readOnly
      />
    </div>

    {/* Product List */}
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Camiseta Polo - P</p>
            <p className="text-sm text-gray-600">Código: #001</p>
          </div>
        </div>
        <span className="font-bold text-gray-800">R$ 89,90</span>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Calça Jeans - M</p>
            <p className="text-sm text-gray-600">Código: #002</p>
          </div>
        </div>
        <span className="font-bold text-gray-800">R$ 159,90</span>
      </div>
    </div>

    {/* Total Section */}
    <div className="border-t pt-4 space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Subtotal:</span>
        <span>R$ 249,80</span>
      </div>
      <div className="flex justify-between font-bold text-lg">
        <span>Total:</span>
        <span className="text-green-600">R$ 249,80</span>
      </div>
      <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
        Finalizar Venda
      </button>
    </div>

    {/* Bottom Info */}
    <div className="mt-4 text-center">
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">PDV integrado</span>
    </div>
  </div>
);

interface MockupPDVProps {
  className?: string;
}

export const MockupNFe = ({ className = "" }: MockupNFeProps) => (
  <div className={`bg-white border rounded-xl p-6 shadow-lg ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Emissão de NFe</h2>
      </div>
      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
        Pronto
      </span>
    </div>

    {/* Form Fields */}
    <div className="space-y-4 mb-6">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Cliente</label>
        <div className="bg-gray-50 border rounded-lg p-3">
          <p className="font-medium text-gray-800">João Silva</p>
          <p className="text-sm text-gray-600">123.456.789-00</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Produtos</label>
        <div className="bg-gray-50 border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-800">2 itens selecionados</span>
            <span className="text-sm text-gray-600">R$ 249,80</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Série</label>
          <input 
            type="text" 
            value="001" 
            className="w-full border rounded-lg p-2 text-sm bg-gray-50" 
            readOnly 
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Número</label>
          <input 
            type="text" 
            value="1234" 
            className="w-full border rounded-lg p-2 text-sm bg-gray-50" 
            readOnly 
          />
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-3">
      <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
        Emitir NFe
      </button>
      <button className="px-6 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
        Preview
      </button>
    </div>

    {/* Status */}
    <div className="mt-4 text-center">
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Emissão de NFe</span>
    </div>
  </div>
);

interface MockupNFeProps {
  className?: string;
}

export const MockupInventory = ({ className = "" }: MockupInventoryProps) => (
  <div className={`bg-white border rounded-xl p-6 shadow-lg ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-800">Controle de Estoque</h2>
      </div>
      <div className="flex gap-2">
        <Filter className="h-5 w-5 text-gray-500" />
        <Search className="h-5 w-5 text-gray-500" />
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-3">
          <div className="text-center">
            <p className="text-sm text-green-700">Produtos Ativos</p>
            <p className="text-xl font-bold text-green-800">248</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-3">
          <div className="text-center">
            <p className="text-sm text-yellow-700">Estoque Baixo</p>
            <p className="text-xl font-bold text-yellow-800">7</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-3">
          <div className="text-center">
            <p className="text-sm text-red-700">Sem Estoque</p>
            <p className="text-xl font-bold text-red-800">3</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Product List */}
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-gray-800">Camiseta Polo Basic</p>
            <p className="text-sm text-gray-600">SKU: CAM001</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800">125 un</p>
          <p className="text-sm text-green-600">Em estoque</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-yellow-500">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-gray-800">Calça Jeans Premium</p>
            <p className="text-sm text-gray-600">SKU: CAL002</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800">8 un</p>
          <p className="text-sm text-yellow-600">Estoque baixo</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-red-500">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-gray-800">Tênis Esportivo</p>
            <p className="text-sm text-gray-600">SKU: TEN003</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800">0 un</p>
          <p className="text-sm text-red-600">Sem estoque</p>
        </div>
      </div>
    </div>
  </div>
);

interface MockupInventoryProps {
  className?: string;
}

export const MockupFinancial = ({ className = "" }: MockupFinancialProps) => (
  <div className={`bg-white border rounded-xl p-6 shadow-lg ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <PieChart className="h-6 w-6 text-emerald-600" />
        <h2 className="text-xl font-bold text-gray-800">Dashboard Financeiro</h2>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Últimos 30 dias</span>
      </div>
    </div>

    {/* Financial Summary */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 mb-1">Receitas</p>
              <p className="text-xl font-bold text-emerald-800">R$ 45.230</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-xs text-emerald-600 mt-2">+12% vs mês anterior</p>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 mb-1">Despesas</p>
              <p className="text-xl font-bold text-red-800">R$ 23.140</p>
            </div>
            <BarChart3 className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-xs text-red-600 mt-2">+5% vs mês anterior</p>
        </CardContent>
      </Card>
    </div>

    {/* DRE Summary */}
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-gray-800 mb-3">DRE Resumida</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Receita Bruta</span>
          <span className="text-gray-800">R$ 45.230</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">(-) Impostos</span>
          <span className="text-red-600">R$ 3.620</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">(-) Despesas</span>
          <span className="text-red-600">R$ 23.140</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span className="text-gray-800">Lucro Líquido</span>
          <span className="text-emerald-600">R$ 18.470</span>
        </div>
      </div>
    </div>

    {/* Chart Placeholder */}
    <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg p-4 h-24 flex items-center justify-center">
      <span className="text-sm text-gray-600">Gráfico de evolução financeira</span>
    </div>
  </div>
);

interface MockupFinancialProps {
  className?: string;
}