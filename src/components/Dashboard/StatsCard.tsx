
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: string;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
  subtitle?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral', 
  color,
  onClick,
  className,
  compact = false,
  subtitle
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-emerald-600 dark:text-emerald-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return TrendingUp;
      case 'negative': return TrendingDown;
      default: return Minus;
    }
  };

  const ChangeIcon = getChangeIcon();

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-200 border-border/50",
        "bg-gradient-to-br from-card to-card/95",
        onClick && "cursor-pointer hover:border-primary/20",
        "group",
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn(
        compact ? "p-4" : "p-4 sm:p-6"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium text-muted-foreground mb-1 truncate",
              compact ? "text-xs" : "text-sm"
            )}>
              {title}
            </p>
            <p className={cn(
              "font-bold text-foreground truncate",
              compact ? "text-lg" : "text-xl sm:text-2xl"
            )}>
              {value}
            </p>
            
            {/* Informações adicionais */}
            <div className="mt-2 space-y-1">
              {change && (
                <div className={cn(
                  "flex items-center",
                  compact ? "text-xs" : "text-sm"
                )}>
                  <ChangeIcon className={cn(
                    "mr-1 flex-shrink-0",
                    compact ? "w-3 h-3" : "w-4 h-4",
                    getChangeColor()
                  )} />
                  <span className={getChangeColor()}>{change}</span>
                </div>
              )}
              
              {subtitle && (
                <p className={cn(
                  "text-muted-foreground",
                  compact ? "text-xs" : "text-sm"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Ícone */}
          <div className={cn(
            "rounded-full flex items-center justify-center flex-shrink-0 ml-3",
            "bg-primary/10 text-primary",
            "group-hover:bg-primary/20 transition-colors",
            compact ? "p-2" : "p-3"
          )}>
            <Icon className={cn(
              compact ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
