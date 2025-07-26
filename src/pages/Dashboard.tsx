import React, { useState, useEffect } from 'react';
import { EnhancedButton as Button } from '@/components/ui/enhanced-button';
import { Plus, LayoutGrid } from 'lucide-react';
import { DashboardWidget } from '@/components/Dashboard/DashboardWidget';
import { WidgetSelector } from '@/components/Dashboard/WidgetSelector';
import { AnalyticsTracker } from '@/components/Dashboard/AnalyticsTracker';
import { useDashboard, useUpdateDashboard, WIDGET_TYPES, Widget } from '@/hooks/useDashboard';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { supabase } from '@/integrations/supabase/client';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useResponsiveGrid } from '@/hooks/use-responsive-grid';
import { ResponsiveWidgetContainer } from '@/components/Dashboard/ResponsiveWidgetContainer';
import { MobileWidgetList } from '@/components/Dashboard/MobileWidgetList';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard() {
  const { user } = useAuth();
  const { data: dashboardConfig } = useDashboard();
  const updateDashboard = useUpdateDashboard();
  const { trackButtonClick, trackFeatureUsage } = useAnalyticsTracker();
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [layouts, setLayouts] = useState({});
  
  // Responsive grid configuration
  const { gridConfig, isMobile, isTablet, currentBreakpoint } = useResponsiveGrid();

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
          position: { x: 0, y: 0, w: 3, h: 2 },
        },
        {
          id: 'default-orders',
          type: 'pending_orders',
          title: WIDGET_TYPES.PENDING_ORDERS.title,
          position: { x: 3, y: 0, w: 3, h: 2 },
        },
        {
          id: 'default-stock',
          type: 'low_stock',
          title: WIDGET_TYPES.LOW_STOCK.title,
          position: { x: 0, y: 2, w: 3, h: 2 },
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
        x: (widgets.length * 3) % 6, // Posiciona em múltiplos de 3 para ocupar col-6
        y: Math.floor((widgets.length * 3) / 6) * 2, // Nova linha a cada 2 widgets
        w: 3, // Cada widget ocupa 3 colunas (col-6 em grid de 6)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Personalize sua visão do negócio
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowWidgetSelector(true)}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Adicionar Widget</span>
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      {widgets.length > 0 ? (
        isMobile && widgets.length > 4 ? (
          <MobileWidgetList 
            widgets={widgets} 
            onRemove={handleRemoveWidget} 
          />
        ) : (
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: gridLayout }}
            onLayoutChange={handleLayoutChange}
            breakpoints={gridConfig.breakpoints}
            cols={gridConfig.cols}
            rowHeight={gridConfig.rowHeight}
            margin={gridConfig.margin}
            containerPadding={gridConfig.containerPadding}
            isDraggable={!isMobile}
            isResizable={!isMobile}
            useCSSTransforms={true}
            preventCollision={false}
            compactType="vertical"
            autoSize={true}
          >
            {widgets.map((widget) => (
              <div key={widget.id} className="h-full">
                <ResponsiveWidgetContainer compact={isMobile}>
                  <DashboardWidget
                    widget={widget}
                    onRemove={handleRemoveWidget}
                    isDragHandle={!isMobile}
                    className={isMobile ? "text-sm" : ""}
                  />
                </ResponsiveWidgetContainer>
              </div>
            ))}
          </ResponsiveGridLayout>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
            <LayoutGrid className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2">
              Seu dashboard está vazio
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Adicione widgets para monitorar as principais métricas do seu negócio em tempo real
            </p>
          </div>
          <Button 
            onClick={() => setShowWidgetSelector(true)}
            size="lg"
            className="w-full sm:w-auto"
          >
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
