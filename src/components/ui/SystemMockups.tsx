import { TrendingUp, Package, AlertTriangle, BarChart3, Bell, ShoppingCart, FileText, DollarSign, Clock, CheckCircle, Settings, Search, Filter, Calendar, PieChart, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
interface MockupDashboardProps {
  className?: string;
}
export const MockupDashboard = ({
  className = ""
}: MockupDashboardProps) => <div className={`bg-card border border-border rounded-xl p-3 sm:p-4 md:p-6 shadow-lg h-[280px] sm:h-[320px] md:h-[400px] overflow-hidden ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
      <div className="flex items-center gap-1 sm:gap-2">
        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">Dashboard Completo</h3>
      </div>
      <div className="flex gap-1 sm:gap-2">
        <span className="bg-green-100 text-green-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
          Online
        </span>
        <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
      </div>
    </div>

    {/* Main Content */}
    <div className="space-y-2 sm:space-y-3 md:space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-700 mb-0.5 sm:mb-1">Vendas Hoje</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-emerald-800">R$ 8.247</p>
            </div>
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 mb-0.5 sm:mb-1">Pedidos</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-blue-800">127</p>
            </div>
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-2 sm:p-3 md:p-4">
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-800">Evolução de Vendas</span>
        </div>
        <div className="h-16 sm:h-20 md:h-24 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-around p-1 sm:p-2">
            <div className="bg-blue-500 w-1.5 sm:w-2 h-6 sm:h-8 rounded-t"></div>
            <div className="bg-blue-500 w-1.5 sm:w-2 h-8 sm:h-12 rounded-t"></div>
            <div className="bg-emerald-500 w-1.5 sm:w-2 h-10 sm:h-16 rounded-t"></div>
            <div className="bg-emerald-500 w-1.5 sm:w-2 h-12 sm:h-20 rounded-t"></div>
            <div className="bg-purple-500 w-1.5 sm:w-2 h-9 sm:h-14 rounded-t"></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 bg-gray-50 rounded-lg">
          <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 flex-shrink-0" />
          <span className="text-xs text-gray-700 truncate">Venda #1247 finalizada - R$ 189,90</span>
        </div>
        
      </div>
    </div>
  </div>;
export const MockupPDV = ({
  className = ""
}: MockupPDVProps) => <div className={`bg-card border border-border rounded-xl p-3 sm:p-4 md:p-6 shadow-lg h-[280px] sm:h-[320px] md:h-[400px] overflow-hidden ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-bold text-gray-800">PDV - Ponto de Venda</h3>
      </div>
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
        Online
      </span>
    </div>

    {/* Search Bar */}
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input type="text" placeholder="Buscar produtos..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" readOnly />
    </div>

    {/* Product List */}
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Camiseta Polo - P</p>
            <p className="text-xs text-gray-600">Código: #001</p>
          </div>
        </div>
        <span className="text-sm font-bold text-gray-800">R$ 89,90</span>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Calça Jeans - M</p>
            <p className="text-xs text-gray-600">Código: #002</p>
          </div>
        </div>
        <span className="text-sm font-bold text-gray-800">R$ 159,90</span>
      </div>
    </div>

    {/* Total Section */}
    <div className="border-t pt-3 space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Total:</span>
        <span className="text-green-600 font-bold">R$ 249,80</span>
      </div>
      <button className="w-full bg-success text-success-foreground py-2 rounded-lg text-sm font-medium hover:bg-success/90 transition-colors">
        Finalizar Venda
      </button>
    </div>
  </div>;
interface MockupPDVProps {
  className?: string;
}
export const MockupNFe = ({
  className = ""
}: MockupNFeProps) => <div className={`bg-card border border-border rounded-xl p-3 sm:p-4 md:p-6 shadow-lg h-[280px] sm:h-[320px] md:h-[400px] overflow-hidden ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">Emissão de NFe</h3>
      </div>
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
        Pronto
      </span>
    </div>

    {/* Form Fields */}
    <div className="space-y-4 mb-4">
      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">Cliente</label>
        <div className="bg-gray-50 border rounded-lg p-3">
          <p className="text-sm font-medium text-gray-800">João Silva</p>
          <p className="text-xs text-gray-600">123.456.789-00</p>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">Produtos</label>
        <div className="bg-gray-50 border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-800">2 itens selecionados</span>
            <span className="text-sm text-gray-600">R$ 249,80</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Série</label>
          <input type="text" value="001" className="w-full border rounded-lg p-2 text-sm bg-gray-50" readOnly />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Número</label>
          <input type="text" value="1234" className="w-full border rounded-lg p-2 text-sm bg-gray-50" readOnly />
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-3">
      <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
        Emitir NFe
      </button>
      <button className="px-4 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
        Preview
      </button>
    </div>
  </div>;
interface MockupNFeProps {
  className?: string;
}
export const MockupInventory = ({
  className = ""
}: MockupInventoryProps) => <div className={`bg-card border border-border rounded-xl p-3 sm:p-4 md:p-6 shadow-lg h-[280px] sm:h-[320px] md:h-[400px] overflow-hidden ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-800">Controle de Estoque</h3>
      </div>
      <div className="flex gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <Search className="h-4 w-4 text-gray-500" />
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="text-center">
          <p className="text-xs text-green-700">Ativos</p>
          <p className="text-lg font-bold text-green-800">248</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="text-center">
          <p className="text-xs text-yellow-700">Baixo</p>
          <p className="text-lg font-bold text-yellow-800">7</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="text-center">
          <p className="text-xs text-red-700">Zerado</p>
          <p className="text-lg font-bold text-red-800">3</p>
        </div>
      </div>
    </div>

    {/* Product List */}
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-gray-800">Camiseta Polo Basic</p>
            <p className="text-xs text-gray-600">SKU: CAM001</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">125 un</p>
          <p className="text-xs text-green-600">OK</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-yellow-500">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-gray-800">Calça Jeans Premium</p>
            <p className="text-xs text-gray-600">SKU: CAL002</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">8 un</p>
          <p className="text-xs text-yellow-600">Baixo</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-red-500">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <div>
            <p className="text-sm font-medium text-gray-800">Tênis Esportivo</p>
            <p className="text-xs text-gray-600">SKU: TEN003</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">0 un</p>
          <p className="text-xs text-red-600">Zerado</p>
        </div>
      </div>
    </div>
  </div>;
interface MockupInventoryProps {
  className?: string;
}
export const MockupFinancial = ({
  className = ""
}: MockupFinancialProps) => <div className={`bg-card border border-border rounded-xl p-3 sm:p-4 md:p-6 shadow-lg h-[280px] sm:h-[320px] md:h-[400px] overflow-hidden ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <PieChart className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-gray-800">Dashboard Financeiro</h3>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-xs text-gray-600">30 dias</span>
      </div>
    </div>

    {/* Financial Summary */}
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-700">Receitas</p>
            <p className="text-lg font-bold text-emerald-800">R$ 45.2k</p>
          </div>
          <TrendingUp className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-700">Despesas</p>
            <p className="text-lg font-bold text-blue-800">R$ 32.1k</p>
          </div>
          <TrendingUp className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>

    {/* DRE Visual */}
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <PieChart className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-medium text-gray-800">DRE Visual</span>
      </div>
      <div className="relative">
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-6 border-emerald-500" style={{
          background: `conic-gradient(#10b981 0deg 180deg, #3b82f6 180deg 300deg, #ef4444 300deg 360deg)`
        }}></div>
        </div>
        <div className="flex justify-around mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded"></div>
            <span className="text-gray-600">Receitas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Custos</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span className="text-gray-600">Despesas</span>
          </div>
        </div>
      </div>
    </div>

    {/* Financial Status */}
    
  </div>;
interface MockupFinancialProps {
  className?: string;
}
export const MockupNotifications = ({
  className = ""
}: MockupNotificationsProps) => <div className={`bg-card border border-border rounded-xl p-3 sm:p-4 md:p-6 shadow-lg h-[280px] sm:h-[320px] md:h-[400px] overflow-hidden ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-bold text-gray-800">Notificações de Pedidos</h3>
      </div>
      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
        8 novas
      </span>
    </div>

    {/* Notification List */}
    <div className="space-y-3 overflow-y-auto h-[300px]">
      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-800">Pedido #1247 confirmado</p>
            <span className="text-xs text-gray-500">há 2 min</span>
          </div>
          <p className="text-xs text-gray-600">Cliente: Maria Santos - R$ 189,90</p>
          <p className="text-xs text-green-700 mt-1">Pagamento aprovado via PIX</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <ShoppingCart className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-800">Novo pedido #1248</p>
            <span className="text-xs text-gray-500">há 5 min</span>
          </div>
          <p className="text-xs text-gray-600">Cliente: João Silva - R$ 459,80</p>
          <p className="text-xs text-blue-700 mt-1">Aguardando confirmação</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-800">Pedido #1245 em atraso</p>
            <span className="text-xs text-gray-500">há 15 min</span>
          </div>
          <p className="text-xs text-gray-600">Cliente: Ana Costa - R$ 299,50</p>
          <p className="text-xs text-yellow-700 mt-1">Prazo expirado</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Package className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-800">Pedido #1246 separado</p>
            <span className="text-xs text-gray-500">há 20 min</span>
          </div>
          <p className="text-xs text-gray-600">Cliente: Pedro Oliveira - R$ 128,90</p>
          <p className="text-xs text-purple-700 mt-1">Pronto para envio</p>
        </div>
      </div>
    </div>
  </div>;
interface MockupNotificationsProps {
  className?: string;
}
export const MockupDailySales = ({
  className = ""
}: MockupDailySalesProps) => <div className={`bg-card border border-border rounded-xl p-3 sm:p-4 md:p-6 shadow-lg h-[280px] sm:h-[320px] md:h-[400px] overflow-hidden ${className}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-gray-800">Vendas do Dia</h3>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-xs text-gray-600">23 Jul 2025</span>
      </div>
    </div>

    {/* Main Stats */}
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-lg p-3">
        <div className="text-center">
          <p className="text-xs text-emerald-700 mb-1">Total Vendido</p>
          <p className="text-lg font-bold text-emerald-800">R$ 8.247</p>
          <p className="text-xs text-emerald-600">+23% vs ontem</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-lg p-3">
        <div className="text-center">
          <p className="text-xs text-blue-700 mb-1">Vendas Realizadas</p>
          <p className="text-lg font-bold text-blue-800">47</p>
          <p className="text-xs text-blue-600">+8 nas últimas 2h</p>
        </div>
      </div>
    </div>

    {/* Hourly Chart */}
    <div className="bg-card shadow-sm mb-4 border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-800">Vendas por Hora</span>
      </div>
      <div className="h-20 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-around p-2">
          <div className="bg-emerald-400 w-2 h-4 rounded-t"></div>
          <div className="bg-emerald-500 w-2 h-6 rounded-t"></div>
          <div className="bg-emerald-600 w-2 h-8 rounded-t"></div>
          <div className="bg-blue-500 w-2 h-10 rounded-t"></div>
          <div className="bg-blue-600 w-2 h-12 rounded-t"></div>
          <div className="bg-purple-500 w-2 h-14 rounded-t"></div>
          <div className="bg-purple-600 w-2 h-16 rounded-t"></div>
          <div className="bg-emerald-700 w-2 h-12 rounded-t"></div>
        </div>
        <div className="absolute top-1 right-2 text-xs text-gray-600">
          9h - 18h
        </div>
      </div>
    </div>

    {/* Recent Sales */}
    <div className="space-y-2">
      
      
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">Venda #1247</p>
            <p className="text-xs text-gray-600">Maria Santos</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-800">R$ 189,90</p>
          <p className="text-xs text-gray-500">16:45</p>
        </div>
      </div>

      
    </div>
  </div>;
interface MockupDailySalesProps {
  className?: string;
}