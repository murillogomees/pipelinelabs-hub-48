import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserForm } from './UserForm/UserForm';
import { useUserManagement } from './UserForm/hooks/useUserManagement';
import { User } from './UserForm/types';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSave: () => void;
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const { loading, handleSubmit } = useUserManagement(onSave, () => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center space-x-2">
            {user ? (
              <>
                <span>Editar Usuário</span>
                <span className="text-sm font-normal text-muted-foreground">
                  • {user.display_name || user.email}
                </span>
              </>
            ) : (
              'Novo Usuário'
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <UserForm
            user={user}
            onSubmit={(formData) => handleSubmit(user, formData)}
            loading={loading}
          />
        </div>

        <DialogFooter className="pt-4 border-t mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}