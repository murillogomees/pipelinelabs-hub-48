import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { ContractDialog } from "@/components/Contracts/ContractDialog";
import { formatCurrency } from "@/lib/utils";

export default function Contratos() {
  const { contracts, isLoading, createContract, updateContract, deleteContract } = useContracts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-red-100 text-red-800',
      renewed: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Rascunho',
      active: 'Ativo',
      expired: 'Expirado',
      terminated: 'Cancelado',
      renewed: 'Renovado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    return type === 'cliente' ? 'Cliente' : 'Fornecedor';
  };

  // Filter valid contracts and calculate statistics
  const validContracts = (contracts || []).filter((c: any) => c && c.id) as any[];
  
  const stats = {
    total: validContracts.length,
    active: validContracts.filter(c => c.status === 'active').length,
    expiring: validContracts.filter(c => {
      const endDate = new Date(c.end_date);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      return endDate >= now && endDate <= thirtyDaysFromNow;
    }).length,
    totalValue: validContracts.reduce((sum, c) => sum + (c.contract_value || 0), 0),
  };

  if (isLoading) {
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
            <h1 className="text-3xl font-bold">Gestão de Contratos</h1>
            <p className="text-muted-foreground">Gerencie contratos com clientes e fornecedores</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expirando em 30 dias</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.expiring}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Contratos */}
        <Card>
          <CardHeader>
            <CardTitle>Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente/Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Término</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
               <TableBody>
                 {validContracts.map((contract: any) => (
                   <TableRow key={contract.id}>
                     <TableCell className="font-medium">
                       {contract.contract_number}
                     </TableCell>
                     <TableCell>
                       <div>
                         <div className="font-medium">{contract.title}</div>
                         {contract.description && (
                           <div className="text-sm text-muted-foreground max-w-xs truncate">
                             {contract.description}
                           </div>
                         )}
                       </div>
                     </TableCell>
                     <TableCell>
                       <Badge variant="outline">
                         {getTypeLabel(contract.contract_type)}
                       </Badge>
                     </TableCell>
                      <TableCell>
                        {contract.contract_type === 'cliente' ? 'Cliente' : 'Fornecedor'}
                      </TableCell>
                     <TableCell>
                       <Badge className={getStatusColor(contract.status)}>
                         {getStatusLabel(contract.status)}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       {new Date(contract.start_date).toLocaleDateString('pt-BR')}
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center">
                         {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                         {(() => {
                           const endDate = new Date(contract.end_date);
                           const now = new Date();
                           const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
                           return endDate >= now && endDate <= thirtyDaysFromNow ? (
                             <AlertCircle className="h-4 w-4 ml-1 text-orange-500" />
                           ) : null;
                         })()}
                       </div>
                     </TableCell>
                     <TableCell>
                       {formatCurrency(contract.contract_value)}
                     </TableCell>
                     <TableCell>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => {
                           setSelectedContract(contract);
                           setDialogOpen(true);
                         }}
                       >
                         Editar
                       </Button>
                     </TableCell>
                   </TableRow>
                 ))}
              </TableBody>
            </Table>
            {!validContracts.length && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum contrato encontrado</h3>
                <p className="mb-4">Crie seu primeiro contrato para começar a gerenciar</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Contrato
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <ContractDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedContract(null);
          }}
          onSubmit={(data) => {
            if (selectedContract) {
              updateContract({ id: selectedContract.id, data });
            } else {
              createContract(data);
            }
          }}
          initialData={selectedContract}
        />
      </div>
    </MainLayout>
  );
}