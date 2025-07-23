import React from 'react';
import { Widget } from '@/hooks/useDashboard';
import { DashboardWidget } from './DashboardWidget';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileWidgetListProps {
  widgets: Widget[];
  onRemove: (widgetId: string) => void;
}

export function MobileWidgetList({ widgets, onRemove }: MobileWidgetListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-1">
        {widgets.map((widget) => (
          <div key={widget.id} className="w-full">
            <DashboardWidget
              widget={widget}
              onRemove={onRemove}
              isDragHandle={false}
              className="min-h-[120px]"
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}