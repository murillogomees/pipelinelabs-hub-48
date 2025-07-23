
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid } from 'lucide-react';
import { DashboardWidget } from '@/components/Dashboard/DashboardWidget';
import { WidgetSelector } from '@/components/Dashboard/WidgetSelector';
import { AnalyticsTracker } from '@/components/Dashboard/AnalyticsTracker';
import { useDashboard, useUpdateDashboard, WIDGET_TYPES, Widget } from '@/hooks/useDashboard';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { supabase } from '@/integrations/supabase/client';
import { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function Dashboard() {
  const { user } = useAuth();
  const { data: dashboardConfig } = useDashboard();
  const updateDashboard = useUpdateDashboard();
  const { trackButtonClick, trackFeatureUsage } = useAnalyticsTracker();
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [layouts, setLayouts] = useState({});

  // Initialize widgets from saved config
  useEffect(() => {
    if (dashboardConfig?.widgets) {
      setWidgets(dashboardConfig.widgets);
      // Convert widgets to react-grid-layout format
      const layoutObj = dashboardConfig.widgets.reduce((acc, widget) => {
        acc[widget.id] = {
          i: widget.id,
          x: widget.position.x,
          y: widget.position.y,
          w: widget.position.w,
          h: widget.position.h,
        };
        return acc;
      }, {} as any);
      setLayouts({ lg: Object.values(layoutObj) });
    } else {
      // Default widgets for new users
      const defaultWidgets: Widget[] = [
        {
          id: 'default-sales',
          type: 'sales_monthly',
          title: WIDGET_TYPES.SALES_MONTHLY.title,
          position: { x: 0, y: 0, w: 2, h: 2 },
        },
        {
          id: 'default-orders',
          type: 'pending_orders',
          title: WIDGET_TYPES.PENDING_ORDERS.title,
          position: { x: 2, y: 0, w: 2, h: 2 },
        },
        {
          id: 'default-stock',
          type: 'low_stock',
          title: WIDGET_TYPES.LOW_STOCK.title,
          position: { x: 4, y: 0, w: 2, h: 2 },
        },
      ];
      setWidgets(defaultWidgets);
    }
  }, [dashboardConfig]);

  // Get company_id from user context
  const getCompanyId = async (): Promise<string> => {
    const { data } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', user?.id)
      .eq('is_active', true)
      .single();
    
    return data?.company_id || '';
  };

  const handleAddWidget = async (widgetType: string) => {
    const widgetConfig = Object.values(WIDGET_TYPES).find(w => w.id === widgetType);
    if (!widgetConfig) return;

    // Track widget addition
    trackFeatureUsage('dashboard', 'widget_added');
    trackButtonClick('add_widget', `dashboard:${widgetType}`);

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: widgetConfig.title,
      position: {
        x: 0,
        y: Math.max(...widgets.map(w => w.position.y + w.position.h), 0),
        w: widgetConfig.defaultSize.w,
        h: widgetConfig.defaultSize.h,
      },
    };

    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);

    // Save to database
    const companyId = await getCompanyId();
    updateDashboard.mutate({
      company_id: companyId,
      widgets: updatedWidgets,
      layout_config: layouts,
    });

    setShowWidgetSelector(false);
  };

  const handleRemoveWidget = async (widgetId: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);

    // Save to database
    const companyId = await getCompanyId();
    updateDashboard.mutate({
      company_id: companyId,
      widgets: updatedWidgets,
      layout_config: layouts,
    });
  };

  const handleLayoutChange = async (layout: any, allLayouts: any) => {
    // Update widget positions
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = layout.find((item: any) => item.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          position: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          },
        };
      }
      return widget;
    });

    setWidgets(updatedWidgets);
    setLayouts(allLayouts);

    // Save to database with debounce
    const companyId = await getCompanyId();
    updateDashboard.mutate({
      company_id: companyId,
      widgets: updatedWidgets,
      layout_config: allLayouts,
    });
  };

  // Convert widgets to grid layout format
  const gridLayout = widgets.map(widget => ({
    i: widget.id,
    x: widget.position.x,
    y: widget.position.y,
    w: widget.position.w,
    h: widget.position.h,
  }));

  return (
    <div className="space-y-6">
      <AnalyticsTracker />
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Personalize sua visão do negócio</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowWidgetSelector(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Widget</span>
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      {widgets.length > 0 ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: gridLayout }}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 6, md: 4, sm: 3, xs: 2, xxs: 1 }}
          rowHeight={120}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          isDraggable={true}
          isResizable={true}
        >
          {widgets.map((widget) => (
            <div key={widget.id}>
              <DashboardWidget
                widget={widget}
                onRemove={handleRemoveWidget}
                isDragHandle={true}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <LayoutGrid className="w-12 h-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground">Seu dashboard está vazio</h3>
            <p className="text-muted-foreground">Adicione widgets para monitorar seu negócio</p>
          </div>
          <Button onClick={() => setShowWidgetSelector(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Widget
          </Button>
        </div>
      )}

      {/* Widget Selector Modal */}
      <WidgetSelector
        open={showWidgetSelector}
        onOpenChange={setShowWidgetSelector}
        onAddWidget={handleAddWidget}
        existingWidgets={widgets}
      />
    </div>
  );
}
