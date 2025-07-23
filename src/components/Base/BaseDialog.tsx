import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: 'sm:max-w-[425px]',
  md: 'sm:max-w-[600px]', 
  lg: 'sm:max-w-[800px]',
  xl: 'sm:max-w-[1000px]',
  '2xl': 'sm:max-w-[1200px]',
  full: 'sm:max-w-[95vw]'
} as const;

export const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  className = ''
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidthClasses[maxWidth], className)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2 text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        {children}
      </DialogContent>
    </Dialog>
  );
};

// Hook para controlar dialog
export const useDialog = (initialOpen = false) => {
  const [open, setOpen] = React.useState(initialOpen);
  
  const openDialog = React.useCallback(() => setOpen(true), []);
  const closeDialog = React.useCallback(() => setOpen(false), []);
  const toggleDialog = React.useCallback(() => setOpen(prev => !prev), []);
  
  return {
    open,
    openDialog,
    closeDialog,
    toggleDialog,
    setOpen
  };
};