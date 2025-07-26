
import { useState } from 'react';
import { Plus, Package, Settings, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BaseTable } from '@/components/Base/BaseTable';
import { ProductionOrderDialog } from '@/components/Production/ProductionOrderDialog';
import { ServiceOrderDialog } from '@/components/Production/ServiceOrderDialog';
import { useProductionOrders } from '@/hooks/useProductionOrders';
import { useServiceOrders } from '@/hooks/useServiceOrders';

export default function Producao() {
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { orders: productionOrders, loading: productionLoading } = useProductionOrders();
  const { orders: serviceOrders, loading: serviceLoading } = useServiceOrders();

  const productionColumns = [
    { key: 'code', label: 'Código' },
    { key: 'product_name', label: 'Produto' },
    { key: 'quantity', label: 'Quantidade' },
    { key: 'status', label: 'Status' },
    { key: 'due_date', label: 'Prazo' }
  ];

  const serviceColumns = [
    { key: 'code', label: 'Código' },
    { key: 'service_name', label: 'Serviço' },
    { key: 'customer_name', label: 'Cliente' },
    { key: 'status', label: 'Status' },
    { key: 'due_date', label: 'Prazo' }
  ];

  const productionActions = [
    {
      icon: Edit,
      label: 'Editar',
      onClick: (order: any) => {
        setSelectedOrder(order);
        setIsProductionDialogOpen(true);
      }
    }
  ];

  const serviceActions = [
    {
      icon: Edit,
      label: 'Editar',
      onClick: (order: any) => {
        setSelectedOrder(order);
        setIsServiceDialogOpen(true);
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produção</h1>
          <p className="text-muted-foreground">
            Gerencie ordens de produção e serviços
          </p>
        </div>
      </div>

      <Tabs defaultValue="production" className="space-y-4">
        <TabsList>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Ordens de Produção
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Ordens de Serviço
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsProductionDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Ordem de Produção
            </Button>
          </div>
          
          <BaseTable
            data={productionOrders || []}
            columns={productionColumns}
            actions={productionActions}
            loading={productionLoading}
          />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsServiceDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Ordem de Serviço
            </Button>
          </div>
          
          <BaseTable
            data={serviceOrders || []}
            columns={serviceColumns}
            actions={serviceActions}
            loading={serviceLoading}
          />
        </TabsContent>
      </Tabs>

      <ProductionOrderDialog
        open={isProductionDialogOpen}
        onOpenChange={setIsProductionDialogOpen}
        order={selectedOrder}
      />

      <ServiceOrderDialog
        open={isServiceDialogOpen}
        onOpenChange={setIsServiceDialogOpen}
        order={selectedOrder}
      />
    </div>
  );
}
