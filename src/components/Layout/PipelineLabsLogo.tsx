import React from 'react';
import pipelineLabsLogo from '@/assets/pipeline-labs-logo.png';
import pipelineIcon from '@/assets/pipeline-icon.png';

interface PipelineLabsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  iconOnly?: boolean;
}

export function PipelineLabsLogo({ 
  className = '', 
  size = 'md', 
  showText = true,
  iconOnly = false
}: PipelineLabsLogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  const logoSrc = iconOnly ? pipelineIcon : pipelineLabsLogo;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={logoSrc} 
        alt="Pipeline Labs" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showText && !iconOnly && (
        <div className="flex flex-col">
          <span className="font-bold text-primary">Pipeline Labs</span>
          <span className="text-xs text-muted-foreground">ERP Inteligente</span>
        </div>
      )}
    </div>
  );
}