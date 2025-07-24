import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'w-full border border-input bg-background ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:scale-[1.01]',
  {
    variants: {
      variant: {
        default: 'rounded-md',
        rounded: 'rounded-lg',
        pill: 'rounded-full'
      },
      size: {
        sm: 'h-9 px-3 py-2 text-sm',
        default: 'h-10 px-3 py-2 text-base', // 16px to prevent iOS zoom
        lg: 'h-12 px-4 py-3 text-lg'
      },
      state: {
        default: 'border-input',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
        warning: 'border-warning focus-visible:ring-warning'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default'
    }
  }
);

interface OptimizedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const OptimizedInput = React.forwardRef<HTMLInputElement, OptimizedInputProps>(
  ({ 
    className,
    variant,
    size,
    state,
    label,
    description,
    error,
    success,
    icon,
    iconPosition = 'left',
    fullWidth = true,
    type = 'text',
    ...props 
  }, ref) => {
    // Determine state based on props
    const currentState = error ? 'error' : success ? 'success' : state;

    return (
      <div className={cn('space-y-2', !fullWidth && 'w-auto')}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <div className="relative group">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors duration-200">
              {icon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              inputVariants({ variant, size, state: currentState }),
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors duration-200">
              {icon}
            </div>
          )}
        </div>

        {(description || error || success) && (
          <div className="space-y-1">
            {description && !error && !success && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
            {success && !error && (
              <p className="text-xs text-success">{success}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

OptimizedInput.displayName = 'OptimizedInput';

// Textarea Component
interface OptimizedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const OptimizedTextarea = React.forwardRef<HTMLTextAreaElement, OptimizedTextareaProps>(
  ({
    className,
    label,
    description,
    error,
    success,
    fullWidth = true,
    resize = 'vertical',
    ...props
  }, ref) => {
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };

    return (
      <div className={cn('space-y-2', !fullWidth && 'w-auto')}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            error && 'border-destructive focus-visible:ring-destructive',
            success && 'border-success focus-visible:ring-success',
            resizeClasses[resize],
            className
          )}
          ref={ref}
          {...props}
        />

        {(description || error || success) && (
          <div className="space-y-1">
            {description && !error && !success && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
            {success && !error && (
              <p className="text-xs text-success">{success}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

OptimizedTextarea.displayName = 'OptimizedTextarea';

export { inputVariants };