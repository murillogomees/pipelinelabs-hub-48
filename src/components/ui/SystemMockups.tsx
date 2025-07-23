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
  <div className={`bg-white border rounded-xl p-6 shadow-lg ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Dashboard Completo</h2>
      </div>
      <div className="flex gap-2">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          Atualizado agora
        </span>
        <Bell className="h-5 w-5 text-yellow-500" />
        <Settings className="h-5 w-5 text-gray-500" />
      </div>
    </div>

    {/* Main Metrics Grid */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 mb-1">Vendas Hoje</p>
              <p className="text-2xl font-bold text-emerald-800">R$ 8.247</p>
              <p className="text-xs text-emerald-600">+23% vs ontem</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">Pedidos</p>
              <p className="text-2xl font-bold text-blue-800">127</p>
              <p className="text-xs text-blue-600">+8 nas últimas 2h</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 mb-1">Produtos</p>
              <p className="text-2xl font-bold text-purple-800">1.247</p>
              <p className="text-xs text-purple-600">23 novos hoje</p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 mb-1">Alertas</p>
              <p className="text-2xl font-bold text-orange-800">7</p>
              <p className="text-xs text-orange-600">Estoque baixo</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-2 gap-6 mb-6">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-800">Evolução de Vendas</span>
          </div>
          <div className="h-40 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative overflow-hidden">
            {/* Simulated Chart Lines */}
            <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-around p-4">
              <div className="bg-blue-500 w-3 h-16 rounded-t"></div>
              <div className="bg-blue-500 w-3 h-20 rounded-t"></div>
              <div className="bg-blue-500 w-3 h-24 rounded-t"></div>
              <div className="bg-emerald-500 w-3 h-32 rounded-t"></div>
              <div className="bg-emerald-500 w-3 h-28 rounded-t"></div>
              <div className="bg-emerald-500 w-3 h-36 rounded-t"></div>
              <div className="bg-purple-500 w-3 h-32 rounded-t"></div>
            </div>
            <div className="absolute top-4 right-4 text-xs text-gray-600">
              Últimos 7 dias
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-gray-800">DRE Visual</span>
          </div>
          <div className="h-40 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg relative">
            {/* Simulated Pie Chart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-8 border-emerald-500" style={{
                background: `conic-gradient(#10b981 0deg 180deg, #3b82f6 180deg 300deg, #ef4444 300deg 360deg)`
              }}></div>
            </div>
            <div className="absolute bottom-4 left-4 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-emerald-500 rounded"></div>
                <span className="text-gray-600">Receitas 50%</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Custos 33%</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-red-500 rounded"></div>
                <span className="text-gray-600">Despesas 17%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Recent Activity */}
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-800">Atividade Recente</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">Venda #1247 finalizada - R$ 189,90</span>
            <span className="text-xs text-gray-500 ml-auto">há 2 min</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <Bell className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-gray-700">Estoque do produto #SKU123 está baixo</span>
            <span className="text-xs text-gray-500 ml-auto">há 5 min</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-700">NFe #000123 emitida com sucesso</span>
            <span className="text-xs text-gray-500 ml-auto">há 8 min</span>
          </div>
        </div>
      </CardContent>
    </Card>
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

export const MockupNotifications = ({ className = "" }: MockupNotificationsProps) => (
  <div className={`bg-white border rounded-xl p-6 shadow-lg ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-yellow-600" />
        <h2 className="text-xl font-bold text-gray-800">Notificações de Pedidos</h2>
      </div>
      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
        8 novas
      </span>
    </div>

    {/* Notification List */}
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-gray-800">Pedido #1247 confirmado</p>
            <span className="text-xs text-gray-500">há 2 min</span>
          </div>
          <p className="text-sm text-gray-600">Cliente: Maria Santos - R$ 189,90</p>
          <p className="text-xs text-green-700 mt-1">Pagamento aprovado via PIX</p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <ShoppingCart className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-gray-800">Novo pedido #1248</p>
            <span className="text-xs text-gray-500">há 5 min</span>
          </div>
          <p className="text-sm text-gray-600">Cliente: João Silva - R$ 459,80</p>
          <p className="text-xs text-blue-700 mt-1">Aguardando confirmação de pagamento</p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-gray-800">Pedido #1245 em atraso</p>
            <span className="text-xs text-gray-500">há 15 min</span>
          </div>
          <p className="text-sm text-gray-600">Cliente: Ana Costa - R$ 299,50</p>
          <p className="text-xs text-yellow-700 mt-1">Prazo de separação expirado</p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-gray-800">Pedido #1246 separado</p>
            <span className="text-xs text-gray-500">há 20 min</span>
          </div>
          <p className="text-sm text-gray-600">Cliente: Pedro Oliveira - R$ 128,90</p>
          <p className="text-xs text-purple-700 mt-1">Pronto para envio</p>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-3 mt-6">
      <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
        Ver Todos os Pedidos
      </button>
      <button className="px-4 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
        Marcar como Lidas
      </button>
    </div>
  </div>
);

interface MockupNotificationsProps {
  className?: string;
}

export const MockupDailySales = ({ className = "" }: MockupDailySalesProps) => (
  <div className={`bg-white border rounded-xl p-6 shadow-lg ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-emerald-600" />
        <h2 className="text-xl font-bold text-gray-800">Vendas do Dia</h2>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">23 Jul 2025</span>
      </div>
    </div>

    {/* Main Stats */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-emerald-700 mb-1">Total Vendido</p>
            <p className="text-2xl font-bold text-emerald-800">R$ 8.247,80</p>
            <p className="text-xs text-emerald-600">+23% vs ontem</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-blue-700 mb-1">Vendas Realizadas</p>
            <p className="text-2xl font-bold text-blue-800">47</p>
            <p className="text-xs text-blue-600">+8 nas últimas 2h</p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Hourly Chart */}
    <Card className="bg-white shadow-sm mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-800">Vendas por Hora</span>
        </div>
        <div className="h-32 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-around p-2">
            <div className="bg-emerald-400 w-2 h-8 rounded-t"></div>
            <div className="bg-emerald-500 w-2 h-12 rounded-t"></div>
            <div className="bg-emerald-600 w-2 h-16 rounded-t"></div>
            <div className="bg-blue-500 w-2 h-20 rounded-t"></div>
            <div className="bg-blue-600 w-2 h-24 rounded-t"></div>
            <div className="bg-purple-500 w-2 h-28 rounded-t"></div>
            <div className="bg-purple-600 w-2 h-32 rounded-t"></div>
            <div className="bg-emerald-700 w-2 h-24 rounded-t"></div>
            <div className="bg-emerald-600 w-2 h-20 rounded-t"></div>
            <div className="bg-emerald-500 w-2 h-16 rounded-t"></div>
          </div>
          <div className="absolute top-2 right-2 text-xs text-gray-600">
            9h - 18h
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Recent Sales */}
    <div className="space-y-3">
      <h3 className="font-medium text-gray-800 text-sm">Últimas Vendas</h3>
      
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Venda #1247</p>
            <p className="text-xs text-gray-600">Maria Santos</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">R$ 189,90</p>
          <p className="text-xs text-gray-500">16:45</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Venda #1246</p>
            <p className="text-xs text-gray-600">João Silva</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">R$ 459,80</p>
          <p className="text-xs text-gray-500">16:32</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Venda #1245</p>
            <p className="text-xs text-gray-600">Ana Costa</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">R$ 299,50</p>
          <p className="text-xs text-gray-500">16:18</p>
        </div>
      </div>
    </div>
  </div>
);

interface MockupDailySalesProps {
  className?: string;
}