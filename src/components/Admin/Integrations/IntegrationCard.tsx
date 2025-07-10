import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2 } from 'lucide-react';
import { getTypeColor, getTypeLabel } from './utils';
import type { IntegrationAvailable } from './types';

interface IntegrationCardProps {
  integration: IntegrationAvailable;
  onEdit: (integration: IntegrationAvailable) => void;
  onDelete: (id: string) => void;
  editDialog: any;
  setEditDialog: (state: any) => void;
  IntegrationDialog: any;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onEdit,
  onDelete,
  editDialog,
  setEditDialog,
  IntegrationDialog
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{integration.name}</CardTitle>
            <Badge className={getTypeColor(integration.type)}>
              {getTypeLabel(integration.type)}
            </Badge>
          </div>
          {integration.logo_url && (
            <img 
              src={integration.logo_url} 
              alt={integration.name}
              className="w-8 h-8 object-contain"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {integration.description}
        </CardDescription>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${integration.visible_to_companies ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm font-medium">
              {integration.visible_to_companies ? 'Visível' : 'Oculto'}
            </span>
          </div>

          <div className="flex space-x-2">
            <Dialog 
              open={editDialog.open && editDialog.integration?.id === integration.id}
              onOpenChange={(open) => setEditDialog({open, integration: open ? integration : undefined})}
            >
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <IntegrationDialog 
                open={editDialog.open && editDialog.integration?.id === integration.id}
                onOpenChange={(open) => setEditDialog({open, integration: open ? integration : undefined})}
                integration={integration}
                mode="edit"
              />
            </Dialog>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                if (confirm('Tem certeza que deseja remover esta integração?')) {
                  onDelete(integration.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};