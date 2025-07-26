
import React from 'react';
import { EnhancedButton as Button } from '@/components/ui/enhanced-button';
import { Plus, LayoutGrid } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveContainer, ResponsiveFlex } from '@/components/ui/responsive-layout';

interface ResponsiveDashboardHeaderProps {
  onAddWidget: () => void;
}

export function ResponsiveDashboardHeader({ onAddWidget }: ResponsiveDashboardHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <ResponsiveContainer padding={false}>
      <ResponsiveFlex 
        direction={isMobile ? 'col' : 'row'}
        justify="between" 
        align={isMobile ? 'start' : 'center'}
        gap="md"
        className="w-full"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="heading-subsection text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="body-default text-sm sm:text-base text-muted-foreground">
            Personalize sua visão do negócio com widgets inteligentes
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onAddWidget}
            className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-6"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {isMobile ? 'Widget' : 'Adicionar Widget'}
            </span>
          </Button>
        </div>
      </ResponsiveFlex>
    </ResponsiveContainer>
  );
}
