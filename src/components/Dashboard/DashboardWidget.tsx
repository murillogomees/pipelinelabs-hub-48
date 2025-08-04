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
import { useProducts } from '@/components/Products/hooks/useProducts';
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
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate leading-tight">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(totalSales)}
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm sm:text-base text-muted-foreground">
                <ArrowUpRight className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                <span className="text-success font-medium">{salesCount} vendas este mês</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
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
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">{pendingSales.length}</div>
            <div className="space-y-2">
              <div className="flex items-center text-sm sm:text-base text-muted-foreground">
                <Minus className="w-4 h-4 text-warning mr-2 flex-shrink-0" />
                <span className="text-warning font-medium">pedidos aguardando</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
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
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">{lowStockProducts.length}</div>
            <div className="space-y-2">
              <div className="flex items-center text-sm sm:text-base text-muted-foreground">
                <ArrowDownRight className="w-4 h-4 text-destructive mr-2 flex-shrink-0" />
                <span className="text-destructive font-medium">produtos em baixo estoque</span>
              </div>
              {criticalProducts.length > 0 && (
                <div className="text-xs sm:text-sm text-destructive font-semibold bg-destructive/10 px-2 py-1 rounded-md">
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
          <div className="space-y-2 sm:space-y-3">
            <Button 
              size="sm" 
              className="w-full justify-start min-h-[44px] text-sm sm:text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/app/vendas/nova')}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Nova Venda</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start min-h-[44px] text-sm sm:text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/app/notas-fiscais')}
            >
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Emitir NFe</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full justify-start min-h-[44px] text-sm sm:text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/app/propostas/nova')}
            >
              <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
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
      // Base styles - Mobile-first
      "h-full group bg-card border border-border/50 rounded-xl overflow-hidden",
      // Touch-friendly interactions
      "transition-all duration-200 ease-out touch-manipulation",
      // Hover effects (only on non-touch devices)
      "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
      // Interactive states
      "active:scale-[0.98] transform-gpu",
      // Accessibility
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      // Mobile optimizations
      "min-h-[120px] sm:min-h-[140px]",
      isDragHandle && "cursor-move",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4">
        <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2 flex-1 min-w-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <span className="truncate">{widget.title}</span>
        </CardTitle>
        
        {/* Mobile-optimized actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
                <span className="sr-only">Opções do widget</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-popover border border-border shadow-lg rounded-lg p-1"
              sideOffset={5}
            >
              <DropdownMenuItem 
                onClick={handleRefresh}
                className="rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2 flex-shrink-0" />
                Atualizar dados
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleNavigate}
                className="rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onRemove(widget.id)}
                className="rounded-md px-3 py-2 text-sm cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4 mr-2 flex-shrink-0" />
                Remover widget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 pt-0">
        <div 
          onClick={handleNavigate} 
          className="cursor-pointer transition-opacity hover:opacity-90 active:opacity-75"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNavigate();
            }
          }}
          aria-label={`Ver detalhes de ${widget.title}`}
        >
          {renderWidgetContent()}
        </div>
      </CardContent>
    </Card>
  );
}