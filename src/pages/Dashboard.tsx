import React, { useState, useEffect } from 'react';
import { DashboardWidget } from '@/components/Dashboard/DashboardWidget';
import { WidgetSelector } from '@/components/Dashboard/WidgetSelector';
import { AnalyticsTracker } from '@/components/Dashboard/AnalyticsTracker';
import { ResponsiveDashboardHeader } from '@/components/Dashboard/ResponsiveDashboardHeader';
import { EmptyDashboardState } from '@/components/Dashboard/EmptyDashboardState';
import { MobileWidgetList } from '@/components/Dashboard/MobileWidgetList';
import { ResponsiveWidgetContainer } from '@/components/Dashboard/ResponsiveWidgetContainer';
import { ResponsiveContainer } from '@/components/ui/responsive-layout';
import { useDashboard, useUpdateDashboard, WIDGET_TYPES, Widget } from '@/hooks/useDashboard';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { supabase } from '@/integrations/supabase/client';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useResponsiveGrid } from '@/hooks/use-responsive-grid';

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
  const { gridConfig, isMobile, isTablet } = useResponsiveGrid();

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
        x: (widgets.length * 3) % 6,
        y: Math.floor((widgets.length * 3) / 6) * 2,
        w: 3,
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
    <div className="space-y-8 min-h-screen bg-background">
      <AnalyticsTracker />
      
      {/* Header */}
      <ResponsiveDashboardHeader onAddWidget={() => setShowWidgetSelector(true)} />

      {/* Content */}
      <ResponsiveContainer>
        {widgets.length > 0 ? (
          // Show mobile list for many widgets on mobile, otherwise grid
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
                  <ResponsiveWidgetContainer compact={isMobile || isTablet}>
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
          <EmptyDashboardState onAddWidget={() => setShowWidgetSelector(true)} />
        )}
      </ResponsiveContainer>

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
