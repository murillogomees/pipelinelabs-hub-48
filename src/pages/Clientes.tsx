
import { useState } from 'react';
import { Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BaseTable } from '@/components/Base/BaseTable';
import { CustomerDialog } from '@/components/Customers/CustomerDialog';
import { useCustomerManager } from '@/hooks/useCustomerManager';

export default function Clientes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const { customers, isLoading, createCustomer, updateCustomer } = useCustomerManager();

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefone' },
    { key: 'document', label: 'Documento' }
  ];

  const actions = [
    {
      icon: Edit,
      label: 'Editar',
      onClick: (customer: any) => {
        setSelectedCustomer(customer);
        setIsDialogOpen(true);
      }
    }
  ];

  const handleCreate = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCustomer(null);
  };

  const handleSave = async (customerData: any) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.id, customerData);
    } else {
      await createCustomer(customerData);
    }
    handleCloseDialog();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e contatos
          </p>
        </div>
        
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <BaseTable
        data={customers || []}
        columns={columns}
        actions={actions}
        loading={isLoading}
      />

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        customer={selectedCustomer}
        onSave={handleSave}
        onUpdate={handleSave}
      />
    </div>
  );
}
