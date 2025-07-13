import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus } from 'lucide-react';
import { useIntegrations } from '@/components/Admin/Integrations/hooks/useIntegrations';
import { IntegrationCard } from '@/components/Admin/Integrations/IntegrationCard';
import { IntegrationDialog } from '@/components/Admin/Integrations/IntegrationDialog';
import { EmptyState } from '@/components/Admin/Integrations/EmptyState';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { IntegrationAvailable } from '@/components/Admin/Integrations/types';
import type { IntegrationFormData } from '@/components/Admin/Integrations/schema';

export function AdminIntegracoes() {
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{open: boolean, integration?: IntegrationAvailable}>({open: false});
  
  const {
    integrations,
    isLoading,
    createIntegration,
    updateIntegration,
    deleteIntegration
  } = useIntegrations();

  const handleCreateSubmit = (data: IntegrationFormData) => {
    createIntegration.mutate(data, {
      onSuccess: () => setCreateDialog(false)
    });
  };

  const handleEditSubmit = (data: IntegrationFormData, id?: string) => {
    if (id) {
      updateIntegration.mutate({ id, formData: data }, {
        onSuccess: () => setEditDialog({open: false})
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteIntegration.mutate(id);
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Integrações</h1>
            <p className="text-muted-foreground">
              Configure as integrações disponíveis para as empresas
            </p>
          </div>
          
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Integração
              </Button>
            </DialogTrigger>
            <IntegrationDialog 
              open={createDialog} 
              onOpenChange={setCreateDialog} 
              mode="create"
              onSubmit={handleCreateSubmit}
              isLoading={createIntegration.isPending}
            />
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations?.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration as any}
                  onEdit={(integration) => setEditDialog({open: true, integration})}
                  onDelete={handleDelete}
                  editDialog={editDialog}
                  setEditDialog={setEditDialog}
                  IntegrationDialog={(props: any) => (
                    <IntegrationDialog 
                      {...props}
                      onSubmit={handleEditSubmit}
                      isLoading={updateIntegration.isPending}
                    />
                  )}
                />
              ))}
            </div>

            {(!integrations || integrations.length === 0) && <EmptyState />}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}