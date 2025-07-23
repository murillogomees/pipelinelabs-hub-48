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
  Minus,
  MoreVertical,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Widget } from '@/hooks/useDashboard';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { useAccountsReceivable } from '@/hooks/useAccountsReceivable';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useProposals } from '@/hooks/useProposals';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
  className?: string;
}

export function DashboardWidget({ widget, onRemove, isDragHandle = false, className }: DashboardWidgetProps) {
  const navigate = useNavigate();
  const { data: sales, refetch: refetchSales } = useSales();
  const { data: products, refetch: refetchProducts } = useProducts();
  const { accounts: accountsReceivable, refetch: refetchReceivables } = useAccountsReceivable();
  const { accounts: accountsPayable, refetch: refetchPayables } = useAccountsPayable();
  const { data: proposals, refetch: refetchProposals } = useProposals();

  const handleRefresh = () => {
    switch (widget.type) {
      case 'sales_monthly':
      case 'pending_orders':
        refetchSales?.();
        break;
      case 'low_stock':
      case 'top_products':
        refetchProducts?.();
        break;
      case 'accounts_receivable':
        refetchReceivables?.();
        break;
      case 'accounts_payable':
        refetchPayables?.();
        break;
      case 'proposals_pending':
        refetchProposals?.();
        break;
    }
  };

  const handleNavigate = () => {
    switch (widget.type) {
      case 'sales_monthly':
      case 'pending_orders':
        navigate('/app/vendas');
        break;
      case 'low_stock':
      case 'top_products':
        navigate('/app/produtos');
        break;
      case 'accounts_receivable':
      case 'accounts_payable':
        navigate('/app/financeiro');
        break;
      case 'proposals_pending':
        navigate('/app/propostas');
        break;
    }
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'sales_monthly': {
        const totalSales = sales?.data?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
        const salesCount = sales?.data?.length || 0;
        const avgTicket = salesCount > 0 ? totalSales / salesCount : 0;
        
        return (
          <div className="space-y-3">
            <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(totalSales)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1 flex-shrink-0" />
                <span className="text-emerald-600">{salesCount} vendas este mês</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Ticket médio: {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(avgTicket)}
              </div>
            </div>
          </div>
        );
      }
      
      case 'pending_orders': {
        const pendingSales = sales?.data?.filter(sale => sale.status === 'pending') || [];
        const totalValue = pendingSales.reduce((sum, sale) => sum + sale.total_amount, 0);
        
        return (
          <div className="space-y-3">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{pendingSales.length}</div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Minus className="w-4 h-4 text-amber-500 mr-1 flex-shrink-0" />
                <span className="text-amber-600">pedidos aguardando</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Valor total: {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(totalValue)}
              </div>
            </div>
          </div>
        );
      }
      
      case 'low_stock': {
        const lowStockProducts = products?.filter(p => p.stock_quantity <= (p.min_stock || 0)) || [];
        const criticalProducts = lowStockProducts.filter(p => p.stock_quantity === 0);
        
        return (
          <div className="space-y-3">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{lowStockProducts.length}</div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <ArrowDownRight className="w-4 h-4 text-destructive mr-1 flex-shrink-0" />
                <span className="text-destructive">produtos em baixo estoque</span>
              </div>
              {criticalProducts.length > 0 && (
                <div className="text-xs text-destructive font-medium">
                  {criticalProducts.length} em falta total
                </div>
              )}
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
            <Button 
              size="sm" 
              className="w-full justify-start text-xs sm:text-sm"
              onClick={() => navigate('/app/vendas/nova')}
            >
              <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Nova Venda</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start text-xs sm:text-sm"
              onClick={() => navigate('/app/notas-fiscais')}
            >
              <Receipt className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Emitir NFe</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start text-xs sm:text-sm"
              onClick={() => navigate('/app/propostas/nova')}
            >
              <FileCheck className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Nova Proposta</span>
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
    <Card className={cn(
      "h-full group hover:shadow-lg transition-all duration-200 border-border/50",
      isDragHandle && "cursor-move hover:border-primary/20",
      "bg-gradient-to-br from-card to-card/95",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
        <CardTitle className="text-sm font-medium flex items-center space-x-2 flex-1 min-w-0">
          <Icon className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="truncate">{widget.title}</span>
        </CardTitle>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Ações rápidas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar dados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNavigate}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onRemove(widget.id)}
                className="text-destructive focus:text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Remover widget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4 pt-0">
        <div onClick={handleNavigate} className="cursor-pointer">
          {renderWidgetContent()}
        </div>
      </CardContent>
    </Card>
  );
}