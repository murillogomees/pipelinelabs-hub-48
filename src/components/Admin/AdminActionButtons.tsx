import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { Trash2, Edit, Eye, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreate?: () => void;
  itemName?: string;
  itemType?: string;
  deleteTitle?: string;
  deleteDescription?: string;
  className?: string;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showCreate?: boolean;
  variant?: 'default' | 'compact' | 'full';
}

export function AdminActionButtons({
  onView,
  onEdit,
  onDelete,
  onCreate,
  itemName,
  itemType = 'item',
  deleteTitle,
  deleteDescription,
  className,
  showView = true,
  showEdit = true,
  showDelete = true,
  showCreate = true,
  variant = 'default'
}: AdminActionButtonsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { canDeleteAnyRecord, canModifyAnyData, isSuperAdmin } = usePermissions();

  const handleDelete = () => {
    if (onDelete && canDeleteAnyRecord) {
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const finalDeleteTitle = deleteTitle || `Excluir ${itemType}`;
  const finalDeleteDescription = deleteDescription || 
    `Tem certeza que deseja excluir este ${itemType}? Esta ação não pode ser desfeita.`;

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        {showView && onView && (
          <Button size="sm" variant="ghost" onClick={onView}>
            <Eye className="w-4 h-4" />
          </Button>
        )}
        {showEdit && onEdit && canModifyAnyData && (
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
        )}
        {showDelete && onDelete && canDeleteAnyRecord && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmDelete}
          title={finalDeleteTitle}
          description={finalDeleteDescription}
          itemName={itemName}
        />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
        {showCreate && onCreate && canModifyAnyData && (
          <Button onClick={onCreate} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Novo {itemType}</span>
          </Button>
        )}
        
        <div className="flex items-center space-x-2">
          {showView && onView && (
            <Button variant="outline" onClick={onView} className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Visualizar</span>
            </Button>
          )}
          {showEdit && onEdit && canModifyAnyData && (
            <Button variant="outline" onClick={onEdit} className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </Button>
          )}
          {showDelete && onDelete && canDeleteAnyRecord && (
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="flex items-center space-x-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </Button>
          )}
        </div>
        
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmDelete}
          title={finalDeleteTitle}
          description={finalDeleteDescription}
          itemName={itemName}
        />
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {showView && onView && (
        <Button size="sm" variant="outline" onClick={onView}>
          <Eye className="w-4 h-4 mr-1" />
          Ver
        </Button>
      )}
      {showEdit && onEdit && canModifyAnyData && (
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-1" />
          Editar
        </Button>
      )}
      {showDelete && onDelete && canDeleteAnyRecord && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleDelete}
          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Excluir
        </Button>
      )}
      
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title={finalDeleteTitle}
        description={finalDeleteDescription}
        itemName={itemName}
      />
    </div>
  );
}