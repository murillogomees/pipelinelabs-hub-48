
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StatsCard as OptimizedStatsCard } from '@/components/ui/optimized-card';
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
  icon, 
  change, 
  changeType = 'neutral', 
  color,
  onClick,
  className,
  compact = false,
  subtitle
}: StatsCardProps) {
  // Use the optimized StatsCard component
  const trend = change ? {
    value: parseFloat(change.replace(/[^0-9.-]/g, '')) || 0,
    label: change,
    isPositive: changeType === 'positive'
  } : undefined;

  return (
    <OptimizedStatsCard
      title={title}
      value={value}
      description={subtitle}
      trend={trend}
      icon={React.createElement(icon, { 
        className: compact ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6" 
      })}
      className={cn(
        onClick && "cursor-pointer",
        className
      )}
      {...(onClick && { onClick })}
    />
  );
}
