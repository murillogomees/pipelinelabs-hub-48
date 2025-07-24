import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton as Button } from '@/components/ui/enhanced-button';
import { Monitor, Smartphone, Tablet, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreakpointIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
}

export function BreakpointIndicator({ 
  position = 'bottom-right', 
  showDetails = false 
}: BreakpointIndicatorProps) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const getCurrentBreakpoint = (width: number) => {
    if (width < 640) return { name: 'xs', label: 'Mobile', icon: Smartphone, color: 'bg-red-500' };
    if (width < 768) return { name: 'sm', label: 'Mobile L', icon: Smartphone, color: 'bg-orange-500' };
    if (width < 1024) return { name: 'md', label: 'Tablet', icon: Tablet, color: 'bg-yellow-500' };
    if (width < 1280) return { name: 'lg', label: 'Tablet L', icon: Tablet, color: 'bg-green-500' };
    if (width < 1536) return { name: 'xl', label: 'Desktop', icon: Monitor, color: 'bg-blue-500' };
    return { name: '2xl', label: 'Desktop L', icon: Monitor, color: 'bg-purple-500' };
  };

  const breakpoint = getCurrentBreakpoint(viewport.width);
  const Icon = breakpoint.icon;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        className={cn(
          'fixed z-50 opacity-50 hover:opacity-100',
          positionClasses[position]
        )}
        onClick={() => setIsVisible(true)}
      >
        <Eye className="w-3 h-3" />
      </Button>
    );
  }

  return (
    <div className={cn(
      'fixed z-50 flex items-center gap-2',
      positionClasses[position]
    )}>
      <div className={cn(
        'rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-2 flex items-center gap-2',
        showDetails && 'p-3'
      )}>
        <div className={cn('w-2 h-2 rounded-full', breakpoint.color)} />
        <Icon className="w-4 h-4" />
        <Badge variant="secondary" className="text-xs">
          {breakpoint.name}
        </Badge>
        
        {showDetails && (
          <div className="text-xs text-muted-foreground">
            {viewport.width}×{viewport.height}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-6 w-6 opacity-60 hover:opacity-100"
          onClick={() => setIsVisible(false)}
        >
          <EyeOff className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}