import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Warehouse, History, ArrowUpDown } from "lucide-react";
import { useStockMovements } from "@/hooks/useStockMovements";
import { useWarehouses } from "@/hooks/useWarehouses";
import { StockMovementDialog } from "@/components/Stock/StockMovementDialog";
import { WarehouseDialog } from "@/components/Stock/WarehouseDialog";
import { formatCurrency } from "@/lib/utils";

export default function Estoque() {
  const { movements, isLoading: isLoadingMovements, createMovement } = useStockMovements();
  const { warehouses, isLoading: isLoadingWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses();
  
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const getMovementTypeColor = (type: string) => {
    const colors = {
      entrada: 'bg-green-100 text-green-800',
      saida: 'bg-red-100 text-red-800',
      transferencia: 'bg-blue-100 text-blue-800',
      ajuste: 'bg-yellow-100 text-yellow-800',
      venda: 'bg-purple-100 text-purple-800',
      compra: 'bg-indigo-100 text-indigo-800',
      producao: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoadingMovements || isLoadingWarehouses) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Controle de Estoque</h1>
            <p className="text-muted-foreground">Gerencie movimentações e depósitos</p>
          </div>
        </div>

        <Tabs defaultValue="movements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Movimentações
            </TabsTrigger>
            <TabsTrigger value="warehouses" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Depósitos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Movimentações de Estoque</h2>
              <Button onClick={() => setMovementDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Movimentação
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Histórico de Movimentações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Estoque Anterior</TableHead>
                      <TableHead>Estoque Atual</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                   <TableBody>
                     {(movements || []).filter((m: any) => m && m.id).map((movement: any) => (
                       <TableRow key={movement.id}>
                         <TableCell>
                           {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                         </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">Produto #{movement.product_id}</div>
                              <div className="text-sm text-muted-foreground">ID: {movement.product_id}</div>
                            </div>
                          </TableCell>
                         <TableCell>
                           <Badge className={getMovementTypeColor(movement.movement_type)}>
                             {movement.movement_type}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-center">
                           <span className={movement.movement_type === 'saida' ? 'text-red-600' : 'text-green-600'}>
                             {movement.movement_type === 'saida' ? '-' : '+'}{movement.quantity}
                           </span>
                         </TableCell>
                         <TableCell className="text-center">{movement.previous_quantity}</TableCell>
                         <TableCell className="text-center">{movement.new_quantity}</TableCell>
                         <TableCell>
                           {movement.total_cost ? formatCurrency(movement.total_cost) : '-'}
                         </TableCell>
                         <TableCell className="max-w-xs truncate">
                           {movement.reason || '-'}
                         </TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
                </Table>
                {!movements?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma movimentação encontrada
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Depósitos</h2>
              <Button onClick={() => setWarehouseDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Depósito
              </Button>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {(warehouses || []).filter((w: any) => w && w.id).map((warehouse: any) => (
                 <Card key={warehouse.id} className="cursor-pointer hover:shadow-md transition-shadow">
                   <CardHeader>
                     <CardTitle className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Warehouse className="h-5 w-5" />
                         {warehouse.name}
                       </div>
                       <div className="flex gap-1">
                         {warehouse.is_default && (
                           <Badge variant="secondary">Padrão</Badge>
                         )}
                         <Badge variant={warehouse.is_active ? "default" : "secondary"}>
                           {warehouse.is_active ? "Ativo" : "Inativo"}
                         </Badge>
                       </div>
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     {warehouse.description && (
                       <p className="text-sm text-muted-foreground mb-2">
                         {warehouse.description}
                       </p>
                     )}
                     {warehouse.address && (
                       <p className="text-sm text-muted-foreground">
                         <strong>Endereço:</strong> {warehouse.address}
                       </p>
                     )}
                     <div className="flex justify-end mt-4">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           setSelectedWarehouse(warehouse);
                           setWarehouseDialogOpen(true);
                         }}
                       >
                         Editar
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               ))}
            </div>

            {!warehouses?.length && (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum depósito cadastrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro depósito para começar a controlar o estoque
                  </p>
                  <Button onClick={() => setWarehouseDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Depósito
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <StockMovementDialog
          open={movementDialogOpen}
          onOpenChange={setMovementDialogOpen}
          onSubmit={createMovement}
        />

        <WarehouseDialog
          open={warehouseDialogOpen}
          onOpenChange={(open) => {
            setWarehouseDialogOpen(open);
            if (!open) setSelectedWarehouse(null);
          }}
          onSubmit={(data) => {
            if (selectedWarehouse) {
              updateWarehouse({ id: selectedWarehouse.id, data });
            } else {
              createWarehouse(data);
            }
          }}
          initialData={selectedWarehouse}
        />
      </div>
    </MainLayout>
  );
}