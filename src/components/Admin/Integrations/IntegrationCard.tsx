import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { getTypeColor, getTypeLabel } from './utils';
import type { IntegrationAvailable } from './types';

interface IntegrationCardProps {
  integration: IntegrationAvailable;
  onEdit: (integration: IntegrationAvailable) => void;
  onDelete: (id: string) => void;
  editDialog: {open: boolean, integration?: IntegrationAvailable};
  setEditDialog: (state: {open: boolean, integration?: IntegrationAvailable}) => void;
  IntegrationDialog: React.ComponentType<any>;
}

export function IntegrationCard({
  integration,
  onEdit,
  onDelete,
  editDialog,
  setEditDialog,
  IntegrationDialog
}: IntegrationCardProps) {
  const [deleteDialog, setDeleteDialog] = useState(false);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                {integration.logo_url && (
                  <img 
                    src={integration.logo_url} 
                    alt={integration.name}
                    className="w-6 h-6 object-contain"
                  />
                )}
                <CardTitle className="text-lg">{integration.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(integration.type)}>
                  {getTypeLabel(integration.type)}
                </Badge>
                {integration.visible_to_companies ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Eye className="w-3 h-3 mr-1" />
                    Visível
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-600 border-gray-600">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Oculto
                  </Badge>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(integration)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <CardDescription className="text-sm min-h-[2.5rem]">
            {integration.description || 'Sem descrição'}
          </CardDescription>

          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Campos configuráveis: </span>
              <span className="text-muted-foreground">
                {integration.config_schema?.length || 0}
              </span>
            </div>
            
            <div className="text-sm">
              <span className="font-medium">Planos permitidos: </span>
              <span className="text-muted-foreground">
                {integration.available_for_plans?.length || 0}
              </span>
            </div>
          </div>

          {integration.config_schema && integration.config_schema.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {integration.config_schema.slice(0, 3).map((field, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {field.label}
                </Badge>
              ))}
              {integration.config_schema.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{integration.config_schema.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Criado em {new Date(integration.created_at).toLocaleDateString('pt-BR')}
          </div>
        </CardContent>
      </Card>

      <Dialog 
        open={editDialog.open && editDialog.integration?.id === integration.id}
        onOpenChange={(open) => setEditDialog({open, integration: open ? integration : undefined})}
      >
        <IntegrationDialog 
          mode="edit"
          integration={integration}
          open={editDialog.open && editDialog.integration?.id === integration.id}
          onOpenChange={(open: boolean) => setEditDialog({open, integration: open ? integration : undefined})}
        />
      </Dialog>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a integração "{integration.name}"? 
              Esta ação não pode ser desfeita e todas as configurações das empresas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete(integration.id);
                setDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}