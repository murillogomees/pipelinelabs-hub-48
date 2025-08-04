
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboard, useUpdateDashboard, WIDGET_TYPES, Widget } from '@/hooks/useDashboard';
import { usePermissions } from '@/hooks/usePermissions';
import { ResponsiveDashboard } from '@/components/Dashboard/ResponsiveDashboard';

const Dashboard: React.FC = () => {
  const { dashboardData, isLoading } = useDashboard();
  const { addWidget, removeWidget } = useUpdateDashboard();
  const { currentCompanyId } = usePermissions();
  
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: '1',
      type: 'sales_monthly',
      title: 'Vendas do Mês',
      x: 0,
      y: 0,
      w: 4,
      h: 2,
      data: dashboardData?.sales || []
    },
    {
      id: '2',
      type: 'low_stock',
      title: 'Estoque Baixo',
      x: 4,
      y: 0,
      w: 4,
      h: 2,
      data: dashboardData?.products || []
    },
    {
      id: '3',
      type: 'quick_actions',
      title: 'Ações Rápidas',
      x: 0,
      y: 2,
      w: 4,
      h: 2,
      data: []
    },
    {
      id: '4',
      type: 'pending_orders',
      title: 'Pedidos Pendentes',
      x: 4,
      y: 2,
      w: 4,
      h: 2,
      data: dashboardData?.sales || []
    }
  ]);

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
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    removeWidget(widgetId);
  };

  return (
    <ResponsiveDashboard
      widgets={widgets}
      onAddWidget={handleAddWidget}
      onRemoveWidget={handleRemoveWidget}
      isLoading={isLoading}
    />
  );
};

export default Dashboard;
