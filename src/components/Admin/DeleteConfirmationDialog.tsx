import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  destructiveAction?: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  destructiveAction = true
}: DeleteConfirmationDialogProps) {
  const { canDeleteAnyRecord } = usePermissions();

  // Se o usuário não pode deletar, não mostrar o diálogo
  if (!canDeleteAnyRecord) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              destructiveAction 
                ? 'bg-destructive/10 text-destructive' 
                : 'bg-warning/10 text-warning'
            }`}>
              {destructiveAction ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-sm leading-relaxed">
          {description}
          {itemName && (
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <strong className="text-foreground">{itemName}</strong>
            </div>
          )}
          <div className="mt-3 text-xs text-muted-foreground">
            ⚠️ Esta ação não pode ser desfeita.
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={`w-full sm:w-auto ${
              destructiveAction 
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                : 'bg-warning hover:bg-warning/90 text-warning-foreground'
            }`}
          >
            {destructiveAction ? 'Excluir Permanentemente' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}