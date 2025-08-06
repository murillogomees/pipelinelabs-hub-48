
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, Package, Users, ShoppingCart } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Widget {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  data: any[];
}

interface ResponsiveDashboardProps {
  widgets: Widget[];
  onAddWidget: (widgetType: string) => void;
  onRemoveWidget: (widgetId: string) => void;
  isLoading: boolean;
}

const WidgetIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'sales_monthly':
      return <BarChart3 className="h-5 w-5" />;
    case 'low_stock':
      return <Package className="h-5 w-5" />;
    case 'quick_actions':
      return <Plus className="h-5 w-5" />;
    case 'pending_orders':
      return <ShoppingCart className="h-5 w-5" />;
    default:
      return <BarChart3 className="h-5 w-5" />;
  }
};

export const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({
  widgets,
  onAddWidget,
  onRemoveWidget,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button
          onClick={() => onAddWidget('sales_monthly')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Widget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map((widget) => (
          <Card key={widget.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <WidgetIcon type={widget.type} />
                <h3 className="font-semibold">{widget.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveWidget(widget.id)}
              >
                ×
              </Button>
            </div>
            <div className="text-2xl font-bold mb-2">
              {widget.data?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              Dados em tempo real
            </p>
          </Card>
        ))}
      </div>

      {widgets.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum widget configurado</h3>
          <p className="text-muted-foreground mb-4">
            Adicione widgets para visualizar suas métricas importantes.
          </p>
          <Button onClick={() => onAddWidget('sales_monthly')}>
            Adicionar Primeiro Widget
          </Button>
        </div>
      )}
    </div>
  );
};
