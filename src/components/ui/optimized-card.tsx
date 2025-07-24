import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const cardVariants = cva(
  'transition-all duration-200 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border border-border shadow-sm hover:shadow-md',
        elevated: 'bg-card text-card-foreground border border-border shadow-md hover:shadow-lg',
        flat: 'bg-card text-card-foreground border border-border',
        ghost: 'bg-transparent border-0 shadow-none'
      },
      size: {
        sm: 'p-3 sm:p-4',
        default: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8'
      },
      rounded: {
        sm: 'rounded-md',
        default: 'rounded-lg',
        lg: 'rounded-xl',
        full: 'rounded-2xl'
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
      interactive: false
    }
  }
);

interface OptimizedCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  header?: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
  };
  footer?: React.ReactNode;
}

export function OptimizedCard({
  children,
  className,
  variant,
  size,
  rounded,
  interactive,
  header,
  footer,
  ...props
}: OptimizedCardProps) {
  const CardComponent = header || footer ? Card : 'div';

  const content = header || footer ? (
    <>
      {header && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-4">
          <div className="space-y-1">
            {header.title && <CardTitle className="text-lg sm:text-xl">{header.title}</CardTitle>}
            {header.description && (
              <CardDescription className="text-sm sm:text-base">{header.description}</CardDescription>
            )}
          </div>
          {header.action}
        </CardHeader>
      )}
      <CardContent className={cn(!header && 'pt-0', !footer && 'pb-0')}>
        {children}
      </CardContent>
      {footer && (
        <div className="p-4 sm:p-6 pt-0 border-t border-border">
          {footer}
        </div>
      )}
    </>
  ) : children;

  if (CardComponent === Card) {
    return (
      <Card
        className={cn(cardVariants({ variant, size, rounded, interactive }), className)}
        {...props}
      >
        {content}
      </Card>
    );
  }

  return (
    <div
      className={cn(cardVariants({ variant, size, rounded, interactive }), className)}
      {...props}
    >
      {content}
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon,
  className
}: StatsCardProps) {
  return (
    <OptimizedCard variant="default" className={className}>
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                trend.isPositive 
                  ? 'text-success bg-success/10' 
                  : 'text-destructive bg-destructive/10'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        </div>
      )}
    </OptimizedCard>
  );
}

// Feature Card Component
interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  onClick
}: FeatureCardProps) {
  return (
    <OptimizedCard 
      variant="default" 
      interactive={!!onClick}
      className={className}
      onClick={onClick}
    >
      <div className="space-y-4">
        {icon && (
          <div className="p-3 bg-primary/10 rounded-lg w-fit">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </OptimizedCard>
  );
}

export { cardVariants };