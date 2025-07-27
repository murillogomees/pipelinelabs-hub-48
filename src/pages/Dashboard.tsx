
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Grid, Smartphone } from 'lucide-react';
import { useDashboard, useUpdateDashboard, WIDGET_TYPES, Widget } from '@/hooks/useDashboard';
import { usePermissions } from '@/hooks/usePermissions';
import { WidgetSelector } from '@/components/Dashboard/WidgetSelector';
import { ResponsiveWidgetContainer } from '@/components/Dashboard/ResponsiveWidgetContainer';
import { MobileWidgetList } from '@/components/Dashboard/MobileWidgetList';
import { ResponsiveDashboardHeader } from '@/components/Dashboard/ResponsiveDashboardHeader';
import { EmptyDashboardState } from '@/components/Dashboard/EmptyDashboardState';
import { useMobile } from '@/hooks/use-mobile';

const Dashboard: React.FC = () => {
  const { dashboardData, isLoading } = useDashboard();
  const { updateWidget, addWidget, removeWidget } = useUpdateDashboard();
  const { currentCompanyId } = usePermissions();
  const isMobile = useMobile();
  
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: '1',
      type: 'sales_overview',
      title: 'Vendas',
      x: 0,
      y: 0,
      w: 4,
      h: 2,
      data: dashboardData?.sales || []
    },
    {
      id: '2',
      type: 'products_stock',
      title: 'Estoque',
      x: 4,
      y: 0,
      w: 4,
      h: 2,
      data: dashboardData?.products || []
    },
    {
      id: '3',
      type: 'customers_overview',
      title: 'Clientes',
      x: 0,
      y: 2,
      w: 4,
      h: 2,
      data: dashboardData?.customers || []
    }
  ]);

  const [isWidgetSelectorOpen, setIsWidgetSelectorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const { data: dashboardConfig } = useQuery({
    queryKey: ['dashboard-config', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', currentCompanyId)
        .single();

      if (error) {
        console.error('Error fetching dashboard config:', error);
        return null;
      }

      return data;
    },
    enabled: !!currentCompanyId
  });

  const handleAddWidget = (widgetType: string) => {
    const widgetConfig = WIDGET_TYPES[widgetType];
    if (!widgetConfig) return;

    const newWidget: Widget = {
      id: Date.now().toString(),
      type: widgetType,
      title: widgetConfig.title,
      x: 0,
      y: 0,
      w: widgetConfig.defaultSize.w,
      h: widgetConfig.defaultSize.h,
      data: []
    };

    setWidgets(prev => [...prev, newWidget]);
    addWidget(widgetType);
    setIsWidgetSelectorOpen(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    removeWidget(widgetId);
  };

  const handleLayoutChange = (layout: any[]) => {
    setWidgets(prev => prev.map(widget => {
      const layoutItem = layout.find(item => item.i === widget.id);
      return layoutItem ? { ...widget, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h } : widget;
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResponsiveDashboardHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddWidget={() => setIsWidgetSelectorOpen(true)}
      />

      {widgets.length === 0 ? (
        <EmptyDashboardState onAddWidget={() => setIsWidgetSelectorOpen(true)} />
      ) : (
        <>
          {(viewMode === 'desktop' && !isMobile) ? (
            <ResponsiveWidgetContainer
              widgets={widgets}
              onLayoutChange={handleLayoutChange}
              onRemoveWidget={handleRemoveWidget}
            />
          ) : (
            <MobileWidgetList
              widgets={widgets}
              onRemove={handleRemoveWidget}
            />
          )}
        </>
      )}

      <WidgetSelector
        open={isWidgetSelectorOpen}
        onOpenChange={setIsWidgetSelectorOpen}
        onAddWidget={handleAddWidget}
        existingWidgets={widgets}
      />
    </div>
  );
};

export default Dashboard;
