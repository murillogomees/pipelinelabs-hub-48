import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  FileText, 
  CreditCard,
  Receipt,
  FileCheck,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { WIDGET_TYPES, Widget } from '@/hooks/useDashboard';

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

interface WidgetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (widgetType: string) => void;
  existingWidgets: Widget[];
}

export function WidgetSelector({ open, onOpenChange, onAddWidget, existingWidgets }: WidgetSelectorProps) {
  const existingTypes = new Set(existingWidgets.map(w => w.type));
  
  const categories = {
    financial: 'Financeiro',
    sales: 'Vendas',
    inventory: 'Estoque',
    fiscal: 'Fiscal',
    analytics: 'Análises',
    actions: 'Ações Rápidas',
  };

  const groupedWidgets = Object.entries(WIDGET_TYPES).reduce((acc, [key, widget]) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push({ key, ...widget });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Widgets ao Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedWidgets).map(([category, widgets]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                {categories[category as keyof typeof categories]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgets.map((widget) => {
                  const Icon = iconMap[widget.icon as keyof typeof iconMap];
                  const isAlreadyAdded = existingTypes.has(widget.id);
                  
                  return (
                    <Card 
                      key={widget.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isAlreadyAdded ? 'opacity-50' : 'hover:border-primary'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{widget.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {widget.defaultSize.w}x{widget.defaultSize.h} células
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="text-xs">
                            {categories[category as keyof typeof categories]}
                          </Badge>
                          
                          <Button
                            size="sm"
                            onClick={() => onAddWidget(widget.id)}
                            disabled={isAlreadyAdded}
                          >
                            {isAlreadyAdded ? 'Adicionado' : 'Adicionar'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}