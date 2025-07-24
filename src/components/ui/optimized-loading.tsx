import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Skeleton } from '@/components/ui/skeleton';

const loadingVariants = cva(
  'animate-pulse',
  {
    variants: {
      variant: {
        default: 'bg-muted animate-pulse',
        shimmer: 'bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer',
        pulse: 'bg-muted animate-pulse-slow'
      },
      size: {
        sm: 'h-4',
        default: 'h-6',
        lg: 'h-8',
        xl: 'h-12'
      },
      shape: {
        rectangle: 'rounded-md',
        circle: 'rounded-full aspect-square',
        text: 'rounded-sm'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'rectangle'
    }
  }
);

interface LoadingSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  lines?: number;
  width?: string | number;
  height?: string | number;
}

export function LoadingSkeleton({
  className,
  variant,
  size,
  shape,
  lines = 1,
  width,
  height,
  ...props
}: LoadingSkeletonProps) {
  const singleSkeleton = (
    <div
      className={cn(loadingVariants({ variant, size, shape }), className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
      {...props}
    />
  );

  if (lines === 1) {
    return singleSkeleton;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(loadingVariants({ variant, size, shape }), className)}
          style={{
            width: i === lines - 1 ? '80%' : '100%', // Last line is shorter for realism
            height: typeof height === 'number' ? `${height}px` : height
          }}
          {...props}
        />
      ))}
    </div>
  );
}

// Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'muted';
}

export function LoadingSpinner({
  size = 'default',
  className,
  color = 'primary'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    muted: 'border-muted-foreground'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-transparent',
        sizeClasses[size],
        `${colorClasses[color]} border-t-current`,
        className
      )}
    />
  );
}

// Loading States for different contexts
interface PageLoadingProps {
  message?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function PageLoading({ message = 'Carregando...', size = 'default' }: PageLoadingProps) {
  const containerClasses = {
    sm: 'min-h-[200px]',
    default: 'min-h-[400px]',
    lg: 'min-h-[600px]'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', containerClasses[size])}>
      <LoadingSpinner size={size === 'sm' ? 'default' : 'lg'} />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Component Loading State
interface ComponentLoadingProps {
  variant?: 'skeleton' | 'spinner';
  lines?: number;
  className?: string;
}

export function ComponentLoading({
  variant = 'skeleton',
  lines = 3,
  className
}: ComponentLoadingProps) {
  if (variant === 'spinner') {
    return (
      <div className={cn('flex justify-center p-4', className)}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={cn('space-y-2 p-4', className)}>
      <LoadingSkeleton lines={lines} />
    </div>
  );
}

// Table Loading State
interface TableLoadingProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableLoading({
  rows = 5,
  columns = 4,
  showHeader = true
}: TableLoadingProps) {
  return (
    <div className="space-y-2">
      {showHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, i) => (
            <LoadingSkeleton key={`header-${i}`} size="sm" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <LoadingSkeleton key={`cell-${rowIndex}-${colIndex}`} size="default" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Card Loading State
export function CardLoading() {
  return (
    <div className="card-system space-y-4">
      <div className="space-y-2">
        <LoadingSkeleton size="lg" width="60%" />
        <LoadingSkeleton size="default" width="40%" />
      </div>
      <LoadingSkeleton lines={3} />
      <div className="flex gap-2">
        <LoadingSkeleton size="default" width="80px" />
        <LoadingSkeleton size="default" width="100px" />
      </div>
    </div>
  );
}

// Dashboard Loading State
export function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <LoadingSkeleton size="xl" width="300px" />
        <LoadingSkeleton size="default" width="500px" />
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive-4">
        {Array.from({ length: 4 }, (_, i) => (
          <CardLoading key={`stat-${i}`} />
        ))}
      </div>

      {/* Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardLoading />
        <CardLoading />
      </div>

      {/* Table */}
      <div className="card-system">
        <TableLoading />
      </div>
    </div>
  );
}

export { loadingVariants };