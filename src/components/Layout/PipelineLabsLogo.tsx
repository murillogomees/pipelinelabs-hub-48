
import React from 'react';
import { cn } from '@/lib/utils';

interface PipelineLabsLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export function PipelineLabsLogo({ 
  size = 'md', 
  showText = true, 
  iconOnly = false,
  className 
}: PipelineLabsLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold",
        sizeClasses[size]
      )}>
        PL
      </div>
      {showText && !iconOnly && (
        <span className={cn(
          "font-semibold text-foreground",
          textSizeClasses[size]
        )}>
          Pipeline Labs
        </span>
      )}
    </div>
  );
}
