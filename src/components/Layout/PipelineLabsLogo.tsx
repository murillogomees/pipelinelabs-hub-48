import React from 'react';

interface PipelineLabsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  iconOnly?: boolean;
  variant?: 'default' | 'white';
}

export function PipelineLabsLogo({ 
  className = '', 
  size = 'md', 
  showText = true,
  iconOnly = false,
  variant = 'default'
}: PipelineLabsLogoProps) {
  const sizeConfig = {
    sm: { height: 32, iconSize: 28, fontSize: 'text-lg', tagSize: 'text-xs' },
    md: { height: 40, iconSize: 36, fontSize: 'text-xl', tagSize: 'text-xs' },
    lg: { height: 48, iconSize: 44, fontSize: 'text-2xl', tagSize: 'text-sm' },
    xl: { height: 64, iconSize: 56, fontSize: 'text-3xl', tagSize: 'text-base' }
  };

  const config = sizeConfig[size];
  const isWhite = variant === 'white';
  
  // SVG Logo Icon baseado no design enviado
  const LogoIcon = () => (
    <svg 
      width={config.iconSize} 
      height={config.iconSize} 
      viewBox="0 0 100 100" 
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id="pipelineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      
      {/* Ícone estilizado baseado no "P" do Pipeline */}
      <path
        d="M15 15 L15 85 L25 85 L25 55 L60 55 C75 55 85 45 85 30 C85 15 75 5 60 5 L15 5 L15 15 Z M25 25 L25 15 L60 15 C70 15 75 20 75 30 C75 40 70 45 60 45 L25 45 L25 25 Z"
        fill={isWhite ? "white" : "url(#pipelineGradient)"}
        className="drop-shadow-sm"
      />
      
      {/* Detalhe adicional para dar profundidade */}
      <path
        d="M70 30 C70 35 65 40 60 40 L30 40 L30 50 L60 50 C70 50 80 40 80 30 C80 20 70 10 60 10 L30 10 L30 20 L60 20 C65 20 70 25 70 30 Z"
        fill={isWhite ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)"}
      />
    </svg>
  );

  if (iconOnly) {
    return (
      <div className={`flex items-center ${className}`}>
        <LogoIcon />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon />
      {showText && (
        <div className="flex flex-col leading-none">
          <span 
            className={`font-bold tracking-tight ${config.fontSize} ${
              isWhite ? 'text-white' : 'text-foreground'
            }`}
          >
            Pipeline Labs
          </span>
          <span 
            className={`${config.tagSize} font-medium opacity-70 ${
              isWhite ? 'text-white/70' : 'text-muted-foreground'
            }`}
          >
            ERP Inteligente
          </span>
        </div>
      )}
    </div>
  );
}