import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveWidgetContainerProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function ResponsiveWidgetContainer({ 
  children, 
  className,
  compact 
}: ResponsiveWidgetContainerProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      // Base container
      "min-h-0 w-full",
      
      // Responsive spacing and layout
      isMobile ? "p-1" : compact ? "p-2" : "p-3",
      
      // Grid behavior
      "flex flex-col h-full",
      
      // Custom classes
      className
    )}>
      {children}
    </div>
  );
}