
import React from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { EnhancedButton as Button } from '@/components/ui/enhanced-button';
import { ResponsiveContainer } from '@/components/ui/responsive-layout';

interface EmptyDashboardStateProps {
  onAddWidget: () => void;
}

export function EmptyDashboardState({ onAddWidget }: EmptyDashboardStateProps) {
  return (
    <ResponsiveContainer>
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 px-4 space-y-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/50 flex items-center justify-center">
          <LayoutGrid className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
        </div>
        
        <div className="text-center max-w-md space-y-4">
          <h3 className="heading-subsection text-xl sm:text-2xl font-semibold text-foreground">
            Seu dashboard está vazio
          </h3>
          <p className="body-default text-sm sm:text-base text-muted-foreground leading-relaxed">
            Adicione widgets para monitorar as principais métricas do seu negócio em tempo real
          </p>
        </div>
        
        <Button 
          onClick={onAddWidget}
          size="lg"
          className="w-full sm:w-auto min-h-[44px] px-8 py-3 text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Primeiro Widget
        </Button>
      </div>
    </ResponsiveContainer>
  );
}
