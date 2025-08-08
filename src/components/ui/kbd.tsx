
import React from 'react';
import { cn } from '@/lib/utils';

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <kbd
        className={cn(
          "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);
Kbd.displayName = "Kbd";
