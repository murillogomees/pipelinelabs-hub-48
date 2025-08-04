import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function MobileContainer({ 
  children, 
  className, 
  padding = true 
}: MobileContainerProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      'w-full mx-auto',
      padding && (isMobile ? 'px-3 py-4' : 'px-4 sm:px-6 lg:px-8 py-6'),
      className
    )}>
      {children}
    </div>
  );
}

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  variant?: 'default' | 'compact' | 'elevated';
}

export function MobileCard({ 
  children, 
  className, 
  interactive = false,
  variant = 'default'
}: MobileCardProps) {
  const isMobile = useIsMobile();
  
  const variantClasses = {
    default: 'p-4 sm:p-6',
    compact: 'p-3 sm:p-4',
    elevated: 'p-4 sm:p-6 shadow-lg'
  };
  
  return (
    <div className={cn(
      // Base styles
      'bg-card text-card-foreground border border-border rounded-xl',
      'transition-all duration-200 ease-out',
      
      // Responsive padding
      variantClasses[variant],
      
      // Interactive states
      interactive && [
        'cursor-pointer touch-manipulation',
        'hover:shadow-md hover:shadow-primary/5',
        'active:scale-[0.98] transform-gpu',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      ],
      
      // Mobile optimizations
      isMobile && 'min-h-[80px]',
      
      className
    )}>
      {children}
    </div>
  );
}

interface MobileButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function MobileButton({ 
  children, 
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  disabled = false
}: MobileButtonProps) {
  const isMobile = useIsMobile();
  
  const baseClasses = [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-lg transition-all duration-200',
    'touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.95] transform-gpu'
  ];
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };
  
  const sizeClasses = {
    sm: isMobile ? 'min-h-[40px] px-3 text-sm' : 'h-9 px-3 text-sm',
    md: isMobile ? 'min-h-[44px] px-4 text-base' : 'h-10 px-4 text-sm',
    lg: isMobile ? 'min-h-[48px] px-6 text-lg' : 'h-11 px-8 text-base'
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface MobileInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}

export function MobileInput({ 
  placeholder,
  value,
  onChange,
  className,
  type = 'text',
  disabled = false,
  required = false
}: MobileInputProps) {
  const isMobile = useIsMobile();
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      required={required}
      className={cn(
        // Base styles
        'w-full px-3 py-2 sm:px-4 sm:py-3',
        'border border-input rounded-md bg-background',
        'text-base placeholder:text-muted-foreground', // 16px min for iOS
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
        'transition-all duration-200 touch-manipulation',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Mobile optimizations
        isMobile && 'min-h-[44px]',
        
        className
      )}
      style={{
        fontSize: '16px' // Prevent zoom on iOS
      }}
    />
  );
}

interface MobileTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
}

export function MobileTextarea({ 
  placeholder,
  value,
  onChange,
  className,
  rows = 3,
  disabled = false,
  required = false
}: MobileTextareaProps) {
  const isMobile = useIsMobile();
  
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      required={required}
      rows={rows}
      className={cn(
        // Base styles
        'w-full px-3 py-2 sm:px-4 sm:py-3',
        'border border-input rounded-md bg-background',
        'text-base placeholder:text-muted-foreground', // 16px min for iOS
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
        'transition-all duration-200 touch-manipulation resize-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Mobile optimizations
        isMobile && 'min-h-[88px]', // 44px * 2 rows minimum
        
        className
      )}
      style={{
        fontSize: '16px' // Prevent zoom on iOS
      }}
    />
  );
}

interface MobileSelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function MobileSelect({ 
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  className,
  disabled = false,
  required = false
}: MobileSelectProps) {
  const isMobile = useIsMobile();
  
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      required={required}
      className={cn(
        // Base styles
        'w-full px-3 py-2 sm:px-4 sm:py-3',
        'border border-input rounded-md bg-background',
        'text-base text-foreground', // 16px min for iOS
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
        'transition-all duration-200 touch-manipulation',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Mobile optimizations
        isMobile && 'min-h-[44px]',
        
        className
      )}
      style={{
        fontSize: '16px' // Prevent zoom on iOS
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface MobileStackProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function MobileStack({ 
  children, 
  spacing = 'md',
  className 
}: MobileStackProps) {
  const spacingClasses = {
    xs: 'space-y-1',
    sm: 'space-y-2 sm:space-y-3',
    md: 'space-y-3 sm:space-y-4',
    lg: 'space-y-4 sm:space-y-6',
    xl: 'space-y-6 sm:space-y-8'
  };
  
  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
}

interface MobileGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileGrid({ 
  children, 
  cols = 2, 
  gap = 'md',
  className 
}: MobileGridProps) {
  const isMobile = useIsMobile();
  
  const colsClasses = {
    1: 'grid-cols-1',
    2: isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2',
    3: isMobile ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
    4: isMobile ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4'
  };
  
  const gapClasses = {
    xs: 'gap-1 sm:gap-2',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6'
  };
  
  return (
    <div className={cn(
      'grid',
      colsClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}