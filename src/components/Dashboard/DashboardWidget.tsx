import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  FileText, 
  CreditCard,
  Receipt,
  FileCheck,
  TrendingUp,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { Widget } from '@/hooks/useDashboard';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { useAccountsReceivable } from '@/hooks/useAccountsReceivable';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useProposals } from '@/hooks/useProposals';

const iconMap = {
  DollarSign,
  ShoppingCart,
  Package,
  FileText,
  CreditCard,
  Receipt,
  FileCheck,
  TrendingUp,
  Award,
  Zap,
};

interface DashboardWidgetProps {
  widget: Widget;
  onRemove: (widgetId: string) => void;
  isDragHandle?: boolean;
}

export function DashboardWidget({ widget, onRemove, isDragHandle = false }: DashboardWidgetProps) {
  const { data: sales } = useSales();
  const { data: products } = useProducts();
  const { accounts: accountsReceivable } = useAccountsReceivable();
  const { accounts: accountsPayable } = useAccountsPayable();
  const { data: proposals } = useProposals();

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'sales_monthly': {
        const totalSales = sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
        const salesCount = sales?.length || 0;
        
        return (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(totalSales)}
            </div>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-600">{salesCount} vendas este mês</span>
            </div>
          </div>
        );
      }
      
      case 'pending_orders': {
        const pendingSales = sales?.filter(sale => sale.status === 'pending') || [];
        
        return (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">{pendingSales.length}</div>
            <div className="flex items-center text-sm">
              <Minus className="w-4 h-4 text-amber-500 mr-1" />
              <span className="text-muted-foreground">pedidos aguardando</span>
            </div>
          </div>
        );
      }
      
      case 'low_stock': {
        const lowStockProducts = products?.filter(p => p.stock_quantity <= p.min_stock) || [];
        
        return (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">{lowStockProducts.length}</div>
            <div className="flex items-center text-sm">
              <ArrowDownRight className="w-4 h-4 text-destructive mr-1" />
              <span className="text-destructive">produtos em falta</span>
            </div>
          </div>
        );
      }
      
      case 'accounts_receivable': {
        const pendingReceivables = accountsReceivable?.filter(ar => ar.status === 'pending') || [];
        const totalAmount = pendingReceivables.reduce((sum, ar) => sum + ar.amount, 0);
        
        return (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(totalAmount)}
            </div>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">{pendingReceivables.length} pendentes</span>
            </div>
          </div>
        );
      }
      
      case 'accounts_payable': {
        const pendingPayables = accountsPayable?.filter(ap => ap.status === 'pending') || [];
        const totalAmount = pendingPayables.reduce((sum, ap) => sum + ap.amount, 0);
        
        return (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(totalAmount)}
            </div>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">{pendingPayables.length} pendentes</span>
            </div>
          </div>
        );
      }
      
      case 'proposals_pending': {
        const pendingProposals = proposals?.filter(p => p.status === 'draft' || p.status === 'sent') || [];
        
        return (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">{pendingProposals.length}</div>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">aguardando resposta</span>
            </div>
          </div>
        );
      }
      
      case 'top_products': {
        const topProducts = products?.slice(0, 5) || [];
        
        return (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                  <span className="text-sm font-medium truncate">{product.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{product.stock_quantity}</span>
              </div>
            ))}
          </div>
        );
      }
      
      case 'quick_actions': {
        return (
          <div className="space-y-2">
            <Button size="sm" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start">
              <Receipt className="w-4 h-4 mr-2" />
              Emitir NFe
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start">
              <FileCheck className="w-4 h-4 mr-2" />
              Nova Proposta
            </Button>
          </div>
        );
      }
      
      default:
        return (
          <div className="text-center text-muted-foreground">
            Conteúdo do widget não implementado
          </div>
        );
    }
  };

  const getWidgetIcon = () => {
    const iconName = widget.type === 'sales_monthly' ? 'DollarSign' :
                    widget.type === 'pending_orders' ? 'ShoppingCart' :
                    widget.type === 'low_stock' ? 'Package' :
                    widget.type === 'accounts_receivable' ? 'FileText' :
                    widget.type === 'accounts_payable' ? 'CreditCard' :
                    widget.type === 'proposals_pending' ? 'FileCheck' :
                    widget.type === 'top_products' ? 'Award' :
                    widget.type === 'quick_actions' ? 'Zap' : 'FileText';
    
    return iconMap[iconName as keyof typeof iconMap];
  };

  const Icon = getWidgetIcon();

  return (
    <Card className={`h-full ${isDragHandle ? 'cursor-move' : ''} hover:shadow-md transition-all`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <Icon className="w-4 h-4 text-primary" />
          <span>{widget.title}</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(widget.id)}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
}