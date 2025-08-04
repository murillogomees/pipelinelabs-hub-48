import React, { useState } from 'react';
import { Grid, Flex } from '@/components/ui/grid';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Grid3X3, 
  List, 
  Smartphone, 
  Monitor,
  LayoutGrid,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/responsive-layout';
import { DashboardWidget } from './DashboardWidget';
import { WidgetSelector } from './WidgetSelector';
import { EmptyDashboardState } from './EmptyDashboardState';
import { cn } from '@/lib/utils';
import { Widget } from '@/hooks/useDashboard';

interface ResponsiveDashboardProps {
  widgets: Widget[];
  onAddWidget: (widgetType: string) => void;
  onRemoveWidget: (widgetId: string) => void;
  isLoading?: boolean;
}

type ViewMode = 'auto' | 'grid' | 'list' | 'compact';
type GridSize = 'sm' | 'md' | 'lg' | 'xl';

export function ResponsiveDashboard({
  widgets,
  onAddWidget,
  onRemoveWidget,
  isLoading = false
}: ResponsiveDashboardProps) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('auto');
  const [gridSize, setGridSize] = useState<GridSize>('md');
  const [isWidgetSelectorOpen, setIsWidgetSelectorOpen] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Auto-detect best view mode based on screen size
  const effectiveViewMode = viewMode === 'auto' 
    ? (isMobile ? 'list' : 'grid')
    : viewMode;

  const gridConfig = {
    sm: { cols: { default: 1, sm: 2 }, gap: 'sm' as const },
    md: { cols: { default: 1, sm: 2, lg: 3 }, gap: 'md' as const },
    lg: { cols: { default: 1, sm: 2, lg: 3, xl: 4 }, gap: 'md' as const },
    xl: { cols: { default: 1, sm: 2, lg: 4, xl: 5 }, gap: 'lg' as const }
  };

  const handleAddWidget = (widgetType: string) => {
    onAddWidget(widgetType);
    setIsWidgetSelectorOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-4 sm:space-y-6">
        {/* Dashboard Header */}
        <Flex 
          direction={isMobile ? "col" : "row"} 
          justify="between" 
          align={isMobile ? "start" : "center"}
          gap="md"
          className="w-full"
        >
          <div className="flex-1 min-w-0 space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Visão completa e responsiva do seu negócio
            </p>
          </div>

          {/* View Controls */}
          <Flex 
            direction={isMobile ? "col" : "row"} 
            gap="sm" 
            className={cn("w-full sm:w-auto", isMobile && "mt-4")}
          >
            {/* View Mode Selector */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1">
              <Button
                variant={effectiveViewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(isMobile ? 'list' : 'grid')}
                className="h-8 px-3"
              >
                <Grid3X3 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={effectiveViewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Lista</span>
              </Button>
              <Button
                variant={effectiveViewMode === 'compact' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('compact')}
                className="h-8 px-3"
              >
                <LayoutGrid className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Compacto</span>
              </Button>
            </div>

            {/* Grid Size Control (only for grid mode) */}
            {effectiveViewMode === 'grid' && !isMobile && (
              <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1">
                <Button
                  variant={gridSize === 'sm' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setGridSize('sm')}
                  className="h-8 px-2"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={gridSize === 'lg' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setGridSize('lg')}
                  className="h-8 px-2"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Add Widget Button */}
            <Button 
              onClick={() => setIsWidgetSelectorOpen(true)}
              className="min-h-[44px] px-4 sm:px-6 gap-2 font-medium"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {isMobile ? 'Widget' : 'Adicionar Widget'}
              </span>
            </Button>
          </Flex>
        </Flex>

        {/* Dashboard Content */}
        {widgets.length === 0 ? (
          <EmptyDashboardState onAddWidget={() => setIsWidgetSelectorOpen(true)} />
        ) : (
          <div className="w-full">
            {effectiveViewMode === 'list' ? (
              // List View - Mobile Optimized
              <div className="space-y-3 sm:space-y-4">
                {widgets.map((widget) => (
                  <Card key={widget.id} className="overflow-hidden">
                    <DashboardWidget
                      widget={widget}
                      onRemove={onRemoveWidget}
                      className="border-0 shadow-none"
                    />
                  </Card>
                ))}
              </div>
            ) : effectiveViewMode === 'compact' ? (
              // Compact View
              <ResponsiveGrid
                cols={{ default: 1, sm: 2, md: 3, lg: 4, xl: 6 }}
                gap="sm"
                className="w-full"
              >
                {widgets.map((widget) => (
                  <DashboardWidget
                    key={widget.id}
                    widget={widget}
                    onRemove={onRemoveWidget}
                    className="min-h-[100px]"
                  />
                ))}
              </ResponsiveGrid>
            ) : (
              // Grid View - Responsive
              <ResponsiveGrid
                {...gridConfig[gridSize]}
                className="w-full"
              >
                {widgets.map((widget) => (
                  <DashboardWidget
                    key={widget.id}
                    widget={widget}
                    onRemove={onRemoveWidget}
                    className={cn(
                      "transition-all duration-200",
                      isCompactMode ? "min-h-[120px]" : "min-h-[140px] sm:min-h-[160px]"
                    )}
                  />
                ))}
              </ResponsiveGrid>
            )}
          </div>
        )}

        {/* Performance Badge */}
        {widgets.length > 0 && (
          <div className="flex items-center justify-center pt-4">
            <Badge variant="secondary" className="text-xs px-3 py-1">
              <Monitor className="w-3 h-3 mr-1" />
              {widgets.length} widget{widgets.length !== 1 ? 's' : ''} • 
              {effectiveViewMode === 'grid' ? 'Grade' : effectiveViewMode === 'list' ? 'Lista' : 'Compacto'}
              {isMobile && (
                <>
                  <Smartphone className="w-3 h-3 ml-2" />
                  Móvel
                </>
              )}
            </Badge>
          </div>
        )}

        {/* Widget Selector */}
        <WidgetSelector
          open={isWidgetSelectorOpen}
          onOpenChange={setIsWidgetSelectorOpen}
          onAddWidget={handleAddWidget}
          existingWidgets={widgets}
        />
      </div>
    </ResponsiveContainer>
  );
}